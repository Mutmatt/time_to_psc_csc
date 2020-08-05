import React, { Component } from 'react';
import StrokeTreatment from './StrokeTreatment';
import LocationHandler from './LocationHandler';
import * as fa from '@fortawesome/fontawesome-svg-core';
import { observer } from "mobx-react"

import './App.css';

export const THROMBECTOMY = 'Thrombectomy';
export const ALTEPLASE ='IV Alteplase';

const App = observer(class App extends Component {
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
    let { tab, loading } = this.state;

    if (loading) {
      return ( <div>{fa.icon('spinner')}</div>);
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
              secondaryTimeToMessage='time to tPA'
              cscList={this.locationHandler.comprehensiveStrokeCenters}
              pscList={this.locationHandler.primaryStrokeCenters} />
            : null }
        { tab === THROMBECTOMY ? 
            <StrokeTreatment 
              type={THROMBECTOMY} 
              title='Arterial Puncture'
              rangeMessages={['PSC Door-in-Door-out Time:', 'CSC Door-to-Arterial Puncture Time:']}
              secondaryTimeToMessage='time to puncture'
              timeBetween={this.locationHandler.timeBetween}
              cscList={this.locationHandler.comprehensiveStrokeCenters}
              pscList={this.locationHandler.primaryStrokeCenters} />
            : null }
      </div>
    );
  }
});

export default App;
