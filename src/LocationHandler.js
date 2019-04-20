import request from "request-promise-native";
import cheerio from "cheerio";

class LocationHandler {
  comprehensiveStrokeCenters = [];
  primaryStrokeCenters = [];
  constructor() {
    if (navigator.geolocation) {
      this.geo = navigator.geolocation;
    }
  }


  async getComprehensiveCenters() {
    this.comprehensiveStrokeCenters = sessionStorage.getItem('psc');
    if (this.comprehensiveStrokeCenters) {
      return this.comprehensiveStrokeCenters;
    }
    await this.downloadNewList();
  }

  async getPrimaryCenters() {
    if (this.primaryStrokeCenters) {
      this.primaryStrokeCenters = sessionStorage.getItem('psc');
      return this.primaryStrokeCenters;
    }
    await this.downloadNewList();
  }

  async downloadNewList() {
    var options = {
      uri: 'https://www.health.state.mn.us/diseases/cardiovascular/stroke/designationlist.html',
      transform: (body) => {
        return cheerio.load(body);
      }
    };
    var body = await request(options);
    var csc = body.find('h2:contains("Comprehensive Stroke Center")').next('ol').children();
    csc.map((item) => {
      //for some reason they have a multi-part string for a hospital -_- (e.g. Mayo Clinic Hospital – Rochester, Saint Mary’s Campus – Rochester)
      // We want ["Mayo Clinic Hospital, Saint Mary’s Campus", "Rochester"]
      if ((item.innerHTML.match(/–/, "g") || []).length > 1) {
        var csc = item.innerHTML.split('-');
        csc[1].replace(/.*, / ,'');
        csc[0] = csc[0] + csc[1];
        csc.splice(1, 1);
      }
      return { hospitalName: csc.innerHTML.split('–').trim();
    })
  }
}

export default LocationHandler;