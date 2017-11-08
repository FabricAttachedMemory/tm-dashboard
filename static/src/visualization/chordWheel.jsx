'use strict';
import React        from 'react';
import {render}     from 'react-dom';
import PropTypes    from 'prop-types';
import * as d3      from 'd3'

import * as RackOverview from './rackOverviewBox';
import * as NodeStats    from '../components/nodeStats';
import * as DataSpoofer  from '../components/spoofer';
import * as DataSharing  from '../components/dataSharing';
import ApiRequester      from '../components/base/apiRequester';

var MATRIX = [];
var ACTIVE_NODE = -1;


class Chords extends ApiRequester{

    constructor(props){
        super(props);
        this.state.topology = [];

        this.state.matrix = [[]];       //original data arrived from the server
        this.state.innerRadius = 0;
        this.state.outerRadius = 0;
        this.state.outerRectOR = 0;
        this.state.svgWidth = 0;
        this.state.svgHeight = 0;
        this.state.renderMatrix = [[]]; //all inputs converted to 0 and 1 (only!)
        this.state.svg = undefined;
        this.state.chordLayout = undefined;

        this.state.topology = DataSpoofer.SystemTopology(); // FIXME: Real data here
        this.state.matrix   = DataSpoofer.ChordMatrix(this.state.topology); //FIXME: TRASH

        this.state.renderMatrix     = this.constructRenderMatrix(this.state.matrix);

        MATRIX = this.state.matrix;
    }//constructor


    /**
     *  Given matrix with the data flow, construct a matrix that will be used for
     * arcs rendering. It will have "1" for each node, except for "0" for those
     * arcs that looping into itself: [[0, 1], [1, 0]];
     * @param {2d array} matrix "real" data with the nodes activity data.
     */
    constructRenderMatrix(matrix){
        var length = matrix.length;
        var renderMatrix = [];

        for(var i=0; i<length; i++){
            var flow = [];
            for(var j=0; j<length; j++){
                //to keep arcs' base width consistant, add 1 to every node flow
                //filter what show and not to show later, on node select.
                flow.push(1);
            }
            //when matrix is all 0, chrods will not render at all. To avoid this,
            //make sure at least a self-looping arc is non zero. However, it will
            //not be rendered on node selection.
            flow[i] = 1;
            renderMatrix.push(flow);
        }//for
        return renderMatrix;
    }//constructRenderMatrix


    buildChordsDiagram(svg, renderMatrix, topology){
        if(this.state.matrix === undefined){
            return;
        }
        if(svg === undefined)
            return;

        var innerRadius = this.state.innerRadius;
        var outerRadius = this.state.outerRadius;

        // --- Create a d3.chord() component to be used for the main drawing. ---
        var mainChord = this.createChord(svg, renderMatrix);
        var chord = mainChord.chord;
        var g = mainChord.g;
        var arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        // --- Creating first Inner "circle" rectangle group with the node names in it. ---
        var innerRectGroups = this.createRectCircle(g, arc);
        innerRectGroups.selectAll("path")
            .on("mouseover", (e) => this.onMouseOver(e)) // use "(e) =>" to be able to use "this"
            .on("mouseout", (e) => this.onMouseOut(e));
        this.setGroupId(innerRectGroups, "innerRectCircle_", "nodeNumberRect");
        innerRectGroups.append("text")
            .on("mouseover", (e) => { this.onMouseOver(e)})
            .on("mouseout", (e) => { this.onMouseOut(e)})
            .attr("dy", 20)
            .append("textPath")
            .attr("startOffset", "17%") //nodes names text offset
            .attr("xlink:href", function(d) { return "#innerRectCircle_" + d.index; })
            .text(function(d, i) { return (d.index+1 < 10) ? "0" + (d.index+1) : (d.index+1); })
            .style("fill", "white");

        // --- Creating Arcs(path) flow between nodes(rects) ---
        this.createRibbonArcs(g);

        //Outer Rect Circle Group
        //IR is short for Inner Radius. OR = Outer Radius
        var outerRectIR = innerRadius + 40;
        var outerRectOR = outerRadius + 35;
        var outerRect = d3.arc()
            .innerRadius(outerRectIR)
            .outerRadius(outerRectOR);

        var outerRectGroup = this.createRectCircle(g, outerRect);
        this.setGroupId(outerRectGroup, "outerRect_");

        // --- filling percent relative to the arc2 (outer rect group). ---
        var arc3Outer = outerRectOR - 26;
        var arc3 = d3.arc()
            .innerRadius(outerRectIR)
            .outerRadius( (d,i) => { return this.cpuBarChartValue(d, i, outerRectOR); } );

        var highlightGroup = this.createRectCircle(g, arc3, d3.rgb("#35444F"));
        this.setGroupId(highlightGroup, "HightlightGroup_", "cpuRectangle");


        // --- Create an arc line group with the Enclosure names. ---
        var sectionSpace = 0.1; //To add more space between Enclosure # arcs
        var encMatrix = Array(topology.length).fill(Array(topology.length).fill(1));
        var encThingy = this.createChord(svg, encMatrix, sectionSpace);
        var encChord = encThingy.chord;
        var encG = encThingy.g;

        var encArc = d3.arc()
            .innerRadius(outerRectOR + 12)
            .outerRadius(outerRectOR + 14)
            //adds rotation since .padAngle() pads on one side only. It is set
            //in createChord() func by passing third optional argument "sectionSpace"
            .startAngle(function(d) { return d.startAngle + sectionSpace / 2;})
            .endAngle(function(d) { return d.endAngle + sectionSpace / 2;});

        var encArcGroup = this.createRectCircle(encG, encArc, "#A0A9B1");
        this.setGroupId(encArcGroup, "EnclosureName_");

        encArcGroup.append("text")
            .attr("font-size", "1.5em")
            .attr("letter-spacing", "0.2em")
            .attr("dy", -5)
        .append("textPath")
            .attr("startOffset", "25%")
            .attr("xlink:href", function(d) {
                return "#EnclosureName_" + d.index; })
            .text(function(d, i) { return "Enclosure " + (d.index + 1); })
            .style("fill", "#A0A9B1");

        DataSharing.Set("Enclosures", topology.length);
        DataSharing.Set("Topology", topology.toString());
    }//buildChordsDiagram


