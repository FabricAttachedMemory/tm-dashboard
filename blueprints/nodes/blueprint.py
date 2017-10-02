#!/usr/bin/python3
"""
    TODO: docs here
"""
__author__ = "Zakhar Volchak"
__copyright__ = "Copyright 2017 Hewlett Packard Enterprise Development LP"
__maintainer__ = "Zakhar Volchak"
__email__ = "zakhar.volchak@hpe.com"

import os
import requests as HTTP_REQUESTS
import random
from flask import Blueprint, jsonify, render_template, make_response, url_for, request


from tm_dashboard.blueprints.bp_base import Journal


class JPower(Journal):

    def __init__(self, name, **args):
        super().__init__(name, **args)
        self.stats = {
            'TODO': 'Not yet implemented'
        }


    @property
    def spoofed(self):
        """ Refere to the base class (../bp_base.py) for documentation."""
        self.stats['TODO'] = "Spoofer Not Implemented Yet"
        return self.stats


Journal = JPower(__file__)


""" ----------------- ROUTES ----------------- """

@Journal.BP.before_request
def validate_request(*args, **kwargs):
    global Journal
    return Journal.validate_request(request)


@Journal.BP.route('/api/nodes', methods=['GET'])
def nodes_api():
    """ Make an API request to the LMP(?) server to get all Nodes relevant
    data: books, shelves, data flow between nodes and etc.
    """
    global Journal
    mainapp = Journal.mainapp

    http = HTTP_REQUESTS.get(mainapp.config['LMP_SERVER'] + 'unknwon/',
                                     headers=mainapp.config['HTTP_HEADERS'])

    if http.status_code == 404:
        return make_response(jsonify(Journal.spoofed), 206)

    return make_response(jsonify(http.json()), 200)
