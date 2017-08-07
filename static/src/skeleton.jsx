'use strict';

import React from 'react';
import {render} from 'react-dom';

import Header           from    './components/header';
import PercentCircle    from    './components/percentcircle';


class Skeleton extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            panelMaxWidth : "300px",
            panelMinWidth : "250px",
            panelWidth : "300", //tracks current width of the side panels
            headerHeight : "55", //current header's panel height
            midWidth : "fill",
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
        this.setState({
            panelWidth : getElementDimensions("leftPanel")[0],
            headerPanel : getElementDimensions("headerPanel")[1]
        });
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
        var headerClasses = "col-md-12";
        var sidesClasses = "col-md-2";
        var panelHeight = this.getHeight(45, 3) + "px";

        return (
            <div className="row">
                <div id="headerPanel" className={headerClasses} style={{padding:"0px"}}>
                    <Header/>
                </div>

                <div id="leftPanel" className={sidesClasses}
                        style={{maxWidth : this.state.panelMaxWidth,
                                minWidth : this.state.panelMinWidth}}>
                    <PercentCircle name="CPU" height={panelHeight}/>
                    <PercentCircle name="Fabric Attached Memory"  height={panelHeight}/>
                    <PercentCircle name="Fabric" height={panelHeight}/>
                </div>

                {this.props.children}

            </div>
        );

    }//render

}//class


export default Skeleton;
