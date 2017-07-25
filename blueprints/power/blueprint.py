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
            'power': -1
        }


    @property
    def spoofed(self):
        """ Refere to the base class for documentation
        TODO: if spoofing data becomes somewhat important, a more sophisticated
        'algorithm' to generate patterns should be applied.
        """
        if self.allow_random:
            self.stats['power'] = random.randint(0, 100)
        return self.stats


Journal = JPower(__file__)


""" ----------------- ROUTES ----------------- """

@Journal.BP.before_request
def validate_request(*args, **kwargs):
    global Journal
    return Journal.validate_request(request)


@Journal.BP.route('/api/power', methods=['GET'])
def index_api():
    """
        Return all relevant (for Executive Dashboard) metrics data: cpu, fam, fabric.
    When RestAPI server providing metrics data is not running, user can set flags
    in this server config to return random data instead.
    """
    global Journal
    mainapp = Journal.mainapp

    http = HTTP_REQUESTS.get(mainapp.config['LMP_SERVER'] + 'metrics/',
                                     headers=mainapp.config['HTTP_HEADERS'])

    if http.status_code == 404:
        return make_response(jsonify(Journal.spoofed), 206)

    return make_response(jsonify(http.json()), 200)
