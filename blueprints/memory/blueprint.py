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

import copy
from flask import Blueprint, jsonify, render_template, make_response, url_for, request
from pprint import pprint
from shlex import quote
import json
import os
import random
import requests
import threading
import time
import math

from pdb import set_trace

from tm_dashboard.blueprints.bp_base import Journal


class JPower(Journal):

    def __init__(self, name, **args):
        super().__init__(name, **args)
        #json_model should match response from the real endpoint data. E.g.
        #'memory' and 'active' corresponds to lmp's global/ endpoint response.
        self.json_model = {
            'book_size' : -1, #size of One book
            'books' : [], #list of { "lza" : 12345, "state" : "available" }
            'books_amount' : -1, #how many books are there (squares for flatgrids)
            'memory' : {
                'allocated' : -1,
                'available' : -1,
                'notready' : -1,
                'offline' : -1,
                'total' : -1,
            },

            'active' : {
                'books' : -1,
                'shelves' : -1
            },
            'error' : []
        } #json_model

    @property
    def book_size(self):
        ''' Size of One book.'''
        return self.json_model['book_size']

    @property
    def books(self):
        ''' All books LZA. '''
        return self.json_model['books']

    @property
    def total(self):
        return self.books_amount * self.book_size

    @book_size.setter
    def book_size(self, value):
        self.json_model['book_size'] = value

    @books.setter
    def books(self, value):
        self.json_model['books'] = value

    @total.setter
    def total(self, value):
        self.json_model['memory']['value'] = value


    @property
    def books_amount(self):
        ''' How many books (square for flatgrid) are available on the system '''
        return len(self.books)

    @property
    def books_ratio(self):
        return self.json_model['active']['books']

    @books_ratio.setter
    def books_ratio(self, value):
        self.json_model['active']['books'] = value

    @property
    def error(self):
        if 'error' not in self.json_model:
            self.json_model['error'] = []
        return self.json_model['error']

    @error.setter
    def error(self, value):
        self.error.append(value)


    @property
    def spoofed(self):
        """ Refer to the base class (../bp_base.py) for documentation."""
        result = self.json_model # REFERENCE not a copy!
        result.update(self.spoof_books(result))
        total = result['book_size'] * result['books_amount']
        result['memory'].update(self.spoof_memory_alloc(total))
        result['active'].update(self.spoof_active_prop())

        return result


    def spoof_books(self, data):
        data['books'] = []
        for i in range(18944):
            random_lza = random.randrange(1000000, 8000000, random.randrange(1, 5))
            lza = { "lza" : random_lza }
            data['books'].append(lza)
        data['book_size'] = 8589934592
        data['books_amount'] = len(data['books'])
        data['total'] = data['books_amount'] * data['book_size']
        return data

    '''
    {
      "active_books": 18944,
        "active_shelves": 1088,
          "allocated": 335007449088,
            "available": 161568079740928,
              "notready": 824633720832,
                "offline": 0,
                  "total": 162727720910848
                  }
    '''
    def spoof_memory_alloc(self, total_size):
        result = {}
        allocated = random.randrange(int(total_size * 0.1), int(total_size * 0.2))

        books_left = total_size - allocated
        if books_left < 0 or books_left == 0:   # dont allow randrange to be (0, 0)
            notready = 0
        else:
            notready = random.randrange(0, int(books_left * 0.1))

        books_left -= notready
        if books_left < 0 or books_left == 0:
            offline = 0
        else:
            offline = random.randrange(0, int(books_left * 0.2))

        result['allocated'] = allocated
        result['notready'] = notready
        result['offline'] = offline
        subtotal = allocated + notready + offline
        result['available'] = total_size - (allocated + notready + offline)
        result['total'] = total_size

        return result


    def spoof_active_prop(self):
        result = self.json_model['active']
        result['books'] = 18944
        result['shelves'] = random.randrange(500, 1088)

        return result


Journal = JPower(__file__)


