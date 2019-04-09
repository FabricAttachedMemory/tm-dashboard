/* This function sets responsible for spoofing the date for all of the "moving"
pieces of the ED: percent circles, grids, arcs and etc.. Most of this data is
predefined by human, since randomization does not always look good here.*/
'use strict';
import React from 'react';
import {render} from 'react-dom';


export function createRandomList(range, size){
    var result = [];
    for(var i=0; i < size; i++){
        var min = Math.ceil(range[0]);
        var max = Math.floor(range[1]); //max is exclusive
        var randValue = Math.floor(Math.random() * (max - min) + min);
        result.push(randValue);
    }
    return result;
}//createRandomList


export function cpuData(){
    return [-1]
    // return [ 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
}

export function famData(){
    return [-1]
    // return [ 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65];
}

export function fabData(){
    return [-1]
    // return [ 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43];
}


export function nodeStatsData(){
    var result = [];
    for(var i = 0; i < 40; i++){
        var dram = Math.floor(Math.random() * (15 - 5) + 5);
        var cpu = Math.floor(Math.random() * (20 - 10) + 10);
        var fab = Math.floor(Math.random() * (30 - 20) + 20);
        var shelves = Math.floor(Math.random() * (30 - 20) + 20);
        var books = Math.floor(Math.random() * (1000 - 700) + 700);
        var data = {
            "Node" : i,
            "Power State" : 'spoofed',
            "DRAM Usage" : dram + "%",
            "CPU Usage" : cpu + "%",
            "Fabric Usage" : fab + "%",
            "Network In" : 'n/a',
            "Network Out" : 'n/a',
            "No. of Shelves" : shelves,
            "OS Manifest" : "none",
            "No. Of Books" : books
        };
        result.push(data)
    }
    return result;
}//nodeStatsData


// Return a Matrix of data flow between nodes needed for the Chord diagram to
// render arcs (Overview tab)...
export function ChordMatrix(topology){
    var nodesCount = 0;
    for(var i=0; i < topology.length; i++){
        nodesCount += topology[i];
    }//for

    var matrix = [];
    for(var i=0; i<nodesCount; i++){
        var nodes_flow = [];
        for(var j=0; j<nodesCount; j++){
            nodes_flow.push(1);
        }
        nodes_flow[i] = 0;
        matrix.push(nodes_flow);
    }//for i
    matrix[1][2] = 0;
    matrix[1][3] = 0;
    matrix[4][1] = 0;
    matrix[5][9] = 0;
    return matrix;
}//ChordMatrix


// Return Nodes topology, where each element in the array represents number of
// nodes in that enclosure.
export function SystemTopology(){
    return [10, 10, 10, 10];
}//SystemTopology


export function GridsData(numOfBooks){
    var newColors = [];
    var list = []
    for(var i=0; i < numOfBooks; i++){
        var min = Math.ceil(-1);
        var max = Math.floor(4); //max is exclusive
        var randState = Math.floor(Math.random() * (max - min) + min);
        list.push(randState);
    }//for

    for (var i=0; i < list.length; i++) {
        var bookState = list[i];
        if (bookState == -1){
          newColors.push("boxOffline");
        }else if (bookState == 1){
          newColors.push("boxAllocated");
        }else if (bookState == 0){
          newColors.push("boxAvailable");
        }else if (bookState == 2){
          newColors.push("boxNotReady");
        }
    }
    return { dataSet : list, colorSet : newColors};
}//GridsData



//TODO: not used yet. finish spoofing flow.
export function ChordFlow(){
    var matrix =[];
    for(var i=0; i < 4; i++){
        var arcs = [];
        for(var j=0; j < 4; j++)
            arcs.push(10);
        matrix.push(arcs);
    }//for
    return matrix;
}
