import React, { Component } from 'react';

import './App.css';

class App extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      cscNeedle: 50,
      pscNeedle: 50,
      ttPsc: 10,
      ttCsc: 10
    };
  }

  handlePscNeedle = (html) => {
    this.setState({ pscNeedle: html.target.value });
  };

  handleCscNeedle = (html) => {
    this.setState({ cscNeedle: html.target.value });
  };

  handleTtPsc = (html) => {
    this.setState({ ttPsc: html.target.value });
  };

  handleTtCsc = (html) => {
    this.setState({ ttCsc: html.target.value });
  };

  makeHospitalChoice = () => {
    const tc = parseInt(this.state.ttCsc, 10);
    const tp = parseInt(this.state.ttPsc, 10);
    const nc = parseInt(this.state.cscNeedle, 10);
    const np = parseInt(this.state.pscNeedle, 10);
    if ((tc + nc) > (tp + np)) {
      return 'You should go to the Primary Stroke Center';
    } else if ((tc + nc) < (tp + np)) {
      return 'You should go to the Comprehensive Stroke Center';
    } else {
      return 'Please enter or change the data';
    }
  }
  /*handleOnChange = (value) => {
    this.setState({
      //volume: value
    });
  }*/

  render() {
    let { cscNeedle, pscNeedle, ttPsc, ttCsc } = this.state
    return (
      <div className="container">
        <div className="row">
          <label className="display-2 text-center">Time-to-PSC/CSC Calculator</label>
        </div>
        <form>
          <div className="row">
            <div className="col-sm-6">
              <div className="form-group">
                <label htmlFor="time-to-psc">Time to Primary Stroke Center</label>
                <input className="form-control" type="number" name="time-to-psc" id="time-to-psc" value={ttPsc} onChange={this.handleTtPsc}/>
              </div>
            </div>
            
            <div className="col-sm-6">
              <div className="form-group">
                <label htmlFor="time-to-csc">Time to Comprehensive Stroke Center</label>
                <input className="form-control" type="number" name="time-to-csc" id="time-to-csc" value={ttCsc} onChange={this.handleTtCsc}/>
              </div>
            </div>
          </div>

          <div className="form-group row">
            <label className="col-sm-12 display-3 text-center">Time-to-Needle</label>
            <label htmlFor="pscNeedle" value={pscNeedle}>Primary Stroke Center: <strong>{pscNeedle}</strong></label>
            <input type="range" className="form-control-range" id="pscNeedle" onChange={this.handlePscNeedle}></input>
            <label htmlFor="pscNeedle">Comprehensive Stroke Center: <strong>{cscNeedle}</strong></label>
            <input type="range" className="form-control-range" id="cscNeedle" onChange={this.handleCscNeedle}></input>
          </div>

          <div className="form-group row">
            <label className="display-2 text-center">{this.makeHospitalChoice()}</label>
          </div>
        </form>
      </div>
    );
  }
}

export default App;
