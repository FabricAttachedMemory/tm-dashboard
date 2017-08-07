'use strict';
import React from 'react';
import {render} from 'react-dom';
import ApiRequester from './base/apiRequester'
import StatsBox from './wrappers/statsBox'


class InfoSquare extends ApiRequester {

    constructor(props){
        super(props);
    }

    render() {

        return (
            <StatsBox size={12} height={this.props.height}>
                <div className="data-display">
                    {this.props.number}
                </div>
                <div className="data-container-name" style={{padding: "0 0 0 0"}}>
                    <text >{this.props.desc}</text>
                </div>
            </StatsBox>
        );
    }
}

export default InfoSquare;
