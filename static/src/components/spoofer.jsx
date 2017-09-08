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


//Return an array of Nodes in the Enclosure, where array Index represents
//enclosure number, and the value of the index is the Nodes number in that
//enclosure.
export function hardwareLayout(){
    return [7, 7, 7];
}//hardwareLayout

