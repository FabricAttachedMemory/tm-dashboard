'use strict';
import React from 'react';
import {render} from 'react-dom';
import ApiRequester from './base/apiRequester'
import StatsBox from './wrappers/statsBox'


class InfoSquare extends ApiRequester {

    constructor(props){
        super(props);
        this.state.id = (this.props.id === undefined) ? "" : this.props.id;
    }


    defaultRender(){
        return(
            <div>
                <div className="data-display">
                    {this.props.number}
                </div>
                <div className="data-container-name"
                                style={{padding: "0 0 0 0"}}>
                    <text>{this.props.desc}</text>
                </div>
            </div>
        );
    }//defaultRender


    render() {
        return (
            <StatsBox id={this.props.id}
                        className="statsboxContent"
                            size={12} height={this.props.height}>
            { this.props.children === undefined ? this.defaultRender() : this.props.children }
            </StatsBox>
        );
    }
}


export default InfoSquare;
