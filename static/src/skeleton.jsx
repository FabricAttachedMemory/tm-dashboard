'use strict';

import React from 'react';
import {render} from 'react-dom';

import Header           from    './components/header';
import PercentCircle    from    './components/percentcircle';


class Skeleton extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            panelWidth : "220px",
            windowHeight : window.innerHeight,
            windowWidth : window.innerWidth
        }
    }//ctor


    getHeight(offset, divider){
        return (window.innerHeight - offset) / divider;
    }//getHeight


    getWidth(offset, divider){
        return (window.innerWidth - offset) / divider;
    }


    componentWillMount(){
        window.addEventListener("resize", this.updateDimensions.bind(this));
    }//componentWillMount


    componentDidMount(){
        window.removeEventListener("resize", this.updateDimensions.bind(this));
    }//componentDidMount


    updateDimensions(){
        this.setState({
            windowHeight : window.innerHeight,
            windowWidth : window.innerWidth
        });
        console.log("Here");
    }//updateDimensions


    shouldComponentUpdate(nextProps, nextState){
        var isHeightChanged = (this.state.windowHeight != window.innerHeight);
        var isWidthChanged = (this.state.widnowWidth != window.innerWidth);
        return isHeightChanged || isWidthChanged;
    }//shouldComponentUpdate


    render() {
        var headerClasses = "col-md-12";
        var sidesClasses = "col-md-2";
        var panelHeight = this.getHeight(65, 3) + "px";

        return (
            <div className="row" style={{marginTop: "0px", marginBottom:"0px"}}>
                <div className={headerClasses} style={{padding:"0px", marginBottom: "0.5em"}}>
                    <Header/>
                </div>

                <div className={sidesClasses}
                        style={{marginLeft:"10px", maxWidth : this.state.panelWidth}}>
                    <PercentCircle name="CPU" height={panelHeight}/>
                    <PercentCircle name="Fabric Attached Memory"  height={panelHeight}/>
                    <PercentCircle name="Fabric" height={panelHeight}/>
                </div>
`
                {this.props.children}

            </div>
        );

    }//render

}//class


export default Skeleton;
