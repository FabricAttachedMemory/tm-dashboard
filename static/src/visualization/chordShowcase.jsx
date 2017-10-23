'use strict';
import React     from 'react';
import {render}  from 'react-dom';
import PropTypes from 'prop-types';

import * as ChordWheel from './chordWheel';


class ChordShowcase extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            refreshRate : props.refreshRate,
            activeNode : -1,
            isPlaying : false,
        };
        this.setRefreshRate = this.setRefreshRate.bind(this);
        this.showcaseNodes = this.showcaseNodes.bind(this);
        this.toggleShowcase = this.toggleShowcase.bind(this);
    }//ctor

    shouldComponentUpdate(nextProps, nextState){
        var isShouldPlay = nextState.isPlaying != this.state.isPlaying;
        var diffRateSelected = nextState.refreshRate != this.state.refreshRate;
        return isShouldPlay;
    }


    showcaseNodes(isPlay=true){
        var activeNode = this.state.activeNode;
        var prevNode = -1;
        var matrixLength = ChordWheel.GetMatrix().length;
        if(activeNode >= matrixLength - 1){
            activeNode = 0;
            prevNode = matrixLength - 1;
        }else{
            prevNode = activeNode;
            activeNode += 1;
        }

        if(prevNode != -1)
            ChordWheel.ShowNodeActivity(prevNode, false);

        if(!isPlay){
            ChordWheel.ShowNodeActivity(prevNode, false);
            return;
        }//if no playing

        //when state has changed, but setTimeout keep passing incorect isPlay state.
        if(!this.state.isPlaying){
            return;
        }//if

        ChordWheel.ShowNodeActivity(activeNode, true);
        this.setState({activeNode : activeNode});

        setTimeout(this.showcaseNodes.bind(this.state.isPlaying), this.state.refreshRate);
    }//showcaseNodes


    setRefreshRate(event){
        var rate = event.target.value;
        this.setState({refreshRate : rate});
    }//setRefreshRate


    toggleShowcase(){
        this.setState({ isPlaying : !this.state.isPlaying });
    }//toggleShowcase


    render(){
        this.showcaseNodes(this.state.isPlaying);
        var toggleText = this.state.isPlaying ? "Stop" : "Play";
        return(
        <div id="ChordShowcase" style={{display: "hide"}}>
            <button onClick={this.toggleShowcase}>{toggleText}</button>
            <select className="btn btn-primary" onChange={this.setRefreshRate}
                >
                <option value="500">500</option>
                <option value="1000">1000</option>
                <option value="2000">2000</option>
                <option value="3000">3000</option>
                <option value="4000">4000</option>
            </select>
        </div>
        );
    }//render

}//class


ChordShowcase.defaultProps = {
    refreshRate : 1000,
}//defaultProps


export default ChordShowcase;