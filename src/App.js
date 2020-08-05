import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

import StrokeTreatment from './StrokeTreatment';
import LocationHandler from './LocationHandler';
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
      return (<div className="row" style={{height:'50em'}}><div className="mx-auto" style={{paddingTop: '40%'}}><FontAwesomeIcon icon={faSpinner} spin size="10x"/></div></div>);
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
