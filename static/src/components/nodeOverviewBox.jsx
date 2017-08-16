'use strict';
import React        from 'react';
import {render}     from 'react-dom';
import ApiRequester from './base/apiRequester'


/* TODO: Documentation shall be here soon */
class BNodeOverview extends ApiRequester {

    constructor(props){
        super(props);
    }


    render() {
        var boxStyle = {
            fontSize: "16px"
        };
        return (
            <div className="hpeFont" style={boxStyle}>
                Node Overview
            </div>
        );
    }
}//class


export default BNodeOverview;
