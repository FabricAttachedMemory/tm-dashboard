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
from pprint import pprint
import time
import threading
import json
from shlex import quote

from pdb import set_trace

from tm_dashboard.blueprints.bp_base import Journal


class JPower(Journal):

    def __init__(self, name, **args):
        super().__init__(name, **args)
        self.json_model = {
            'books' : {
                'book_size' : 0,
                'books' : [], #list of { "lza" : 12345, "state" : "available" }
            },
            'memory' : {
                'allocated' : 0,
                'available' : 6597069766656,
                'notready' : 0,
                'offline' : 0,
                'total' : 6597069766656,
            },

            'active' : {
                'books' : 0,
                'shelves' : 0
            }
        } #json_model


    @property
    def book_size(self):
        return len(self.json_model['books']['books'])

    @property
    def books(self):
        return self.json_model['books']['books']


    @property
    def spoofed(self):
        """ Refer to the base class (../bp_base.py) for documentation."""
        is_books = request.url.split('/')[-1] == 'books'
        result = self.json_model
        result['books'] = self.spoof_books()
        result['memory'] = self.spoof_memory_alloc()
        result['active'] = self.spoof_active_prop()
        return result


    def spoof_books(self):
        result = self.json_model['books']
        for i in range(20):
            random_lza = random.randrange(1000000, 8000000, random.randrange(1, 5))
            lza = { "lza" : random_lza }
            result['books'].append(lza)
        result['book_size'] = len(result['books'])
        return result


    def spoof_memory_alloc(self):
        result = self.json_model['memory']
        allocated = random.randrange(0, self.book_size)
        notready = random.randrange(0, allocated + 1) #+1 so it is not 0
        offline = random.randrange(0, notready + 1)   #don't care about alloc accuracy

        result['allocated'] = allocated
        result['notready'] = notready
        result['offline'] = offline

        return result


    def spoof_active_prop(self):
        result = self.json_model['active']
        result['books'] = random.randrange(100, 2000)
        result['shelves'] = random.randrange(5, 30)

        return result


Journal = JPower(__file__)


""" ----------------- ROUTES ----------------- """

@Journal.BP.before_request
def validate_request(*args, **kwargs):
    global Journal
    return Journal.validate_request(request)


@Journal.BP.route('/api/books', methods=['GET'])
def get_books_api():
    global Journal
    mainapp = Journal.mainapp
    response = None

    url = mainapp.config['LMP_SERVER'] + 'books/'
    response = Journal.make_request(url)
    resp_model = response.json()

    return make_response(jsonify(resp_model['books']), response.status_code)


@Journal.BP.route('/api/memory', methods=['GET'])
def memory_api():
    """ Gather the memory breakdown info from LMP:
    Total, Allocated, Available, Not Ready, Offline, Active Shelves, Books
    """
    global Journal
    mainapp = Journal.mainapp
    response = None
    resp_model = Journal.json_model

    # memdata is the dictionary of data returned
    memdata = {}

    # Get the LMP global data
    url = mainapp.config['LMP_SERVER'] + 'global/'
    #r = requests.get(url, headers=headers)
    response = Journal.make_request(url)

    #data=r.json()
    resp_model = response.json()

    memory = resp_model['memory']
    memdata['total'] = memory['total']
    memdata['allocated'] = memory['allocated']
    memdata['available'] = memory['available']
    memdata['notready'] = memory['notready']
    memdata['offline'] = memory['offline']

    active=resp_model['active']
    memdata['Active Shelves'] = active['shelves']

    # Calculate number of books from total memory
    if Journal.books == 0:
        # Only calculate number of books once because it doesn't change
        Journal.books = int(memdata['total'] / Journal.book_size)
    memdata['books'] = Journal.books

    return make_response(jsonify({'results': memdata}), response.status_code)