    cpuBarChartValue(d, i, outer){
        var nodesData = NodeStats.GetNodesData();
        var maxToAdd = 28; //max value to add to fill the whole rectangle
        var ratio = maxToAdd;
        var cpuValue = nodesData[d.index]['CPU Usage'];
        if(cpuValue.split("%").length > 1){
            cpuValue = parseFloat(cpuValue.split("%")[0]);
            ratio = (cpuValue / 100) * maxToAdd
            ratio = maxToAdd - ratio;
        }
        return outer - ratio;
    }


    // Create an outer circle arc line with the enclosure name for the group.
    // param@ svg: svg object reference (d3.select()) to create chords into.
    // param@ matrix: a 2D array of integers showing the data flow between nodes.
    createChord(svg, matrix, sectionSpace=0.01){
        if(matrix === undefined)
            return;

        this.state.svgWidth = svg.attr("width");
        this.state.svgHeight = svg.attr("height");
        var radiusRatio = 0.415;

        if(window.innerWidth < 1600)
            radiusRatio = 0.38;
        //circle's overall radius
        this.state.outerRadius = Math.min(
                                this.state.svgWidth,
                                this.state.svgHeight)*radiusRatio; //overall chord Radius
        //radius of where arcs are growing from
        this.state.innerRadius = this.state.outerRadius - 35;
        var chord = undefined;
            chord = d3.chord()
                .padAngle(sectionSpace) //space between rectangles
                .sortSubgroups(d3.acscending)
                .sortChords(d3.acscending);

        var g = svg.append("g")
            .attr("transform",
                    "translate(" + this.state.svgWidth / 1.95 + "," +
                                   this.state.svgHeight / 2 + ")")
            .datum(chord(matrix));
        return {"chord": chord, "g": g};
    }//createEnclosureArc


    setGroupId(group, idPrefix, className=""){
        group.selectAll("path")
            .attr("id", function(d, i) { return idPrefix + d.index; })
            .attr("class", className);
    }//setGroupId


    // Arcs representing data flow will be created. Arc path is calculated by
    // d3.datum(matrix) object called before this function is executed.
    //  @param parentObj : element on the page to append created arcs into.
    createRibbonArcs(parentObj){
        //used to save StartAngle for each ribbon subgroup.
        var startAng = {};
        var ribbon = d3.ribbon()
        // offset value defines where arcs start and ends
            .radius(this.state.innerRadius - 5);

        ribbon.startAngle(function(d) {
            if(!(d.index in startAng))
                startAng[d.index] = d.startAngle + 0.02;
            return startAng[d.index];
        });

        ribbon.endAngle(function(d){ return startAng[d.index] + 0.02;});

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
                    .attr("id", function(d, i) { return "arcPath_" + i; });
    }//createRibbonArcs


