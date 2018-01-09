'use strict';
import React     from 'react';
import {render}  from 'react-dom';
import PropTypes from 'prop-types';

import * as ChordWheel from './chordWheel';
import * as DataSharing  from '../components/dataSharing';

var ACTIVE_NODE=-1;
var REFRESH_RATE=2000;
var IS_PLAYING=true;


//This component allows users to start\stop arcs looping demo, which will hightlight
//each node every REFRESH_RATE seconds from first, to the last one.
//This component needs to be added to the page (overview.jsx) that will create
//a button and a dropdown list to control the Showcase loop.
class ChordShowcase extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            //this triggers re-render when different refresh rate is selected.
            refreshRate : props.refreshRate,
            activeNode : -1,
            isPlaying : true,
        };
        this.setRefreshRate = this.setRefreshRate.bind(this);
        this.showcaseNodes = this.showcaseNodes.bind(this);
        this.toggleShowcase = this.toggleShowcase.bind(this);
        this.stopShowcase = this.stopShowcase.bind(this);

        this.state.timeoutId = [];
    }//ctor


    //When a Play button is pressed or different refresh rate selection is
    //selected, it will set a new state that will trigger React to call this
    //function. Here, we check if current state is different from what user is
    //choosing, and if it is - re-render will be triggered, to allow dropdown
    //value to be set and a loop process to be started(or stopped).
    shouldComponentUpdate(nextProps, nextState){
        var isShouldPlay = nextState.isPlaying != this.state.isPlaying;
        var isNewRefreshRate = nextState.refreshRate != this.state.refreshRate;
        var letsUpdate = isShouldPlay || isNewRefreshRate;
        return letsUpdate;
    }//shouldComponentUpdate


    //When a different tab (e.g. Memory Management tab) is clicked, this function
    //is called by React. At this point, we need to clear all of the running
    //timeouts that makes up a "nodes looping process", so that it does not
    //continue execution when Overview tab is not opened. Also, save currently
    //selected node number, so that when user comes back, the loop picks up
    //from where it left off.
    componentWillUnmount(){
        this.clearTimeout();
        ACTIVE_NODE=this.state.activeNode;
    }//componentWillUnmount


    //When everything is loaded and in the DOM, it is time to start showcasing
    //nodes, if Play button was already pressed. This usually happenes when
    //switching between tabs. On the very first load of the page - showcasing
    //is stopped.
    componentDidMount(){
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
        this.state.activeNode = ACTIVE_NODE;
        console.log("State after tab switch: " + IS_PLAYING);
        //Always start showcase on loaded page, since you gonna Start it in 99%
        //of the time anyways.
        if(IS_PLAYING){
            // this.setState({ isPlaying : true });
            this.showcaseNodes();
        }
    }//componentDidMount


    //Here we are setting refresh rate value. It needs to be called before the
    //render() function to make refreshrate dropdown menu to select the rigth
    //value and also, to set state so that showcaseNodes() would have the right
    //rate as well.
    componentWillMount(){
        this.state.refreshRate = REFRESH_RATE;
    }//componentWillMount


    //setTimeout() is called recursively in the showcaseNode() function. Thus,
    //it creates many timeout IDs. We need to track all of them and clean timeouts
    //when component is unmounted, switching between tabs or a Stop button is called.
    clearTimeout(){
        for(var i=0; i<this.state.timeoutId.length; i++){
            clearTimeout(this.state.timeoutId[i]);
        }//for
    }//clearTimeout


    //Run a Looping algorithm to showcase all of the nodes. It will call ChordWheel's
    //ShowNodeActivity() function to highlight and de-highlight nodes.
    showcaseNodes(isPlay=true){
        var activeNode = this.state.activeNode; //node that will be selected
        var prevNode = -1;  //node that is currently selected (to be unselected)
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

        //Set button's text to "Stop" or "Start
        this.setShowcaseState(isPlay);

        if(!isPlay){
            ChordWheel.ShowNodeActivity(prevNode, false);
            this.clearTimeout();
            return;
        }//if no playing

        ChordWheel.ShowNodeActivity(activeNode, true);
        //can't use setState() here, but this still works as intended.
        this.state.activeNode = activeNode;

        //helps to keep timeoutID array small. No need to track all ids, since
        //setTimeout called in recursive loop, therefore, the last ID is the most
        //relevant. However, things may get out of sync sometimes, and last ID
        //is not the one that needs to be cleaned. That is one we keep track of
        //all of them, and cleaning the stack before calling a new one.
        this.clearTimeout();

        var timeoutId = setTimeout(this.showcaseNodes.bind(this.state.isPlaying),
                                            this.state.refreshRate);

        if(this.state.timeoutId.indexOf(timeoutId) == -1){
            this.state.timeoutId.push(timeoutId);
        }
    }//showcaseNodes


    //Checks if button text is Stop or Start.
    //if Stop -> return True (meaning loop is playing).
    //If text is Start -> return False (meaning loop is not playing)
    getShowcaseState(){
        var showcaseBtn = document.getElementById("showcaseBtn");
        if(showcaseBtn != null){
            return showcaseBtn.classList.contains("glyphicon-pause");
        }
        return true; //Force "Play" state if button not found.
    }//getShowcaseState


    setShowcaseState(state){
        var showcaseBtn = document.getElementById("showcaseBtn");
        if(showcaseBtn == null)
            return;
        showcaseBtn.classList.remove("glyphicon-play");
        showcaseBtn.classList.remove("glyphicon-pause");
        if(state == true)
            showcaseBtn.classList.add("glyphicon-pause");
        else
            showcaseBtn.classList.add("glyphicon-play");
    }//setShowcaseState


    //Called by refresh rate dropdown <select> onChange event.
    setRefreshRate(event){
        this.clearTimeout();
        var rate = event.target.value;
        this.setState({refreshRate : rate});
        REFRESH_RATE = rate;
        this.showcaseNodes(true);
    }//setRefreshRate


    //Called by Play\Stop <button> onCick event
    toggleShowcase(){
        this.clearTimeout();
        IS_PLAYING = !this.getShowcaseState();
        this.setState({ isPlaying : IS_PLAYING });
        this.setShowcaseState(IS_PLAYING);
        if(IS_PLAYING)
            this.showcaseNodes();
    }//toggleShowcase


    //Completely stop the showcase progress: reset states and node select index.
    stopShowcase(){
        this.clearTimeout();
        this.setShowcaseState(false);
        this.showcaseNodes(false);
        IS_PLAYING = false;
        this.setState({ isPlaying : false, activeNode : -1 });
    }//stopShowcase


    //Create refresh rates dropdown list (<option>) of Refresh rates to be used.
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
        var rate = REFRESH_RATE;
        if(rate == "")
            rate = this.state.refreshRate;
        // var toggleText = IS_PLAYING ? "" : "Start";

        return(
        <div id="ChordShowcase" style={{display: "hide"}}>
            <div id="showcaseBtnSpacerTop" style={{marginTop: "2.2em"}}></div>
            <button className="btn btn-hpe-default"
                    onClick={this.toggleShowcase}>
                <span id="showcaseBtn" className="glyphicon glyphicon-play"
                        style={{"color" : "black"}}>
                </span>
            </button>
            <select id="shocaseRateSelect" className="btn btn-hpe-default"
                    value={rate} onChange={this.setRefreshRate}
                    style={{borderLeft: "thin solid white",
                            borderRight: "thin solid white"
                    }}>
                {this.createRefreshRateOptions(
                    [500,1000,2000,3000,4000, 5000, 6000],
                    rate
                )}
            </select>
            <button className="btn btn-hpe-default"
                    onClick={this.stopShowcase}>
                <span id="showcaseBtnStop" className="glyphicon glyphicon-stop"
                        style={{"color" : "black"}}>
                </span>
            </button>
        </div>
        );
    }//render

}//class


ChordShowcase.defaultProps = {
    refreshRate : 2000,
}//defaultProps


export default ChordShowcase;
