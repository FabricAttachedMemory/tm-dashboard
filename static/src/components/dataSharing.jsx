/* This function sets responsible for spoofing the date for all of the "moving"
pieces of the ED: percent circles, grids, arcs and etc.. Most of this data is
predefined by human, since randomization does not always look good here.*/
'use strict';
import React from 'react';
import {render} from 'react-dom';


export function Get(varName){
    var field = sharedField(varName);
    if(field == null)
        return "";
    return field.value;
}//Get


export function Set(varName, value){
    var field = sharedField(varName);
    if(field == null)
        field = makeSharedField(varName);
    field.value = value;
}//Set


function makeSharedField(varName){
    var input = document.createElement("input");
    input.id = varName;
    input.value = "";
    input.style.display = 'none';
    document.body.appendChild(input);
    return input;
}


function sharedField(varName){
    var element = document.getElementById(varName);
    return element;
}//isFieldExists