    // Create rectangle group forming a full circle.
    //  @param parentObj : <g> element to append rectangles to.
    //  @param arc : d3.arc() element.
    //  @return : return created rectangles group.
    createRectCircle(parentObj, arc, fill="#425563"){
        //Container for the inner rectangle group that has Node Number label
        var nodeRectGroup = parentObj.append("g")
            .attr("class", "nodeRectGroup")
            .selectAll("g")
             .data(function(chords) { return chords.groups; })
             .enter().append("g");

        nodeRectGroup.append("path")
             //Background color for the inner circle rectangles
            .style("fill", fill)
            .attr("d", arc);
        return nodeRectGroup;
    }//createRectCircle


    // React to the mouse hover over the rectangle element with the Node name
    // in it to display data flow (ribbons path).
    onMouseOver(arcData){
        var enc = GetEncFromNode(this.state.topology, arcData.index);

        // RackOverview.SetActive(enc, arcData.index, true);
        ShowNodeActivity(arcData.index, true);
    }//onMouseOver


    // React to the mouse hover out from the rectangle element to hide data
    // flow (ribbon path) between nodes.
    onMouseOut(arcData){
        var enc = GetEncFromNode(this.state.topology, arcData.index);

        RackOverview.SetActive(enc, arcData.index, false);
        ShowNodeActivity(arcData.index, false);
    }//onMouseOut


    shouldComponentUpdate(nextProps, nextState){
        var shouldUpdate = this.getUpdateState(nextProps, nextState);

        var fetched = nextState.fetched;

        var isNo = this.validateFetchedData(fetched);
        if(!isNo)
            return shouldUpdate;

        var matrix = fetched["data_flow"];
        var renderMatrix = this.constructRenderMatrix(matrix);

        this.setState({ matrix : matrix });
        this.setState({ renderMatrix : renderMatrix});

        var newTopology = fetched["topology"];

        this.setState({ topology : newTopology });
        this.setState({ isRetop : false });

        MATRIX = fetched["data_flow"];
        var svgObj = d3.select("#abyss-circle");
        svgObj.selectAll("g").remove();

        this.setState({svg : svgObj});
        this.buildChordsDiagram(svgObj, renderMatrix, fetched["topology"]);

        if(ACTIVE_NODE != -1){
            ShowNodeActivity(ACTIVE_NODE, true);
            return false;
        }

        return shouldUpdate;
    }//shouldComponentUpdate


    componentDidMount(){
        var svgObj = d3.select("#abyss-circle");
        this.setState({svg : svgObj});
        this.buildChordsDiagram(svgObj, this.state.matrix, this.state.topology);
    }//componentDidMount


    validateFetchedData(fetched){
        if(fetched === undefined)
            return false;
        if (fetched instanceof Response)
            return false;

        if(fetched["data_flow"] == this.state.matrix)
            return false;
        return true;
    }//noNameFunc


    render(){
        var wRatio = 0.5;
        //FIXME: this is bs... need some "smarter" approach to dynamic positioning
        if(window.innerWidth > 1200)
            wRatio = 0.5;
        if(window.innerWidth > 1800)
            wRatio = 0.59;
        if(window.innerWidth > 2400)
            wRatio = 0.62;

        var w = window.innerWidth * wRatio;
        var h = window.innerHeight * 0.8;
        return(
            <div className="row">
                <div className="row">
                    <div className="col-md-12 hpeFont"
                        style={{textAlign: "center", marginTop: "2em", fontSize: "2em"}}>
                    Fabric Attached Memory used by System-on-Chip
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-1"></div>
                    <div className="col-md-10">
                        <svg id="abyss-circle" className="chord"
                            width={w} height={h}>
                        </svg>
                    </div>
                    <div className="col-md-1"></div>
                </div>
            </div>
        );
    }//render


}//class


export default Chords;

const COLORS = {
    default : {
        systemLoadRect : "#35444F",
        nodeNumberRect : "#425563",
        outerRect : "",
    },
    active : {
        systemLoadRect : "#00AA84",
        nodeNumberRect : "#2AD2C9",
    },
    passive : {
        systemLoadRect : "#217D73",
    },
};


