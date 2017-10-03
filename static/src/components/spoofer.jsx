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
    return [2,9,6,10,17,25,26,24,24,23,33,30,30,32,26,23,15,10,5,5];
}

export function famData(){
    return [12,19,23,36,35,42,55,59,63,66,68,60,58,54,45,43,33,21,12,8];
}

export function fabData(){
    return [5,8,18,23,38,36,32,39,43,49,51,49,44,42,36,31,28,19,14,4];
}


export function nodeStatsData(){
    var data = {
        power : "on",
        dram :  [4.88, 4.84, 4.52, 5.3, 4.9, 4.72],
        cpu :   [0.8, 0.8, 0.7, 1.2, 1.0, 0.7],
        netIn : [3041.5, 3125.4, 3612.7, 3561.2, 3125.8],
        netOut : [7329.5, 7329.9, 7597.1, 7672.6, 7498.2],
        fabric : [0, 2, 2, 4, 5, 2, 7, 5, 2],
        shelves : [1, 1, 2, 1, 3, 5, 3, 4, 2],
        books :   [128, 128, 256, 256],
        manifestName : "Lsgi_spoofed",
    }
    return data;
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
        matrix.push(nodes_flow);
    }//for i
    return matrix;
}//ChordMatrix


export function SystemTopology(){
    return [10, 10, 10];
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
