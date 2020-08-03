import rp from "request-promise-native";
import cheerio from "cheerio";
import _ from "lodash";
import { Loader } from 'google-maps';
import { observable } from "mobx";

const options = {/* todo */};
const googleMapsLoader = new Loader(process.env.REACT_APP_MAPS_API_KEY, options);

class LocationHandler { 
  @observable
  comprehensiveStrokeCenters = [];
  @observable
  primaryStrokeCenters = [];
  position = { latitude: 0, longitude: 0 };
  geo;
  timeBetween;

  async getLocation(options) {
    return new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition((position) => {
        resolve(position);
      });
    });
  }

  setUserPosition(position) {
    this.position = { lat: position.coords.latitude, lng: position.coords.longitude };
  }

  hasCsc() {
    if (!this.comprehensiveStrokeCenters) {
      this.comprehensiveStrokeCenters = sessionStorage.getItem('csc')
    }
    return !!this.comprehensiveStrokeCenters
  }

  hasPsc() {
    if (!this.primaryStrokeCenters) {
      this.primaryStrokeCenters = sessionStorage.getItem('psc')
    }
    return !!this.primaryStrokeCenters
  }

  async getComprehensiveCenters() {
    if (!this.hasCsc()) {
      await this.downloadNewList();
    }
    return this.comprehensiveStrokeCenters;
  }

  async getPrimaryCenters() {
    if (!this.hasPsc()) {
      await this.downloadNewList();
    }
    return this.primaryStrokeCenters;
  }

  async downloadNewList() {
    if ((this.position.longitude === 0 && this.position.latitude === 0) || !this.position) {
      this.setUserPosition(await this.getLocation());
    }

    this.comprehensiveStrokeCenters = [];
    this.primaryStrokeCenters = [];
    var options = {
      uri: `${window.location.href}/mn-designationlist.html`,
      transform: (body) => {
        return cheerio.load(body);
      }
    };
    var body = await rp(options);
    var csc = body('h2:contains("Comprehensive Stroke Center")').next('ol').children('li');
    _.forEach(csc, (item) => {
      this.comprehensiveStrokeCenters.push(this.parseHospital(item));
    });
    var psc = body('h2:contains("Primary Stroke Centers")').next('ol').children('li');
    _.forEach(psc, (item) => { 
      this.primaryStrokeCenters.push(this.parseHospital(item));
    });

    // https://www.google.com/maps/d/u/0/viewer?mid=16llc7z5JmGIpyitiD1Rwlj2EHO-ICVLE&ll=44.35535936040851%2C-91.78517428373243&z=7

    const google = await googleMapsLoader.load();
    const matrixService = new google.maps.DistanceMatrixService();
    const userPosition = this.position;

    await matrixService.getDistanceMatrix(
      { origins: [ userPosition ],
        destinations: this.comprehensiveStrokeCenters.map((csc) => `${csc.name} ${csc.city}` ),
        travelMode: 'DRIVING',
      }, (response) => {
        console.log("$$$$$ CSC B4", this.comprehensiveStrokeCenters[0], this.comprehensiveStrokeCenters[this.comprehensiveStrokeCenters.length-1]);
        this.comprehensiveStrokeCenters = this.parseDistanceMatrixResults(this.comprehensiveStrokeCenters, response);
        console.log("$$$$$ CSC A2", this.comprehensiveStrokeCenters[0], this.comprehensiveStrokeCenters[this.comprehensiveStrokeCenters.length-1]);
      });

    await matrixService.getDistanceMatrix(
      { origins: [ userPosition ],
        destinations: this.primaryStrokeCenters.map((psc) => `${psc.name} ${psc.city}` ),
        travelMode: 'DRIVING',
      }, (response) => {
        console.log("$$$$$ PSC B4", this.primaryStrokeCenters[0], this.primaryStrokeCenters[this.primaryStrokeCenters.length-1]);
        this.primaryStrokeCenters = this.parseDistanceMatrixResults(this.primaryStrokeCenters, response);
        console.log("$$$$$ PSC A2", this.primaryStrokeCenters[0], this.primaryStrokeCenters[this.primaryStrokeCenters.length-1]);
      });

    await matrixService.getDistanceMatrix(
      { origins: [ `${this.primaryStrokeCenters[0].name} ${this.primaryStrokeCenters[0].city}` ],
        destinations: [ `${this.comprehensiveStrokeCenters[0].name} ${this.comprehensiveStrokeCenters[0].city}` ],
        travelMode: 'DRIVING',
      }, (response) => {
        
        this.timeBetween = this.parseDistanceMatrixResults([{}], response)[0].timeTo;
      });

    sessionStorage.setItem('csc', this.comprehensiveStrokeCenters);
    sessionStorage.setItem('psc', this.primaryStrokeCenters);
    return;
  }

  parseDistanceMatrixResults(hospitalList, response) {
    _.forEach(response.rows[0].elements, (matrixItem, index) => {
      if (matrixItem.status === 'OK') {
        hospitalList[index].timeTo = Math.round(matrixItem.duration.value / 60);//seconds to minutes and round
        hospitalList[index].timeToText = matrixItem.duration.text;
        hospitalList[index].timeToDistance = matrixItem.distance.text;
      } else {
        hospitalList[index].timeTo = 99999999;
        hospitalList[index].timeToText = "Failed Request";
        hospitalList[index].timeToDistance = "Failed Request";
      }
    });
    const sortedList = _.orderBy(hospitalList, 'timeTo', 'asc');
    return sortedList;
  }

  getClosest(hospitalList) {
    var closest = { longitude: -1, latitude: -1, overall: -1, index: -1 };
    hospitalList.forEach((hospital, index) => {
      if (hospital.location) {
        var longDelta = Math.abs(this.position.longitude - hospital.location.longitude);
        var latDelta = Math.abs(this.position.latitude - hospital.location.latitude);
        if (longDelta + latDelta < closest.overall
            || closest.overall === -1) {
           closest = { 
            longitude: longDelta,
            latitude: latDelta,
            overall: (longDelta + latDelta),
            index: index,
            hospital: hospital
          };
        }
      }
    });
    return closest;
  }


  parseHospital(item) {
    //for some reason they have a multi-part string for a hospital -_- (e.g. Mayo Clinic Hospital – Rochester, Saint Mary’s Campus – Rochester)
    // We want ["Mayo Clinic Hospital, Saint Mary’s Campus", "Rochester"]
    var listItem = item.children[0].data;
    listItem = listItem.replace('[â–]', '-');
    // eslint-disable-next-line
    listItem = listItem.replace(/[^\x00-\x7F]/g, "");
    var hospital = listItem.split('-');
    if (hospital.length === 3) {
      var newHospitalName = hospital[1].replace(/.*, / ,'');
      hospital[0] = hospital[0] + newHospitalName;
      hospital.splice(1, 1);
    }
    hospital[0] = hospital[0].trim();
    hospital[1] = hospital[1].trim();

    return { name: hospital[0], city: hospital[1] };
  }
}

export default LocationHandler;