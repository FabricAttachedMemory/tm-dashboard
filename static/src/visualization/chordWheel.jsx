'use strict';
import React from 'react';
import {render} from 'react-dom';
import PropTypes from 'prop-types';
import {Grid, Col} from 'react-bootstrap';
import * as d3 from 'd3'


// Returns an array of tick angles and values for a given group and step.
function groupTicks(d, step) {
  var k = (d.endAngle - d.startAngle) / d.value;
  return d3.range(0, d.value, step).map(function(value) {
    return {value: value, angle: value * k + d.startAngle};
  });
}


class Chords extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            numberOfNodes : 14,
            toggleState : true,
            loadingType : 1,
            loadingOne : 0,
            loadingTwo : 0,
            refreshRate : 100,
            deltaTime : 0,
            activeNode : -1
        };
    }//constructor



    componentDidMount(){

        var matrix = [];

        for(var i =0; i < this.state.numberOfNodes; i++){
            var arcs = [];
            for(var j =0; j < this.state.numberOfNodes; j++)
                arcs.push(50);
            matrix.push(arcs);
        }

        var svg = d3.select("#abyss-circle"),
            width = svg.attr("width"),
            height = svg.attr("height"),
            outerRadius = Math.min(width, height)*0.435, //circle's overall radius
            innerRadius = outerRadius - 30; //radius of where arcs are growing from

        var chord = d3.chord()
            .padAngle(0.01)
            .sortSubgroups(d3.descending);

        var arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        var ribbon = d3.ribbon()
            .radius(innerRadius);

        var color = d3.scaleOrdinal()
            .domain(d3.range(4))
            .range(["#425563", "green", "yellow", "orange"]);


        var g = svg.append("g")
            .attr("transform",
                    "translate(" + width / 2.4 + "," + height / 2.8 + ")")
            .datum(chord(matrix));

        //Creating Inner circle with Node names labels
        var innerRectGroups = this.createRectCircle(g, arc);

        g.append("g")
            .attr("class", "ribbons")
          .selectAll("path")
          .data(function(chords) { return chords; })
          .enter()
            .append("path")
            .attr("d", ribbon)
            .attr("class", "ribbonPath")
                .attr("id", function(d, i) { return "arcPath_" + i; })
            // RIBBON inner collor
            //.style("fill", function(d) { return "#2AD2C9"; })
            .style("fill", function(d) { return "rgb(0, 0, 0, 0)"; })
            //RIBBON corder\stroke color
            //.style("stroke", function(d) { return d3.rgb("#2AD2C9").darker(); });
            .style("stroke", function(d) { return d3.rgb("#00000"); });


        setInterval(() => {
            if(this.state.loadingOne == 3){
                this.state.toggleState = true;
                this.state.loadingType = 2;
            }

            if(this.state.loadingType == 1)
                this.loading_1();

            if(this.state.loadingType == 2){
                this.state.deltaTime += 1;
            }
            if(this.state.deltaTime >= 10){
                this.state.deltaTime = 0;
                this.state.loadingType = 1;
                this.state.loadingOne = 0;
                this.state.toggleState = false;
            }
        }, this.state.refreshRate);


    }//componentDidUpdate


    loading_1(){
        var pathObj = d3.selectAll("g.ribbons path");
        var node = this.state.activeNode;
        if(node < 0){
            this.state.toggleState = !this.state.toggleState;
            node = 0;
        }

        var prevNode = node - 1;
        if(prevNode < 0)
            prevNode = this.state.numberOfNodes - 1;

        this.showNodeActivity(pathObj, node, this.state.toggleState);

        if(node >= this.state.numberOfNodes){
            this.state.toggleState = !this.state.toggleState;
            node = 0;
            this.state.loadingOne += 1;
        }

        node = node + 1;
        this.state.activeNode = node;
    }//loading_1


    showNodeActivity(path, node, isShow){
        path.filter(function(d){
                var isPath = d.source.index == node || d.target.index == node;
                return isPath;
            })
      .transition()
                .style("opacity", function(d) {
                                return (isShow ? 1 : 0.2); })
                .style("fill", function(d) {
                                return (isShow ? "#2AD2C9" : "rgba(0, 0, 0, 0.0)"); })
                .style("stroke", function(d) {
                                return (isShow ? d3.rgb("#2AD2C9").darker() : "#000000"); });
    }//showNodeActivity



fade(opacity, node) {
  return function(d, i) {
    d3.selectAll("g.ribbons path")
        .filter(function(d) {
    console.log(node);
          return d.source.index == node || d.target.index == node;
        })
      .transition()
            .style("opacity", function(d) {
                            return (opacity == 1 ? 1 : opacity); })
            .style("fill", function(d) {
                            return (opacity == 1 ? "#2AD2C9" : "rgba(0, 0, 0, 0.0)"); })
            .style("stroke", function(d) {
                            return (opacity == 1 ? d3.rgb("#2AD2C9").darker() : "#000000"); });
  };

}



    /* Create rectangle group forming a full circle.
     *
     * @param g : <g> element to append rectangles to.
     * @param arc : d3.arc() element.
     * @return : return created rectangles group.
    */
    createRectCircle(g, arc){
        //Container for the inner rectangle group that has Node Number label
        var nodeRectGroup = g.append("g")
            .attr("class", "nodeRectGroup")
            .selectAll("g")
             .data(function(chords) { return chords.groups; })
             .enter().append("g");

        nodeRectGroup.append("path")
            .attr("id", function(d, i) { return "outerRect_" + d.index; })
             //Background color for the inner circle rectangles
            .style("fill", function(d) { return "#425563"; })
            .attr("d", arc)
            .on("mouseover", this.fade(1))
            .on("mouseout", this.fade(0.1));


        nodeRectGroup.append("text")
            .attr("x", 80)
            .attr("dy", 20)
            .append("textPath")
                .attr("xlink:href", function(d) {
                    return "#outerRect_" + d.index; })
                .text(function(d, i) { return "Node " + (d.index); })
                .style("fill", "white");
        return nodeRectGroup;
    }//createRectCircle


    render(){
        return(
            <div className="row">
                <div className="col-md-2"></div>
                <div className="col-md-8">
                    <svg id="abyss-circle" className="chord"
                            width="800" height="800">
                    </svg>
                </div>
                <div className="col-md-2"></div>
            </div>
        );
    }//render


}//class



export default Chords;
