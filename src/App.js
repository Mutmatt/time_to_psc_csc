import React, { Component } from 'react';

import './App.css';

const THROMBECTOMY = 'Thrombectomy';
const ALTEPLASE = 'IV Alteplase';

class App extends Component {
    constructor(props, context) {
    super(props, context);
    this.handleTabClick = this.handleTabClick.bind(this);
    this.state = {
      cscNeedle: 30,
      pscNeedle: 30,
      ttPsc: 15,
      ttCsc: 45,
      tab: ALTEPLASE,
      ttBetween: 0//if tab === ALTEPLASE
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

  handleBetween = (html) => {
    this.setState({ ttBetween: html.target.value });
  }

  makeHospitalChoice = () => {
    const tc = parseInt(this.state.ttCsc, 10);
    const tp = parseInt(this.state.ttPsc, 10);
    const tbetween = parseInt(this.state.ttBetween, 10);

    const nc = parseInt(this.state.cscNeedle, 10);
    const np = parseInt(this.state.pscNeedle, 10);
    
    if ((tc + nc) > (tp + np + tbetween)) {
      return 'You should go to the Primary Stroke Center';
    } else {
      return 'You should go to the Comprehensive Stroke Center';
    }
  }

  handleTabClick = (e) => {
    const activeTab = e.target.name
    e.preventDefault();
    if (activeTab === ALTEPLASE) {
      this.setState({ ttBetween: 0 });
    } else {
      this.setState({ ttBetween: 30 });
    }
    this.setState({ tab: e.target.name });
  }

  renderSection(name, rangeMessage1, rangeMessage2) {
    let { tab, cscNeedle, pscNeedle, ttPsc, ttCsc, ttBetween } = this.state;
    if (tab !== name) {
      return;
    }
    
    return (
      <div> 
        <div className="row">
          <label className="col-sm-12 display-2 text-center">Time to {tab}</label>
        </div>
        <form>
          <div className="row">
            <div className={"col-sm-" + (ttBetween === 0 ? '6' : '4')}>
              <div className="form-group">
                <label htmlFor="time-to-psc"><br/>Time to Primary Stroke Center</label>
                <input className="form-control" type="number" name="time-to-psc" id="time-to-psc" value={ttPsc} onChange={this.handleTtPsc}/>
              </div>
            </div>
            
            <div className={"col-sm-" + (ttBetween === 0 ? '6' : '4')}>
              <div className="form-group">
                <label htmlFor="time-to-csc"><br/>Time to Comprehensive Stroke Center</label>
                <input className="form-control" type="number" name="time-to-csc" id="time-to-csc" value={ttCsc} onChange={this.handleTtCsc}/>
              </div>
            </div>
          

            <div className={"col-sm-" + (ttBetween === 0 ? ' d-none' : '4')}>
              <div className="form-group">
                <label htmlFor="time-between">Time from Primary Stroke Center to Comprehensive Stroke Center</label>
                <input className="form-control" type="number" name="time-between" id="time-between" value={ttBetween} onChange={this.handleBetween}/>
              </div>
            </div>
          </div>

          <div className="form-group row">
            <label className={"col-sm-12 display-3 text-center " + (ttBetween !== 0 ? 'd-none' : '')}>Time to Needle</label>
            <label htmlFor="pscNeedle">{rangeMessage1} <strong>{pscNeedle}</strong></label>
            <input type="range" min={1} max={120} className="form-control-range" id="pscNeedle" value={pscNeedle} onChange={this.handlePscNeedle}></input>
            <label htmlFor="cscNeedle">{rangeMessage2} <strong>{cscNeedle}</strong></label>
            <input type="range" min={1} max={120} className="form-control-range" id="cscNeedle" value={cscNeedle} onChange={this.handleCscNeedle}></input>
          </div>

          <div className="form-group row">
            <label className="display-4 col-sm-8">Total time to {tab} if</label>
            <div className="form-group col-sm-4">
              <label>PSC First: <strong>{parseInt(this.state.pscNeedle, 10) + parseInt(this.state.ttPsc, 10) + parseInt(this.state.ttBetween, 10)}</strong></label><br/>
              <label>CSC First: <strong>{parseInt(this.state.cscNeedle, 10) + parseInt(this.state.ttCsc, 10)}</strong></label>
            </div>
          </div>

          <div className="form-group row">
            <label className="display-3 text-center alert alert-dark">{this.makeHospitalChoice()}</label>
          </div>
        </form>
      </div>
    );
  }

  render() {    
    let { tab } = this.state;
    return (
      <div>
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="collapse navbar-collapse">
            <span className="navbar-brand">Time to Treatment</span>
            <div className="navbar-nav">
              <a className={"nav-item nav-link " + (tab === ALTEPLASE ? 'active': '')} name={ALTEPLASE} href="#" onClick={this.handleTabClick}>IV Alteplase</a>
              <a className={"nav-item nav-link " + (tab === THROMBECTOMY ? 'active': '')} name={THROMBECTOMY} href="#" onClick={this.handleTabClick}>Thrombectomy</a>
            </div>
          </div>
        </nav>
        {this.renderSection(ALTEPLASE, 'Primary Stroke Center:', 'Comprehensive Stroke Center:')}
        {this.renderSection(THROMBECTOMY, 'PSC Door in, Door out:', 'CSC time to CTA:')}
      </div>
    );
  }
}

export default App;
