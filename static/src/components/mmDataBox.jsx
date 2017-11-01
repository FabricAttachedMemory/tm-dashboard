'use strict';
import React from 'react';
import {render} from 'react-dom';

import ApiRequester from './base/apiRequester';
import ContentBox   from './contentBox';
import StatsBox     from './wrappers/statsBox';


class MMDataBox extends ApiRequester{

    constructor(props){
        super(props);
        this.state.id = (this.props.id === undefined) ? "" : this.props.id;
    }


    defaultRender(value){
        var fontStyle = {};
        if(this.props.fontSize === undefined)
            fontStyle = {};
        else
            fontStyle.fontSize = this.props.fontSize;
        fontStyle.fontWeight = "bold";

        return(
            <div>
                <div className="data-display" style={fontStyle}>
                    {value}
                </div>
                <div className="data-container-name"
                                style={{padding: "0 0 0 0"}}>
                    <text>{this.props.desc}</text>
                </div>
            </div>
        );
    }//defaultRender


    render() {
        var className = "";
        if(this.props.className !== undefined){ //allow adding custom classes to this component.
            className = this.props.className;
        }

        var value = 10;
        var subValue = 'None';
        return (
            <StatsBox className={"statsboxContent " + className} id={this.props.id}
                            size={12} height={this.props.height}
                            maxHeight={this.props.maxHeight}
                            paddingTop={this.props.paddingTop}>
            { this.props.children === undefined ? this.defaultRender(value) : this.props.children }
            </StatsBox>
        );
    }
}


export default MMDataBox;
