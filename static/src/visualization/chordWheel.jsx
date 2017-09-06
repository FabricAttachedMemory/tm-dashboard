'use strict';
import React        from 'react';
import {render}     from 'react-dom';
import PropTypes    from 'prop-types';
import * as d3      from 'd3'

import * as RackOverview from './rackOverviewBox';
import * as DataSpoofer  from '../components/spoofer';


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
            systemLayout : [],
            innerRadius : 0,
            outerRadius : 0,
            svgWidth : 0,
            svgHeight : 0,
        };

        this.state.systemLayout = DataSpoofer.hardwareLayout(); //FIXME: TRASH
    }//constructor



    componentDidMount(){
        var matrix = [];

        for(var i =0; i < this.state.numberOfNodes; i++){
            var arcs = [];
            for(var j =0; j < this.state.numberOfNodes; j++)
                arcs.push(50);
            matrix.push(arcs);
        }

        var svg = d3.select("#abyss-circle");
        this.state.svgWidth = svg.attr("width");
        this.state.svgHeight = svg.attr("height");
        //circle's overall radius
        this.state.outerRadius = Math.min(
                                this.state.svgWidth,
                                this.state.svgHeight)*0.415;
        //radius of where arcs are growing from
        this.state.innerRadius = this.state.outerRadius - 30;

        var chord = d3.chord()
            .padAngle(0.01)
            .sortSubgroups(d3.descending);

        var arc = d3.arc()
            .innerRadius(this.state.innerRadius)
            .outerRadius(this.state.outerRadius);

        var g = svg.append("g")
            .attr("transform",
                    "translate(" + this.state.svgWidth / 1.95 + "," +
                                    this.state.svgHeight / 2 + ")")
            .datum(chord(matrix));

        //Creating Inner circle with Node names
        var innerRectGroups = this.createRectCircle(g, arc);
        innerRectGroups.selectAll("path")
            .on("mouseover", (e) => this.onMouseOver(e))
            .on("mouseout", (e) => this.onMouseOut(e));
        this.createRibbonArcs(g);


        var arc2 = d3.arc()
            .innerRadius(this.state.innerRadius + 35)
            .outerRadius(this.state.outerRadius + 35);
        var outerRectGroup = this.createRectCircle(g, arc2);

    }//componentDidUpdate


    /* Arcs representing data flow will be created. Arc path is calculated by
     * d3.datum(matrix) object called before this function is executed.
     * @param parentObj : element on the page to append created arcs into.
     */
    createRibbonArcs(parentObj){
        var ribbon = d3.ribbon()
            .radius(this.state.innerRadius);

        var color = d3.scaleOrdinal()
            .domain(d3.range(1));
        parentObj.append("g")
            .attr("class", "ribbons")
            .selectAll("path")
             .data(function(chords) { return chords; })
             .enter()
             .append("path")
              .attr("d", ribbon)
              .attr("class", "ribbonPath")
              .attr("id", function(d, i) { return "arcPath_" + i; })
              // RIBBON inner collor
              .style("fill", function(d) { return "rgb(0, 0, 0, 0)"; })
              //RIBBON corder\stroke color
              .style("stroke", function(d) { return d3.rgb("#00000"); });
    }//createRibbonArcs


    /* Create rectangle group forming a full circle.
     *
     * @param parentObj : <g> element to append rectangles to.
     * @param arc : d3.arc() element.
     * @return : return created rectangles group.
    */
    createRectCircle(parentObj, arc){
        //Container for the inner rectangle group that has Node Number label
        var nodeRectGroup = parentObj.append("g")
            .attr("class", "nodeRectGroup")
            .selectAll("g")
             .data(function(chords) { return chords.groups; })
             .enter().append("g");

        nodeRectGroup.append("path")
            .attr("id", function(d, i) { return "outerRect_" + d.index; })
             //Background color for the inner circle rectangles
            .style("fill", function(d) { return "#425563"; })
            .attr("d", arc);


        nodeRectGroup.append("text")
            .on("mouseover", (e) => {
                        this.onMouseOver(e)})
            .on("mouseout", (e) => {
                        this.onMouseOut(e)})
            .attr("x", 50)
            .attr("dy", 20)
            .append("textPath")
                .attr("xlink:href", function(d) {
                    return "#outerRect_" + d.index; })
                .text(function(d, i) { return "Node " + (d.index + 1); })
                .style("fill", "white");
        return nodeRectGroup;
    }//createRectCircle


    onMouseOver(arcData){
        var enc = GetEncFromNode(this.state.systemLayout, arcData.index);
        RackOverview.SetActive(enc, arcData.index, true);
        ShowNodeActivity(arcData.index, true);
    }//onMouseOver


    onMouseOut(arcData){
        var enc = GetEncFromNode(this.state.systemLayout, arcData.index);
        RackOverview.SetActive(enc, arcData.index, false);
        ShowNodeActivity(arcData.index, false);
    }//onMouseOut




    render(){
        return(
            <div className="row">
                <div className="col-md-1"></div>
                <div className="col-md-10">
                    <svg id="abyss-circle" className="chord"
                        width="1000" height="800">
                    </svg>
                </div>
                <div className="col-md-1"></div>
            </div>
        );
    }//render


}//class


export default Chords;


/*  Highlight arcs going for the given node.
 * @param node: Node number to show activity of.
 * @param state: bool state to show(true) or hide(false) node activity.
*/
export function ShowNodeActivity(node, state){
    var pathObj = d3.selectAll("g.ribbons path");
    pathObj.filter(function(d){
            var isPath = d.source.index == node || d.target.index == node;
            return isPath;
        })
  .transition()
            .style("opacity", function(d) {
                            return (state ? 1 : 0.05); })
            .style("fill", function(d) {
                            return (state ? "#2AD2C9" : "rgba(0, 0, 0, 0.0)"); })
            .style("stroke", function(d) {
                            return (state ? d3.rgb("#2AD2C9").darker() : "#000000"); });
}//ShowNodeActivity


/*  Return an enclosure number for the Node number. -1 will be returned if node
 * is outside of the node count or not found in the layout array.
 * @param layout: array representation of System layout. Index of the array is
 *                an enclosure number, element of the index is number of nodes.
 * @param node: node number to get an Enclosure number for.
 */
export function GetEncFromNode(layout, node){
    var start = 0;
    var end = 0;
    for(var i=0; i < layout.length; i++){
        end = start + layout[i] - 1;
        if(node >= start && node <= end)
            return i;
        start = start + layout[i];
    }//for
    return -1;
}//getEncFromNode
