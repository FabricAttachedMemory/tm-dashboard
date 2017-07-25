'use strict';
import React from 'react';
import {render} from 'react-dom';
import StatsBox from './statsBox'

import css from './css/stats';

class InfoSquare extends React.Component {

    constructor(props){
        super(props);
    }

    render() {

        return (
            <StatsBox size={12} mgBottom="2%" mgLeft="0%">
                <div className={css.main_number}>
                    {this.props.number}
                </div>
                <div className={css.dsc} style={{padding: "0 0 0 0"}}>
                    <text >{this.props.desc}</text>
                </div>
            </StatsBox>
        );
    }
}

export default InfoSquare;
