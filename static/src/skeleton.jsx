'use strict';

import React from 'react';
import {render} from 'react-dom';

import Header           from    './components/header';
import PercentCircle    from    './components/percentcircle';
import Flatgrids        from    './visualization/grids'
import Middle           from    './components/middle';


class Skeleton extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            panelMaxWidth : "300px",
            panelMinWidth : "250px",
            panelWidth : 300, //tracks current width of the side panels
            headerHeight : 55, //current header's panel height
            midWidth : "fill",
            boxMargin : "8px",
            panelPadding : ["5px", "5px", "5px", "5px"],
            windowHeight : window.innerHeight,
            windowWidth : window.innerWidth
        }
    }//ctor


    getHeight(offset, divider){ return (window.innerHeight - offset) / divider; }
    getWidth(offset, divider){ return (window.innerWidth - offset) / divider; }


    getElementDimensions(elementId){
        var element = document.getElementById(elementId);
        var dimensions = leftPanel.getBoundingClientRect();
        return [dimensions.width, dimensions.height];
    }//getElementDimensions


    componentWillMount(){
        window.addEventListener("resize", this.updateDimensions.bind(this));
    }//componentWillMount


    componentDidMount(){
        window.removeEventListener("resize", this.updateDimensions.bind(this));
        this.state.panelWidth = this.getElementDimensions("leftPanel")[0];
        this.state.headerPanel = this.getElementDimensions("headerPanel")[1]
    }//componentDidMount


    updateDimensions(){
        this.setState({
            windowHeight : window.innerHeight,
            windowWidth : window.innerWidth
        });
    }//updateDimensions


    shouldComponentUpdate(nextProps, nextState){
        var isHeightChanged = (this.state.windowHeight != window.innerHeight);
        var isWidthChanged = (this.state.widnowWidth != window.innerWidth);
        return isHeightChanged || isWidthChanged || isPanelWidthChanged;
    }//shouldComponentUpdate


    render() {
        var headerClasses = "col-md-12 header";
        var sidesClasses = "col-md-2";
        var panelHeight = this.getHeight(this.state.headerHeight, 3) + "px";

        var boxMarginVal = parseFloat(this.state.boxMargin.split("px")[0]);
        var middleWidth = window.innerWidth - (this.state.panelWidth * 2) - boxMarginVal * 3;
        var middleHeight = this.getHeight(this.state.headerHeight + 40, 1) + "px";

        var openedTab = window.location.href.split("#/")[1];
        var elementToRender = "";
        if(openedTab == "overview"){
            elementToRender = <Flatgrids />;
        }else if(openedTab == "mm"){
            elementToRender = "Memory Management Tab";
        }


        return (
            <div className="row">

                <div id="headerPanel" className={headerClasses}
                    style={{marginBottom: this.state.boxMargin}}>
                    <Header/>
                </div>


                <div id="leftPanel" className={sidesClasses}
                        style={{ paddingLeft : this.state.boxMargin,
                                maxWidth : this.state.panelMaxWidth,
                                minWidth : this.state.panelMinWidth}}>
                    <PercentCircle name="CPU" height={panelHeight}
                                   mbBottom={this.state.boxMargin}/>
                    <PercentCircle name="Fabric Attached Memory"  height={panelHeight}
                                    mbBottom={this.state.boxMargin}/>
                    <PercentCircle name="Fabric" height={panelHeight}
                                    mgBottom={"0px"}/>
                </div>


                <div className="col-md-8"
                    style={{width: middleWidth, padding: "0px"}}>
                    <Middle paddingL={this.state.boxMargin}
                            paddingR={this.state.boxMargin}
                            activeKey={1} height={middleHeight}>
                        {elementToRender}
                    </Middle>
                </div>


                {this.props.children}

            </div>
        );

    }//render

}//class


export default Skeleton;