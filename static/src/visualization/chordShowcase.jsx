'use strict';
import React     from 'react';
import {render}  from 'react-dom';
import PropTypes from 'prop-types';

import * as ChordWheel from './chordWheel';
import * as DataSharing  from '../components/dataSharing';

var ACTIVE_NODE=-1;
var REFRESH_RATE=2000;
var IS_PLAYING=false;


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
        this.state.timeoutId = -1;
    }//ctor


    shouldComponentUpdate(nextProps, nextState){
        var isShouldPlay = nextState.isPlaying != this.state.isPlaying;
        var isNewRefreshRate = nextState.refreshRate != this.state.refreshRate;
        return isShouldPlay || isNewRefreshRate;
    }//shouldComponentUpdate


    componentWillUnmount(){
        this.clearTimeout();
        ACTIVE_NODE=this.state.activeNode;
    }//componentWillUnmount


    componentDidMount(){
        //var isPlaying = DataSharing.Get("IsShowcasePlaying") == "true" ? true : false;
        this.state.activeNode = ACTIVE_NODE;
        if(IS_PLAYING){
            this.showcaseNodes();
            this.state.isPlaying = true;
        }
    }


    clearTimeout(){
        if(this.state.timeoutId != -1){
            clearTimeout(this.state.timeoutId);
        }
    }//clearTimeout


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
            this.clearTimeout();
            return;
        }//if no playing

        //when state has changed, but setTimeout keep passing incorect isPlay state.
        if(!this.state.isPlaying){
            //return;
        }//if

        ChordWheel.ShowNodeActivity(activeNode, true);
        this.state.activeNode = activeNode;
        console.log(this.state.isPlaying + " | " + IS_PLAYING);
        this.state.timeoutId = setTimeout(this.showcaseNodes.bind(this.state.isPlaying),
                                            this.state.refreshRate);
    }//showcaseNodes


    setRefreshRate(event){
        var rate = event.target.value;
        this.setState({refreshRate : rate});
        //DataSharing.Set("ChordRefreshRate", rate);
        REFRESH_RATE = rate;
    }//setRefreshRate


    toggleShowcase(){
        this.clearTimeout();
        //var isPlaying = DataSharing.Get("IsShowcasePlaying") == "true" ? true : false;
        IS_PLAYING = !IS_PLAYING;
        //DataSharing.Set("IsShowcasePlaying", isPlaying.toString());
        this.setState({ isPlaying : IS_PLAYING});
    }//toggleShowcase


    createRefreshRateOptions(option_list, select_val){
        var result = [];
        for(var i=0; i < option_list.length; i++){
            var val = option_list[i];
            var selected = (val == select_val) ? "selected" : "";
            var id = "OptRate_"+val;
            result.push(
                <option className="dropdown-up" key={id} id={id} value={val}>
                {val}
                </option>
            );
        }//for
        return result;
    }//createRefreshRateOptions


    render(){
        //var rate = DataSharing.Get("ChordRefreshRate");
        var rate = REFRESH_RATE;
        //var isPlaying = DataSharing.Get("IsShowcasePlaying") == "true" ? true : false;
        if(rate == "")
            rate = this.state.refreshRate;
        var toggleText = IS_PLAYING ? "Stop" : "Play";
        //this.showcaseNodes(this.state.isPlaying);
        console.log(IS_PLAYING);
        this.showcaseNodes(IS_PLAYING);
        return(
        <div id="ChordShowcase" style={{display: "hide"}}>
            <button className="btn btn-primary" onClick={this.toggleShowcase}>{toggleText}</button>
            <select className="btn btn-primary" value={rate} onChange={this.setRefreshRate}>
                {this.createRefreshRateOptions(
                    [500,1000,2000,3000,4000],
                    rate
                )}
            </select>
        </div>
        );
    }//render

}//class


ChordShowcase.defaultProps = {
    refreshRate : 2000,
}//defaultProps


export default ChordShowcase;
