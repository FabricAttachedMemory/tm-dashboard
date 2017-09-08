'use strict';
import React        from 'react';
import PropTypes    from 'prop-types';
import {render}     from 'react-dom';

import ApiRequester     from '../components/base/apiRequester';
import * as ChordWheel  from './chordWheel';
import * as DataSpoofer from '../components/spoofer';


/* TODO: Documentation shall be here soon */
class BRackOverview extends ApiRequester {

    constructor(props){
        super(props);
    }//ctor


    buildEnclosureCol(enc, start, numOfCols){
        var columns = [];
        for(var i=start; i < start + numOfCols; i++){
            var index = i + 1 < 10 ? "0" + (i+1) : i+1;
            var id = "RackOverview_Enc_" + enc + "_Node_" + i;
            columns.push(
                        <td id={id} className="rackTbCell" key={i}
                            onMouseEnter={this.onMouseOver.bind(this, i)}
                            onMouseLeave={this.onMouseOut.bind(this, i)}>
                        {index}
                        </td>);
        }//for
        return columns;
    }//buildEnclosureCol


    buildEnclosureTable(enc, start, numOfNodes){
        return(
            <table className="table rackTb">
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


    render() {
        var boxStyle = {
            fontSize: "16px"
        };

        var numOfNodes = this.props.nodeCount;

        var tables = [];
        var layout = DataSpoofer.hardwareLayout();
        var countStart = 0;
        for(var i=0; i < layout.length; i++){
            tables.push(this.buildEnclosureTable(i, countStart, layout[i]));
            countStart = countStart + layout[i];
        }//for

        return (
            <div>
                {tables}
            </div>
        );
    }//render
}//class


BRackOverview.defaultProps = {
    start : 1, //first node index to start count from.
    nodeCount : PropTypes.number.isRequired,
    enc : PropTypes.number.isRequired
}


export default BRackOverview;


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