""" ----------------- ROUTES ----------------- """

@Journal.BP.before_request
def validate_request(*args, **kwargs):
    global Journal
    return Journal.validate_request(request)


@Journal.BP.route('/api/memory/lza/<total_memory>', methods=['GET'])
@Journal.BP.route('/api/memory/lza', methods=['GET'])
def get_books(total_memory=None):
    '''
        It is enough to call this function once per running server, since books/
    data doesn't change. Thus, '/api/memory' endpoint will make a call to this
    function once, and than will use buffered data in the Journal.json_model to
    save time later on.
     This till return a list of dict pair ({lza : "value"}) to allow further
    calculation of the Flatgrids data.
    '''
    global Journal
    mainapp = Journal.mainapp
    response = None

    url = mainapp.config['LMP_SERVER'] + 'books/'
    response = Journal.make_request(url)

    resp_model = response.json()

    result = {}
    result['books'] = resp_model['books']
    result['book_size'] = resp_model['book_size']

    if total_memory is not None:
        try:
            Journal.books_ratio = int(int(total_memory) / result['book_size'])
        except (TypeError, ZeroDivisionError) as err:
            error_msg = 'Failed to set books_ratio! [%s]' % err
            result['error'] = error_msg
            Journal.error = error_msg
            Journal.books_ratio = 0

    Journal.book_size = result['book_size']
    Journal.books = result['books']

    return make_response(jsonify(result), response.status_code)


@Journal.BP.route('/api/memory', methods=['GET'])
@Journal.BP.route('/api/memory/<opt>', methods=['GET'])
def memory_api(opt=None):
    """ Gather the memory breakdown info from LMP:
    Total, Allocated, Available, Not Ready, Offline, Active Shelves, Books

    @param opt: option(keys of requested data) to return active Books or Shelves.
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

    '''
    memdata['total'] = resp_model['memory']['total']
    memdata['allocated'] = resp_model['memory']['allocated']
    memdata['available'] = resp_model['memory']['available']
    memdata['notready'] = resp_model['memory']['notready']
    memdata['offline'] = resp_model['memory']['offline']
    memdata['active_shelves'] = resp_model['active']['shelves']
    '''
    memdata['total'] = resp_model['memory']['total']

    memdata['allocated'] = int(resp_model['memory']['allocated'] / Journal.book_size)
    memdata['available'] = int(resp_model['memory']['available'] / Journal.book_size)
    memdata['notready'] = int(resp_model['memory']['notready'] / Journal.book_size)
    memdata['offline'] = int(resp_model['memory']['offline'] / Journal.book_size)
    memdata['active_shelves'] = resp_model['active']['shelves']

    # Calculate number of books from total memory
    # Only calculate number of books once because it doesn't change
    if Journal.books_ratio == 0:
        get_books(memdata['total'])

    memdata['active_books'] = Journal.books_ratio
    active_data = { 'books' : memdata['active_books'],
                    'shelves' : memdata['active_shelves'] }

    Journal.json_model['memory'].update(memdata)
    Journal.json_model['active'].update(active_data)
    Journal.json_model['books_amount'] = Journal.books_amount
    Journal.json_model['book_size'] = Journal.book_size

    memdata['book_size'] = Journal.book_size

    #Return all memdata
    if opt is None:
        return make_response(jsonify(memdata), response.status_code)

    #Return active Books or Shelves
    if opt in Journal.json_model:
        value = Journal.json_model[opt]
        return make_response(jsonify({ 'value' : value}), response.status_code)
    elif opt in Journal.json_model['memory']:
        value = Journal.json_model['memory'][opt]
        return make_response(jsonify({ 'value' : value}), response.status_code)
    else:
        options = list(Journal.json_model.keys())
        options.append(list(Journal.json_model['memory'].keys()))
        err = 'Unknown option [%s]! Options: %s' % (opt, options)
        memdata['error'] = err
        return make_response(jsonify(memdata), 206)
