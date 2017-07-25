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
    }//constructor



    componentDidMount(){

        var matrix = [
            [10, 10, 10, 10],
            [10, 10, 10, 10],
            [10, 10, 10, 10],
            [10, 10, 10, 10]
        ];

        var svg = d3.select("#abyss-circle"),
            width = svg.attr("width"),
            height = svg.attr("height"),
            outerRadius = Math.min(width, height)*0.3, //circle's overall radius
            innerRadius = outerRadius - 30; //radius of where arcs are growing from

        var formatValue = d3.formatPrefix(",.0", 1e3);

        var chord = d3.chord()
            .padAngle(0.05)
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
            .attr("transform", "translate(" + width / 2.4 + "," + height / 2.8 + ")")
            .datum(chord(matrix));

        var group = g.append("g")
            .attr("class", "groups")
          .selectAll("g")
          .data(function(chords) { return chords.groups; })
          .enter().append("g");


        group.append("path")
            .style("fill", function(d) { return "#425563"; }) //Color for the OUTER thing
            .style("stroke", function(d) { return d3.rgb("#425563").darker(); }) //Outer border\outline color
            .attr("d", arc);

        var groupTick = group.selectAll(".group-tick")
          .data(function(d) { return groupTicks(d, 1e3); })
          .enter().append("g")
            .attr("class", "group-tick")
            .attr("transform", function(d) { return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + outerRadius + ",0)"; });


        groupTick.append("line")
            .attr("x2", 6);

        groupTick
          .filter(function(d) { return d.value % 5e3 === 0; })
          .append("text")
            .attr("x", 8)
            .attr("dy", ".35em")
            .style("text-anchor", function(d) { return d.angle > Math.PI ? "center" : null; })
            .text(function(d) { return formatValue(d.value); });

        g.append("g")
            .attr("class", "ribbons")
          .selectAll("path")
          .data(function(chords) { return chords; })
          .enter().append("path")
            .attr("d", ribbon)
            .style("fill", function(d) { return "#2AD2C9"; }) // RIBBON inner collor
        .style("stroke", function(d) { return d3.rgb("#2AD2C9").darker(); }); //RIBBON corder\stroke color

    }


    render(){
        return(
            <svg id="abyss-circle" width="600" height="500">
            </svg>
        );
    }//render


}//class


Chords.propTypes = {
    Target: PropTypes.string.isRequired
};


export default Chords;
