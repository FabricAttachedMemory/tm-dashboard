'use strict';
import React        from 'react';
import PropTypes    from 'prop-types';
import {render}     from 'react-dom';

import ApiRequester     from '../components/base/apiRequester';
import * as ChordWheel  from './chordWheel';


/* TODO: Documentation shall be here soon */
class BRackOverview extends ApiRequester {

    constructor(props){
        super(props);
    }


    buildEnclosureCol(numOfCols){
        var columns = [];
        for(var i=this.props.start; i < this.props.start + numOfCols; i++){
            var index = i < 10 ? "0" + i : i;
            var id = "RackOverview_Enc_" + this.props.enc + "_Node_" + i;
            columns.push(
                        <td id={id} className="rackTbCell" key={i}
                            onMouseEnter={this.onMouseOver.bind(this, i-1)}
                            onMouseLeave={this.onMouseOut.bind(this, i-1)}>
                        {index}
                        </td>);
        }//for
        return columns;
    }//buildEnclosureCol


    onMouseOver(node, e){
        ChordWheel.ShowNodeActivity(node, true);
    }

    onMouseOut(node, e){
        ChordWheel.ShowNodeActivity(node, false);
    }


    render() {
        var boxStyle = {
            fontSize: "16px"
        };

        var numOfNodes = this.props.nodeCount;
        return (
            <div>
                <table className="table rackTb">

                    <thead>
                        <tr>
                            <th colSpan={numOfNodes} className="rackTbHead">
                                {this.props.name}
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            {this.buildEnclosureCol(numOfNodes)}
                        </tr>
                    </tbody>
                </table>
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