// Highlight arcs going for the given node.
//  @param node: Node number to show activity of.
//  @param state: bool state to show(true) or hide(false) node activity.
export function ShowNodeActivity(node, state){
    ACTIVE_NODE = state == true ? node : -1;

    var pathObj = d3.selectAll("g.ribbons path");

    var connections = findArcsFromMatrix(node);
    if(connections.length < 1)
        return;

    pathObj.filter((d) =>{
        var pathIndex = d.source.index + "->" + d.source.subindex;
        //Don't render selflooping arc
        var itself = d.source.index === node && d.source.subindex == node;
        return connections.includes(pathIndex) && !itself;
        })
        .transition()
            .style("opacity", function(d) {
                    return (state ? 1 : 0.1); })
            .style("fill", function(d) {
                    return state ? "#2AD2C9" : "none"; })
            .style("stroke", function(d) {
                    return state ? d3.rgb("#2AD2C9").darker() : "none"; });

    var filter_func = (d) => {
        return connections.includes(node+"->"+d.index);
    } //same as writing function(d) {}
    setRectGroupStyle(".cpuRectangle", "systemLoadRect", state, filter_func, "passive")

    filter_func = (d) => { return d.index == node; }
    setRectGroupStyle("#HightlightGroup_" + node, "systemLoadRect", state, filter_func)

    setRectGroupStyle("#innerRectCircle_" + node, "nodeNumberRect", state, filter_func);

    var topology = DataSharing.Get("Topology").split(',');
    var enc = GetEncFromNode(topology ,node)

    RackOverview.SetActive(enc, node, state);

    if(state)
        NodeStats.SetFields(node, enc);
    else
        NodeStats.SetFields(-1, enc); //remove all stats values on hoverout event
}//ShowNodeActivity


/**
 * This function should only be called by ShowNodeActivity(). It will construct
 * a list of arc flows based of the selected node and the real MATRIX data (not
 * the one used by chords to render arcs).
 *
 * @param {int} node
 * @returns {list of str} data flows between nodes in the format of ["0->1"].
 */
function findArcsFromMatrix(node){
    var list = [];
    if(node >= MATRIX.length || node < 0){
        console.warn("Cant show arcs for node [" + node + "]! Out of range");
        return list;
    }

    for(var i=0; i < MATRIX[node].length; i++){
        if(MATRIX[node][i] == 0){
            list.push(i + "!->" + node);
            list.push(node + "!->" +i);
            continue;
        }
        list.push(i + "->" + node);
        list.push(node + "->" +i);
    }//for
    return list;
}//findArcsFromMatrix


/**
 * Same code patterns has been used several times to set rectangles' group style
 * properties (fill, stroke). To reduce code "repeatability" - this disgusting
 * function was born. It should only be used by "ShowNodeActivity()" function.
 *  @param selection: string to be used by d3.selectAll() function. It can be
 *                    classes, ids or both. (e.g. "#id_to_select, .className")
 * @param {str} selection pattern d3.selectAll() function. It can be classes,
 *                        ids or both. (e.g. "#id_to_select, .className")
 * @param {str} colorPropName Color property name found in the COLORS global.
 * @param {bool} state Show or Hide state propagated from ShowNodeActivity().
 * @param {any} filter_func function. Filter which elements to apply style to.
 * @param {string} [colorType="active"] active, passive, default.
 */
function setRectGroupStyle(selection, colorPropName, state, filter_func, colorType="active"){
    d3.selectAll(selection)
    .filter(filter_func)
        .transition()
            .style("fill", function(d) {
                return state ? COLORS[colorType][colorPropName] : COLORS.default[colorPropName]; })
            .style("stroke", function(d) {
                return state ? COLORS[colorType][colorPropName] : "none"; });
}//setRectGroupStyle


// Return an enclosure number for the Node number. -1 will be returned if node
// is outside of the node count or not found in the layout array.
//  @param layout: array representation of System layout. Index of the array is
//                an enclosure number, element of the index is number of nodes.
//  @param node: node number to get an Enclosure number for.
export function GetEncFromNode(layout, node){
    var start = 0;
    var end = 0;
    for(var i=0; i < layout.length; i++){
        var nodeCount = parseInt(layout[i]);
        end = start + nodeCount - 1;
        if(node >= start && node <= end)
            return i;
        start = start + nodeCount;
    }//for
    return -1;
}//getEncFromNode


export function GetMatrix(){
    return MATRIX;
}
