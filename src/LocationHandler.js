import axios from "axios";
import cheerio from "cheerio";
import _ from "lodash";
import { Loader } from 'google-maps';
import { observable } from "mobx";
import { promisify } from 'util';


const options = {/* todo */};
const googleMapsLoader = new Loader(process.env.REACT_APP_MAPS_API_KEY, options);

class LocationHandler { 
  constructor() {
    this.downloadNewList = this.downloadNewList.bind(this);
    this.getLocation = this.getLocation.bind(this);
    this.hasCsc = this.hasCsc.bind(this);
    this.hasPsc = this.hasPsc.bind(this);
  }

  comprehensiveStrokeCenters = observable([]);
  primaryStrokeCenters = observable([]);
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
      this.comprehensiveStrokeCenters.replace(sessionStorage.getItem('csc'));
    }
    return !!this.comprehensiveStrokeCenters;
  }

  hasPsc() {
    if (!this.primaryStrokeCenters) {
      this.primaryStrokeCenters.replace(sessionStorage.getItem('psc'));
    }
    return !!this.primaryStrokeCenters;
  }

  async downloadNewList() {
    if ((this.position.longitude === 0 && this.position.latitude === 0) || !this.position) {
      this.setUserPosition(await this.getLocation());
    }

    const mdhList = await axios({ url: `https://api.codetabs.com/v1/proxy?quest=https://www.health.state.mn.us/diseases/cardiovascular/stroke/designationlist.html` });

    const body = cheerio.load(mdhList.data);

    const csc = body('h2:contains("Comprehensive Stroke Center")').next('ol').children('li');
    _.forEach(csc, (item) => {
      this.comprehensiveStrokeCenters.push(observable(this.parseHospital(item)));
    });
    const psc = body('h2:contains("Primary Stroke Centers")').next('ol').children('li');
    _.forEach(psc, (item) => { 
      this.primaryStrokeCenters.push(observable(this.parseHospital(item)));
    });

    const google = await googleMapsLoader.load();
    const matrixService = new google.maps.DistanceMatrixService();
    const getDistanceMatrix = promisify(matrixService.getDistanceMatrix);
    const userPosition = this.position;

    try{
    const cscResponse = await getDistanceMatrix(
      { origins: [ userPosition ],
        destinations: this.comprehensiveStrokeCenters.map((csc) => `${csc.name} ${csc.city}` ),
        travelMode: 'DRIVING',
    });
    const sortedCsc = this.parseDistanceMatrixResults(this.comprehensiveStrokeCenters, cscResponse);
    this.comprehensiveStrokeCenters.replace(sortedCsc);
  } catch (e) {
    const sortedCsc = this.parseDistanceMatrixResults(this.comprehensiveStrokeCenters, e);
    this.comprehensiveStrokeCenters.replace(sortedCsc);
  }

  try {
    const pscResponse = await getDistanceMatrix(
      { origins: [ userPosition ],
        destinations: this.primaryStrokeCenters.map((psc) => `${psc.name} ${psc.city}` ),
        travelMode: 'DRIVING',
      });
    const sortedPsc = this.parseDistanceMatrixResults(this.primaryStrokeCenters, pscResponse);
    this.primaryStrokeCenters.replace(sortedPsc);
  } catch (e) {
    const sortedPsc = this.parseDistanceMatrixResults(this.primaryStrokeCenters, e);
    this.primaryStrokeCenters.replace(sortedPsc);
  }

  try {
    const timeBetweenResponse = await getDistanceMatrix(
      { origins: [ `${this.primaryStrokeCenters[0].name} ${this.primaryStrokeCenters[0].city}` ],
        destinations: [ `${this.comprehensiveStrokeCenters[0].name} ${this.comprehensiveStrokeCenters[0].city}` ],
        travelMode: 'DRIVING',
      });
    this.timeBetween = this.parseDistanceMatrixResults([{}], timeBetweenResponse)[0].timeTo;
  } catch (e) {
    this.timeBetween = this.parseDistanceMatrixResults([{}], e)[0].timeTo;
  }

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

  parseHospital(item) {
    //for some reason they have a multi-part string for a hospital -_- (e.g. Mayo Clinic Hospital – Rochester, Saint Mary’s Campus – Rochester)
    // We want ["Mayo Clinic Hospital, Saint Mary’s Campus", "Rochester"]
    const listItem = item.children[0].data;
    
    const properSplit = listItem.replace(/[â–]/g, '-');
    // eslint-disable-next-line
    const cleanItem = properSplit.replace(/[^\x00-\x7F]/g, "");
    const hospital = cleanItem.split('-');
    if (hospital.length === 3) {
      const newHospitalName = hospital[1].replace(/.*, / ,'');
      hospital[0] = hospital[0] + newHospitalName;
      hospital.splice(1, 1);
    }

    return { name: hospital[0].trim(), city: hospital[1].trim() };
  }
}

export default LocationHandler;