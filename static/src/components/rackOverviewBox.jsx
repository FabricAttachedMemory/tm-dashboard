'use strict';
import React        from 'react';
import {render}     from 'react-dom';
import ApiRequester from './base/apiRequester'


/* TODO: Documentation shall be here soon */
class BRackOverview extends ApiRequester {

    constructor(props){
        super(props);
    }


    render() {
        var boxStyle = {
            fontSize: "16px"
        };
        return (
            <div className="hpeFont" style={boxStyle}>
                Rack Overview
            </div>
        );
    }
}//class


export default BRackOverview;
