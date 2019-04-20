import React, { Component } from 'react';
import StrokeTreatment from './StrokeTreatment';

import './App.css';

export const THROMBECTOMY = 'Thrombectomy';
export const ALTEPLASE ='IV Alteplase';

class App extends Component {
    constructor(props, context) {
    super(props, context);
    this.handleTabClick = this.handleTabClick.bind(this);
    this.state = {
      tab: ALTEPLASE
    }
    this.locationHandler = new LocationHandler();
  }

  handleTabClick = (e) => {
    e.preventDefault();
    this.setState({ tab: e.target.name });
  }

  render() {    
    let { tab } = this.state;
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
              rangeMessages={['PSC Door-to-Needle Time:', 'CSC Door-to-Needle Time:']} />
            : null }
        { tab === THROMBECTOMY ? 
            <StrokeTreatment 
              type={THROMBECTOMY} 
              title='Arterial Puncture'
              rangeMessages={['PSC Door-in-Door-out Time:', 'CSC Door-to-Arterial Puncture Time:']} />
            : null }
      </div>
    );
  }
}

export default App;
