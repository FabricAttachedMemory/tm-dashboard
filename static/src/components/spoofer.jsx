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
