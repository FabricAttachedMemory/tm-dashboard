'use strict';
import React from 'react';
import {render} from 'react-dom';
import StatsBox from './wrappers/statsBox'
import ApiRequester from './base/apiRequester'


class PercentCircle extends ApiRequester {

    constructor(props){
        super(props);
    }//constructor


    render() {
        this.readFetchedValues();

        //Radius of the circle that was set in css/stats.css.
        var radius = 100;

        //SVG's property strokeDasharray is calculated to render the "filling" of
        //the circle.
        var progress_fill = radius * 2 * Math.PI;
        //How much filling to do of the circle based of desired precentage.
        var circle_fill_offset = ((100 - this.state.percent) / 100) * progress_fill;
        circle_fill_offset = (circle_fill_offset < 0 ) ? 0 : circle_fill_offset;

        var valueText = (this.state.percent < 0) ? "No Data" : this.state.percent;
        var metricsSymbol = parseInt(valueText);
        metricsSymbol = (isNaN(metricsSymbol)) ? "" : "%";

        this.state.fetched = null; //Resetting fetched for the next circle\interval.

        return (

        <StatsBox size={12} height={this.props.height}>

                <div id={this.state.containerId} style={{ height : "50%", marginTop: "4.5em" }}>
                    <svg viewBox="0 0 150 260" className="svg-progress-circle">
                        <circle r={radius} className="progress-inactive progress-circle"/>
                        <circle r={radius} className="progress-active progress-circle"
                                strokeDasharray={progress_fill}
                                strokeDashoffset={circle_fill_offset} />

                        <text x="50%" y="50%" className="progress-value">{valueText}</text>
                        <text x="45.5%" y="60%" className="data-metrics">{metricsSymbol}</text>
                    </svg>
                </div>

                <div className="col-md-12 data-display-container">
                    <text className="data-container-name">{this.props.name}</text>
                </div>

        </StatsBox>

        );
    }
}

export default PercentCircle;
