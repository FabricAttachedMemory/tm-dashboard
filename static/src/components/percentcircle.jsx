'use strict';
import React    from 'react';
import {render} from 'react-dom';

import StatsBox     from './wrappers/statsBox';
import BoxHeader    from './infoBoxHeader';
import ApiRequester from './base/apiRequester';
import * as DataSharing  from './dataSharing';


/* Using <svg> and <circle> html elements, create a "load circle" (with the
help of css/stats.css stylesheet) to show system load statuses, e.g cpu, fam...

This class inherits ApiRequester class that helps to abstract components data
fetching and box rendering (resizing, aligmnet...). With that, several default
props and stats are inherited as well. Therefore, DO NOT use PercentCircle.defaultProps
to set properties - or it will just override parent's props. As a work around,
you can add new state properties in the constructor with default values. Refere
to visualization/grids.jsx component for example. Usually, I try to avoid referring
this.props anywhere in the code outside of constructor... so this.state should be
fine.*/
class PercentCircle extends ApiRequester {

    constructor(props){
        super(props);
        this.state.circleRatio = this.props.radiusRatio === undefined ?
                                                    0.5 : this.props.radiusRatio;
        this.state.boxHeight = this.props.boxHeight === undefined ?
                                        this.props.height : this.props.boxHeight;
        //Replacing Spaces with underscore.
        var nameSplit       = this.props.name.split(" ");
        //Need to replace all spaces with '_' to use as element's ID.
        //Using split + join seems simpler than using Regex...
        var replacedSpaces  = nameSplit.join("_");

        //ID will be assigned to the div that wrapps <sv> element. I don't
        //remember what for...
        this.state.containerId = replacedSpaces + "_container";

        var metrics = this.props.metricsType;
        if (metrics === undefined)
            metrics = "%";

        this.state.metricsType = metrics;
    }//constructor


    //Convert large number to smaller power.
    //Source: https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
    formatBytes(bytes,decimals) {
        bytes = parseFloat(bytes);
        if(bytes == 0 || isNaN(bytes))
            return [0, 'B'];

        var rate = 1024;
        var dm = decimals || 2;
        var sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var index = Math.floor(Math.log(bytes) / Math.log(rate));

        var convertedValue = parseFloat((bytes / Math.pow(rate, index)).toFixed(dm));
        var valuePower = sizes[index];
        return [convertedValue, valuePower];
    }//formatBytes


    pick_random_from_list(data_list){
        var maxRange = data_list.length;
        var index = Math.floor(Math.random() * maxRange)
        return data_list[index]
    }//pick_random_from_list


    render() {
        var fetchedJson = this.readFetchedValues();

        //Try and Spoof percent circles with some data to be displayed while
        // "idle" on github pages
        // if (fetchedJson["status"] === undefined){
        //     if (this.props.spoofedData !== undefined){
        //         fetchedJson["value"] = this.pick_random_from_list(this.props.spoofedData);
        //     }//if
        // }//if

        var fetchedValue = parseFloat(fetchedJson["value"]).toFixed(2);
        var savedValue = DataSharing.Get(this.props.name + "_persist");
        //To keep circles showing its data between tab switch, values before
        //switch needs to be saved. Changing tabs means that fetched data
        //will become "-1", while saved value will have previously shown one.
        //That is an opportunity to check state and set value to render.
        if (fetchedValue == -1){
            if(savedValue != null){
                if(savedValue != -1){
                    fetchedValue = savedValue;
                }//if saved value
            }//if saved not null
        }//if
        DataSharing.Set(this.props.name + "_persist", fetchedValue);

        //Radius of the circle that was set in css/stats.css.
        var radius = 100;

        //SVG's property strokeDasharray is calculated to render the "filling"
        //of a circle.
        var progress_fill = radius * 2 * Math.PI;
        //How much filling to do of the circle based of desired precentage.
        var percentVal = (fetchedValue < 0) ? 0 : fetchedValue; //No negatives
        percentVal = (fetchedValue > 100) ? 100 : fetchedValue; //no more than 100%

        var circle_fill_offset = ((100 - percentVal) / 100) * progress_fill;

        var valueText = (fetchedValue < 0 || fetchedValue == "") ?
                                    "No Flow" : parseInt(fetchedValue);
        var metricsSymbol = parseInt(valueText);
        metricsSymbol = (isNaN(metricsSymbol)) ? "" : this.state.metricsType;

        this.state.fetched = null; //Resetting fetched for the next circle\interval.
        var containerHeight = parseFloat(this.props.height.split("px")[0]) *
                                            this.state.circleRatio;

        //Use smaller metrics to display large values
        if(this.props.metricsType == "auto"){
            var converted = this.formatBytes(savedValue, 0);
            valueText = converted[0];
            metricsSymbol = converted[1];
        }//if auto metrics

        console.log(this.props.name + ' -> ' + fetchedJson["value"]);

        return (
        <StatsBox size={12} height={this.props.height}
            marginTop={this.props.marginTop}
            marginBottom={this.props.marginBottom}
        >
            <div className="statsboxContent" style={{
                height: this.state.boxHeight,
                paddingTop: this.props.paddingTop
                }}>
                <div id={this.state.containerId} style={{ height : containerHeight}}>
                    <svg viewBox="0 0 150 210" className="svg-progress-circle">
                        <circle r={radius} className="progress-inactive progress-circle"/>
                        <circle r={radius} className="progress-active progress-circle"
                                strokeDasharray={progress_fill}
                                strokeDashoffset={circle_fill_offset} />

                        <text x="48%" y="50%" textAnchor="middle"
                        className="progress-value"
                        style={this.props.valueStyle}
                        >
                        {valueText}
                        </text>
                        <text x="48%" y="60%" textAnchor="middle" className="data-metrics">{metricsSymbol}</text>

                    </svg>
                </div>

                <BoxHeader text={this.props.name} lineHeight="80px"/>

            </div>
        </StatsBox>
        );
    }//render
}//class

export default PercentCircle;
