#!/usr/bin/python3
"""
    Route for the Memory Management tab's memory breakdown info

    Example:
    $ curl -v -H "Acept:application/json;version=1.0;" -H "Accept-encoding:gzip" http://localhost:9099/api/memory
    {
      "results": {
        "Total": 21990232555520,
        "Allocated": 1692217114624,
        "Avaliable": 20298015440896,
        "Not Ready": 0,
        "Offline": 0,
        "Active Shelves": 3,
        "Books": 1,
      }
"""
__author__ = "Betty Dall"
__copyright__ = "Copyright 2017 Hewlett Packard Enterprise Development LP"
__maintainer__ = "Betty Dall"
__email__ = "betty.dall@hpe.com"

import os
import requests
import random
from flask import Blueprint, jsonify, render_template, make_response, url_for, request
from pdb import set_trace
from pprint import pprint
import time
import threading
import json
from shlex import quote


from tm_dashboard.blueprints.bp_base import Journal


class JPower(Journal):

    def __init__(self, name, **args):
        super().__init__(name, **args)

        headers = {
            "Accept": "application/json; Content-Type: application/json; charset=utf-8; version=1.0",
        }

        url = 'http://localhost:31179/lmp/books/'
        r = requests.get(url, headers=headers)
        data=r.json()
        self.book_size = data['book_size']
        print("book_size", self.book_size)
        self.books = 0

    @property
    def spoofed(self):
        """ Refer to the base class (../bp_base.py) for documentation."""
        return "not implemented"


Journal = JPower(__file__)


""" ----------------- ROUTES ----------------- """

@Journal.BP.before_request
def validate_request(*args, **kwargs):
    global Journal
    return Journal.validate_request(request)


@Journal.BP.route('/api/memory', methods=['GET'])
def memory_api():
    """ Gather the memory breakdown info from LMP:
    Total, Allocated, Available, Not Ready, Offline, Active Shelves, Books
    """
    global Journal
    mainapp = Journal.mainapp

    headers = {
        "Accept": "application/json; Content-Type: application/json; charset=utf-8; version=1.0",
    }

    # memdata is the dictionary of data returned
    memdata = {}

    # Get the LMP global data
    url = 'http://localhost:31179/lmp/global/'
    r = requests.get(url, headers=headers)
    data=r.json()
    memory = data['memory']
    memdata['Total'] = memory['total']
    memdata['Allocated'] = memory['allocated']
    memdata['Available'] = memory['available']
    memdata['Not Ready'] = memory['notready']
    memdata['Offline'] = memory['offline']

    active=data['active']
    memdata['Active Shelves'] = active['shelves']

    # Calculate number of books from total memory
    if Journal.books == 0:
        # Only calculate number of books once because it doesn't change
        Journal.books = int(memdata['Total'] / Journal.book_size)
    memdata['Books'] = Journal.books
    return make_response(jsonify({'results': memdata}), 200)
