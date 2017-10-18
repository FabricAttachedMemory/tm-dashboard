'use strict';
import React        from 'react';
import PropTypes    from 'prop-types';
import {render}     from 'react-dom';

import ApiRequester     from '../components/base/apiRequester';
import * as ChordWheel  from './chordWheel';
import * as DataSpoofer from '../components/spoofer';
import * as DataSharing  from '../components/dataSharing';


var UPDATE_RACK=false;
var TOPOLOGY=[];

/* TODO: Documentation shall be here soon */
class BRackOverview extends ApiRequester {

    constructor(props){
        super(props);

        TOPOLOGY = DataSpoofer.SystemTopology();
    }//ctor


    buildEnclosureCol(enc, start, numOfCols){
        var columns = [];
        for(var i=start; i < start + numOfCols; i++){
            var index = i + 1 < 10 ? "0" + (i+1) : i+1;
            var id = "RackOverview_Enc_" + enc + "_Node_" + i;
            columns.push(
                        <td id={id} className="rackTbCell" key={i}
                        style={{paddingLeft:"0px", paddingRight:"0px"}}
                            onMouseEnter={this.onMouseOver.bind(this, i)}
                            onMouseLeave={this.onMouseOut.bind(this, i)}>
                        {index}
                        </td>);
        }//for
        return columns;
    }//buildEnclosureCol


    buildEnclosureTable(enc, start, numOfNodes){
        return(
            <table className="table rackTb" key={"EncTbl_"+enc}>
                <thead>
                    <tr>
                        <th colSpan={numOfNodes} className="rackTbHead">
                            {"Enclosure " + (enc + 1)}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {this.buildEnclosureCol(enc, start, numOfNodes)}
                    </tr>
                </tbody>
            </table>
        );
    }//buildEnclosureTable


    onMouseOver(node, e){
        ChordWheel.ShowNodeActivity(node, true);
    }//onMouseOver


    onMouseOut(node, e){
        ChordWheel.ShowNodeActivity(node, false);
    }//onMouseOut


    shouldComponentUpdate(nextProps, nextState){
        if(UPDATE_RACK){
            UPDATE_RACK = false;
            return true;
        }
        return false;
    }

    render() {
        var topology = TOPOLOGY;

        // var numOfNodes = this.props.nodeCount;
        var tables = [];
        // var topology = DataSpoofer.SystemTopology(); //FIXME: get topology from API call
        var countStart = 0;

        for(var i=0; i < topology.length; i++){
            var nodeCount = parseInt(topology[i]);
            tables.push(this.buildEnclosureTable(i, countStart, nodeCount));
            countStart = countStart + topology[i];
        }//for

        return (
            <div>
                {tables}
            </div>
        );
    }//render
}//class


export default BRackOverview;


// This primary will be called by chordWheel.jsx onMouseOver and on MouseOut
// functions.
// Highlight or unhighlight enclosure's cell (node) based on the currently
// hightlighed chord's arc.
export function SetActive(enc, node, state){
    var tableCellId = "RackOverview_Enc_"+enc+"_Node_"+node;
    var element = document.getElementById(tableCellId);
    if(element == null){
        console.warn("No RackOverview with enc="+enc+", node="+node+" found!");
        return;
    }

    var classToAdd = "rackTbCellActive";
    if(!element.classList.contains(classToAdd)){
        if(state == true)
            element.classList.add(classToAdd);
    }else{
        if(state == false)
            element.classList.remove(classToAdd);
    }
}//SetActive


export function Update(topology){
    UPDATE_RACK=true;
    TOPOLOGY=topology;
    DataSharing.Set("Enclosures", TOPOLOGY.length);
}