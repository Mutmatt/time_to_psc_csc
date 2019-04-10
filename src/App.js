import React, { Component } from 'react';

import './App.css';

const THROMBECTOMY = 'Thrombectomy';
const ALTEPLASE = 'IV Alteplase';
const PscText = 'You should go to the Primary Stroke Center';
const CpcText = 'You should go to the Comprehensive Stroke Center';

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
      ttBetween: 0,//if tab === ALTEPLASE,
      cpc: false,
      decisionText: PscText
    };
  }

  handleChange = (html) => {
    this.setState({ [html.target.name]: html.target.value });
    this.triggerHospitalChange();
  };

  triggerHospitalChange = () => {
    const tc = parseInt(this.state.ttCsc, 10);
    const tp = parseInt(this.state.ttPsc, 10);
    const tbetween = parseInt(this.state.ttBetween, 10);

    const nc = parseInt(this.state.cscNeedle, 10);
    const np = parseInt(this.state.pscNeedle, 10);
    
    if ((tc + nc) > (tp + np + tbetween)) {
      this.setState({ isCpc: false });
      this.setState({ decisionText:  PscText });
    } else {
      this.setState({ isCpc: true });
      this.setState({ decisionText: CpcText });
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

  renderSection(name, title, rangeMessage1, rangeMessage2) {
    let { tab, cscNeedle, pscNeedle, ttPsc, ttCsc, ttBetween, isCpc } = this.state;
    if (tab !== name) {
      return;
    }
    
    return (
      <div> 
        <div className="row">
          <label className="col-12 display-4 text-center">Time to {title}</label>
        </div>
        <form>
          <div className="row">
            <div className={"col-" + (ttBetween === 0 ? '6' : '4')}>
              <div className="form-group">
                <label htmlFor="time-to-psc"><br/>Time to Primary Stroke Center</label>
                <input className="form-control" type="number" name="ttPsc" id="time-to-psc" value={ttPsc} onChange={this.handleChange}/>
              </div>
            </div>
            
            <div className={"col-" + (ttBetween === 0 ? '6' : '4')}>
              <div className="form-group">
                <label htmlFor="time-to-csc"><br/>Time to Comprehensive Stroke Center</label>
                <input className="form-control" type="number" name="ttCsc" id="time-to-csc" value={ttCsc} onChange={this.handleChange}/>
              </div>
            </div>
          

            <div className={"col-" + (ttBetween === 0 ? ' d-none' : '4')}>
              <div className="form-group">
                <label htmlFor="time-between">Time from Primary Stroke Center to Comprehensive Stroke Center</label>
                <input className="form-control" type="number" name="ttBetween" id="time-between" value={ttBetween} onChange={this.handleChange}/>
              </div>
            </div>
          </div>

          <div className={(ttBetween !== 0 ? ' d-none' : '')}>
            <div className="row">
              <div className="col-12 text-center">
                <h4>Time to Needle</h4>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="pscNeedle">{rangeMessage1} <strong>{pscNeedle}</strong></label>
            <input type="range" min={1} max={120} className="form-control-range" id="pscNeedle" name="pscNeedle" value={pscNeedle} onChange={this.handleChange}></input>
            <label htmlFor="cscNeedle">{rangeMessage2} <strong>{cscNeedle}</strong></label>
            <input type="range" min={1} max={120} className="form-control-range" id="cscNeedle" name="cscNeedle" value={cscNeedle} onChange={this.handleChange}></input>
          </div>

          <div className="form-group ">
            <div className="row align-items-center">
              <div className="col-6">
                  <span>Total time to {title} if</span>
              </div>
              <div className="col-6">
                <span>PSC First: <strong>{parseInt(this.state.pscNeedle, 10) + parseInt(this.state.ttPsc, 10) + parseInt(this.state.ttBetween, 10)}</strong></span><br/>
                <span>CSC First: <strong>{parseInt(this.state.cscNeedle, 10) + parseInt(this.state.ttCsc, 10)}</strong></span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className={"display-4 col-12 text-center alert alert-" + (isCpc ? 'danger' : 'dark')}>{this.state.decisionText}</label>
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
        {this.renderSection(ALTEPLASE, 'IV Alteplase', 'Primary Stroke Center:', 'Comprehensive Stroke Center:')}
        {this.renderSection(THROMBECTOMY, 'Arterial Puncture', 'PSC Door in, Door out:', 'CSC time to CTA:')}
      </div>
    );
  }
}

export default App;
