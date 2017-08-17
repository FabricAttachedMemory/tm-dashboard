'use strict';
import React        from 'react';
import {render}     from 'react-dom';
import ApiRequester from './base/apiRequester'


/* TODO: Documentation shall be here soon */
class BRackOverview extends ApiRequester {

    constructor(props){
        super(props);
    }


    buildEnclosureCol(numOfCols){
        var columns = [];
        for(var i=0; i < numOfCols; i++){
            columns.push(<td className="rackTbCell" key={i}>0{i+1}</td>);
        }//for
        return columns;
    }//buildEnclosureCol


    render() {
        var boxStyle = {
            fontSize: "16px"
        };

        var numOfNodes = 7;
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


export default BRackOverview;
