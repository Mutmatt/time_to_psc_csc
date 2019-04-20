import React, { Component } from 'react';
import { THROMBECTOMY, ALTEPLASE } from './App';

const PscText = 'You should go to the Primary Stroke Center';
const CscText = 'You should go to the Comprehensive Stroke Center';

class StrokeTreatment extends Component {
    constructor(props) {
        super(props);

        this.state = {
            cscNeedle: 30,
            pscNeedle: 30,
            ttPsc: 15,
            ttCsc: 45,
            ttBetween: props.type === ALTEPLASE ? 0 : 30,
            cpc: false,
            isCsc: true,
            decisionText: PscText
        };

        this.triggerHospitalChange('ttBetween', props.type === ALTEPLASE ? 0 : 30);//force update
    }

    handleChange = (html) => {
        this.setState({ [html.target.name]: html.target.value });
        
        this.triggerHospitalChange(html.target.name, html.target.value);
      };

    triggerHospitalChange = (changedState, value) => {
        this.state[changedState] = value;
        let { ttCsc, ttPsc, ttBetween, cscNeedle, pscNeedle } = this.state;

        const tc = parseInt(ttCsc, 10);
        const tp = parseInt(ttPsc, 10);
        const tBetween = parseInt(ttBetween, 10);

        const nc = parseInt(cscNeedle, 10);
        const np = parseInt(pscNeedle, 10);
        
        if ((tc + nc) > (tp + np + tBetween)) {
            this.setState({ isCsc: false });
            this.setState({ decisionText:  PscText });
        } else {
            this.setState({ isCsc: true });
            this.setState({ decisionText: CscText });
        }
    }

    render() {
        const { title, rangeMessages } = this.props;
        let { cscNeedle, pscNeedle, ttPsc, ttCsc, ttBetween, isCsc, decisionText } = this.state;
        
        return (
            <div> 
                <div className="row mt-3 mb-3">
                    <h2 className="col-12 text-center">Time to {title}</h2>
                </div>
                <form>
                <div className="row align-items-center">
                        <label className={"col-" + (ttBetween === 0 ? '6' : '4')} htmlFor="time-to-psc">Time to Primary Stroke Center</label>
                        <label className={"col-" + (ttBetween === 0 ? '6' : '4')} htmlFor="time-to-csc">Time to Comprehensive Stroke Center</label>
                        <label className={"col-" + (ttBetween === 0 ? ' d-none' : '4')} htmlFor="time-between">Time from Primary Stroke Center to Comprehensive Stroke Center</label>
                    </div>
        
                    <div className="row">
                    <div className={"col-" + (ttBetween === 0 ? '6' : '4')}>
                        <div className="form-group">
                        <input className="form-control" type="number" name="ttPsc" id="time-to-psc" value={ttPsc} onChange={this.handleChange}/>
                        </div>
                    </div>
                    
                    <div className={"col-" + (ttBetween === 0 ? '6' : '4')}>
                        <div className="form-group">
                        <input className="form-control" type="number" name="ttCsc" id="time-to-csc" value={ttCsc} onChange={this.handleChange}/>
                        </div>
                    </div>
                    
        
                    <div className={"col-" + (ttBetween === 0 ? ' d-none' : '4')}>
                        <div className="form-group">
                        <input className="form-control" type="number" name="ttBetween" id="time-between" value={ttBetween} onChange={this.handleChange}/>
                        </div>
                    </div>
                    </div>
        
                    <div className="form-group">
                    <label htmlFor="pscNeedle">{rangeMessages[0]} {pscNeedle}</label>
                    <input type="range" min={1} max={120} className="form-control-range" id="pscNeedle" name="pscNeedle" value={pscNeedle} onChange={this.handleChange}></input>
                    <label htmlFor="cscNeedle">{rangeMessages[1]} {cscNeedle}</label>
                    <input type="range" min={1} max={120} className="form-control-range" id="cscNeedle" name="cscNeedle" value={cscNeedle} onChange={this.handleChange}></input>
                    </div>
        
                    <div className="row align-items-center">
                    <div className="col-6 text-right">
                        <span>Total time to {title} if</span>
                    </div>
                    <div className="col-6">
                        <p>PSC First: <strong>{parseInt(this.state.pscNeedle, 10) + parseInt(this.state.ttPsc, 10) + parseInt(this.state.ttBetween, 10)}</strong></p>
                        <p>CSC First: <strong>{parseInt(this.state.cscNeedle, 10) + parseInt(this.state.ttCsc, 10)}</strong></p>
                    </div>
                    </div>
                    <div className="form-group">
                        <h2 className={"col-12 text-center alert alert-" + (isCsc ? 'danger' : 'dark')}>{decisionText}</h2>
                    </div>
                </form>
            </div>
        );
          
    }
}

export default StrokeTreatment;