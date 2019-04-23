import React, { Component } from 'react';
import StrokeTreatment from './StrokeTreatment';
import LocationHandler from './LocationHandler';

import './App.css';

export const THROMBECTOMY = 'Thrombectomy';
export const ALTEPLASE ='IV Alteplase';

class App extends Component {
  constructor(props, context) {
    super(props, context);
    this.handleTabClick = this.handleTabClick.bind(this);
    this.state = {
      tab: ALTEPLASE,
      cscs: [],
      pscs: [],
      timeBetween: -1,
      loading: true
    };
    this.locationHandler = new LocationHandler();
    if (this.locationHandler.hasCsc() || !this.locationHandler.hasPsc()) {
      this.locationHandler.downloadNewList().then(() => {
        this.setState({
          tab: ALTEPLASE,
          cscs: this.locationHandler.comprehensiveStrokeCenters,
          pscs: this.locationHandler.primaryStrokeCenters,
          timeBetween: this.locationHandler.timeBetween,
          loading: false
        });
      });
    }
    

  }

  handleTabClick = (e) => {
    e.preventDefault();
    this.setState({ tab: e.target.name });
  }

  render() {    
    let { tab, cscs, pscs, timeBetween, loading } = this.state;
    let timeToCsc, timeToPsc, cscName, pscName;
    if (cscs.length > 0 && pscs.length > 0) {
      timeToCsc = cscs[0].timeTo;
      timeToPsc = pscs[0].timeTo;
      cscName = cscs[0].name + ' ' + cscs[0].city;
      pscName = pscs[0].name + ' ' + pscs[0].city;
    }
    
    if (loading) {
      return ( <div>Spinner here</div>);
    }

    return (
      <div className="mt-1">
        <nav className="nav nav-tabs">
          <a className={"nav-item nav-link " + (tab === ALTEPLASE ? 'active': '')} name={ALTEPLASE} href="#/" onClick={this.handleTabClick}>IV Alteplase</a>
          <a className={"nav-item nav-link " + (tab === THROMBECTOMY ? 'active': '')} name={THROMBECTOMY} href="#/" onClick={this.handleTabClick}>Thrombectomy</a>
        </nav>
        { tab === ALTEPLASE ? 
            <StrokeTreatment 
              type={ALTEPLASE} 
              title='IV Alteplase' 
              rangeMessages={['PSC Door-to-Needle Time:', 'CSC Door-to-Needle Time:']} 
              timeToCsc={timeToCsc}
              timeToPsc={timeToPsc}
              cscName={cscName}
              pscName={pscName} />
            : null }
        { tab === THROMBECTOMY ? 
            <StrokeTreatment 
              type={THROMBECTOMY} 
              title='Arterial Puncture'
              rangeMessages={['PSC Door-in-Door-out Time:', 'CSC Door-to-Arterial Puncture Time:']} 
              timeToCsc={timeToCsc}
              timeToPsc={timeToPsc}
              cscName={cscName}
              pscName={pscName}
              timeBetween={timeBetween} />
            : null }
      </div>
    );
  }
}

export default App;
