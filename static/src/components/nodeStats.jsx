'use strict';
import React        from 'react';
import PropTypes    from 'prop-types';
import {render}     from 'react-dom';

import ApiRequester from './base/apiRequester';

const STATS_FIELDS = [
                    ["Power State",     ""],
                    ["DRAM Usage",      "%"],
                    ["CPU Usage",       "%"],
                    ["Network In",      ""],
                    ["Fabric Usage",    ""],
                    ["Network Out",     ""],
                    ["No. of Shelves",  ""],
                    ["OS Manifest",     ""],
                    ["No. of Books",    ""],
                  ];


var NODES_DATA = [];
//Predefine nodes stats with default(empty) values to be referenced and set
//later by NodeStats' render() function using fetched data (http:://.../api/prenode).
for(var i=0; i < 40; i++){
    NODES_DATA.push(_validateAndDefault({}));
}//for


export function GetNodesData(){
    return NODES_DATA;
}


/* TODO: documentation will be here soon. */
class NodeStats extends ApiRequester {

    constructor(props){
        super(props);
        this.state.data = {};
        //this.state.data = this.ValidateAndDefault(this.state.data);
    }//ctor


    BuildDataBox(title, subtitle){
        var boxSt = {
            height: "50px",
            fontFamily: "Arial",
            color: "white",
            fontSize: "12px"
        }
        var titleSt = {
            textAlign: "left",
        }
        //NOTE: property "key" is needed for react to shutup complaining about
        // having a "key" with unique ID in the array....
        return(
            <div id={"Nodebox_" + title} key={title}
                    className="col-md-6" style={boxSt}>
                <div style={titleSt}>
                    {title}
                </div>
                <div id={"NodeStat_" + title} style={titleSt}>
                    {subtitle}
                </div>
            </div>
        );
    }//BuildDataBox


    normalizeNodeStats(data){
        if(data === undefined)
            return;
        if(data.nodes === undefined)
            return;

        var nodes_stat = data.nodes
        for(var i=0; i < nodes_stat.length; i++){
            var node_id = nodes_stat[i].Node;
            NODES_DATA[node_id] = nodes_stat[i];
        }//for
        return NODES_DATA
    }//normalizeNodeStats


    render() {
        if (this.state.fetched === undefined)
            this.state.fetched = this.state.model;


        if(this.state.fetched["state"] === undefined){
            if (this.state.spoofedData !== undefined){
                this.state.fetched["nodes"] = this.state.spoofedData;
            }
        }

        this.normalizeNodeStats(this.state.fetched);

        var boxes = [];
        var stats = _validateAndDefault({}); //empty value set of fields

        for(var i=0; i < STATS_FIELDS.length; i++){
            var field = STATS_FIELDS[i];
            var title = field[0];
            var value = stats[field[0]];
            value = (value === undefined) ? "---" : value;
            boxes.push(this.BuildDataBox(title, value));
        }//for
        return (
            <div className={"gridCanvas " +this.props.className}>
                {boxes}
            </div>
        );
    }//render
}


export default NodeStats;


export function SetFields(node_num, enc){
    var fields = {};
    if(node_num < NODES_DATA.length && node_num >= 0)
        fields = NODES_DATA[node_num];

    var stats = _validateAndDefault(fields);
    for(var i=0; i<STATS_FIELDS.length; i++){
        var field = STATS_FIELDS[i];
        var value = stats[field[0]];

        var statValueId = "NodeStat_" + field[0];
        var element = document.getElementById(statValueId);
        if(element == null){
            console.warn("Cant set nodestat value for ["+statValueId+"]");
            continue;
        }
        element.innerHTML = value;
    }//for

    enc += 1;
    var nodeBoxTitle = document.getElementById("Nodebox_title");
    if (node_num < 0){
        node_num = "n/a";
        enc = "n/a";
    }
    nodeBoxTitle.innerHTML = "Node " + (node_num + 1) + " (Enclosure " + enc + ")";
}//SetFields


function _validateAndDefault(data){
    var expectedFields = STATS_FIELDS;
    for(var i=0; i < expectedFields.length; i++){
        var field = expectedFields[i];
        if(field[0] in data)
            continue;
        data[field[0]] = "---";
    }
    return data;
}//ValidateAndDefault
