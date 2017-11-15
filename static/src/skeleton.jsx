'use strict';

import React from 'react';
import {render} from 'react-dom';
import PropTypes from 'prop-types';

import Header           from    './components/header';
import PercentCircle    from    './components/percentcircle';
import Flatgrids        from    './visualization/grids'
import Chords           from    './visualization/chordWheel';
import Middle           from    './components/middle';
import POverview         from    './overview';
import * as DataSpoofer from    './components/spoofer';


class Skeleton extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            panelMaxWidth : "280px",
            panelMinWidth : "230px",
            panelWidth : 300, //tracks current width of the side panels
            headerHeight : 55, //current header's panel height
            midWidth : "fill",
            boxMargin : "8px",
            panelPadding : ["5px", "5px", "5px", "5px"], //DEPR?
            windowHeight : window.innerHeight,
            windowWidth : window.innerWidth,
            forceRender : false,
        }
    }//ctor


    getHeight(offset, divider){
        return ((window.innerHeight - offset) / divider) + "px";
    }

    getWidth(offset, divider){
        return ((window.innerWidth - offset) / divider) + "px";
    }

    getHeightRatio(percent){
        return (window.innerHeight * percent) + "px";
    }

    getElementDimensions(elementId){
        var element = document.getElementById(elementId);
        var dimensions = element.getBoundingClientRect();
        return [dimensions.width, dimensions.height];
    }//getElementDimensions


    componentWillMount(){
        window.addEventListener("resize", this.updateDimensions.bind(this));
    }//componentWillMount


    componentDidMount(){
        window.removeEventListener("resize", this.updateDimensions.bind(this));
        var newWidth = this.getElementDimensions("leftPanel")[0];
        if(newWidth != this.state.panelWidth)
            this.setState({panelWidth : newWidth});
        var newHeight = this.getElementDimensions("headerPanel")[1]
        if(newHeight != this.state.headerPanel)
            this.setState({headerPanel : newHeight});
    }//componentDidMount


    updateDimensions(){
        this.setState({
            windowHeight : window.innerHeight,
            windowWidth : window.innerWidth
        });
    }//updateDimensions


    shouldComponentUpdate(nextProps, nextState){
        var willUpdate = this.isUpdate(nextProps, nextState);
        return willUpdate;
    }//shouldComponentUpdate


    isUpdate(nextProps, nextState){
        var isHeightChanged = (this.state.windowHeight != nextState.windowHeight);
        var isWidthChanged = (this.state.windowWidth != nextState.windowWidth);
        var isPanelWidthChanged = this.state.panelWidth != nextState.panelWidth;
        var isForceRender = nextState.forceRender != this.state.forceRender;

        var isUpdate = isHeightChanged || isForceRender || isWidthChanged || isPanelWidthChanged;
        return isUpdate;
    }//isUpdate


    render() {
        var headerClasses   = "col-md-12 header";
        var sidesClasses    = "col-md-2";

        var panelHeight = this.getHeight(this.state.headerHeight + 16, 3);

        var boxMarginVal = parseFloat(this.state.boxMargin.split("px")[0]);
        var middleWidth  = window.innerWidth -
                                (this.state.panelWidth * 2) - boxMarginVal * 3;
        var middleHeight = this.getHeight(this.state.headerHeight + 50, 1);

        var openedTab       = window.location.href.split("#/")[1];
        var tabContentToRender = "";
        if(openedTab == "overview"){
            tabContentToRender =  <Chords name="ChordWheel"
                                            url="http://localhost:9099/api/nodes"/>;
        }else if(openedTab == "mm"){
            tabContentToRender = <Flatgrids url="http://localhost:9099/api/memory"
                                            name="Flatgrids"
                                            spoofedData={DataSpoofer.GridsData()}/>;
        }

        return (
            <div className="row" style={{padding: "0px"}}>

                <div id="headerPanel" className={headerClasses}
                    style={{marginBottom: this.state.boxMargin}}>
                    <Header/>
                </div>


                <div id="leftPanel" className={sidesClasses}
                        style={{ paddingLeft : this.state.boxMargin,
                                marginLeft:"0px",
                                maxWidth : this.state.panelMaxWidth,
                                minWidth : this.state.panelMinWidth}}>
                    <PercentCircle name="CPU"
                                    height={panelHeight}
                                    url={"http://localhost:9099/api/metrics/cpu"}
                                    marginBottom={this.state.boxMargin}
                                    spoofedData={DataSpoofer.cpuData()}/>
                    <PercentCircle name="Fabric Attached Memory"
                                    height={panelHeight}
                                    url={"http://localhost:9099/api/metrics/fam"}
                                    marginBottom={this.state.boxMargin}
                                    spoofedData={DataSpoofer.famData()}/>
                    <PercentCircle name="Fabric"
                                    height={panelHeight}
                                    url={"http://localhost:9099/api/metrics/fabric"}
                                    marginBottom={"0px"}
                                    spoofedData={DataSpoofer.fabData()}/>
                </div>


                <div className="col-md-8"
                    style={{width: middleWidth, padding: "0px"}}>
                    <Middle paddingL={this.state.boxMargin}
                            paddingR={this.state.boxMargin}
                            activeKey={1} height={middleHeight}>
                        {tabContentToRender}
                    </Middle>
                </div>

                {this.props.children}

            </div>
        );

    }//render

}//class

Skeleton.propTypes  = {
    id : PropTypes.string.isRequired,
}

export default Skeleton;
