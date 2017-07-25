#!/usr/bin/python3
"""
    Provide CPU, FAM, FABRIC (and other?) percent data from LMP API that is
running somewhere on The Machine nodes.
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


class JMetrics(Journal):

    def __init__(self, name, **args):
        super().__init__(name, **args)
        self.metrics = {
                'cpu': -1,
                'fam': -1,
                'fabric': -1
        }


    @property
    def spoofed(self):
        """ Refere to the base class for documentation
        TODO: if spoofing data becomes somewhat important, a more sophisticated
        'algorithm' to generate patterns should be applied.
        """
        if self.allow_random:
            self.metrics['cpu'] = random.randint(0, 100)
            self.metrics['fam'] = random.randint(0, 100)
            self.metrics['fabric'] = random.randint(0, 100)
        return self.metrics


Journal = JMetrics(__file__)


""" ----------------- ROUTES ----------------- """

@Journal.BP.before_request
def validate_request(*args, **kwargs):
    return Journal.validate_request(request)


@Journal.BP.route('/metrics', methods=['GET'])
def metrics_html():
    if Journal.requestor_wants_json():
        return metrics_all()
    return render_template('index.html') # Someday it might change. Or not...


@Journal.BP.route('/api/metrics', methods=['GET'])
def metrics_all():
    """
        Return all relevant (for Executive Dashboard) metrics data: cpu, fam, fabric.
    When RestAPI server providing metrics data is not running, user can set flags
    in this server config to return random data instead.
    """
    mainapp = Journal.mainapp

    http = HTTP_REQUESTS.get(mainapp.config['LMP_SERVER'] + 'metrics/',
                                     headers=mainapp.config['HTTP_HEADERS'])

    if http.status_code >= 300 and Journal.mainapp.config['ALLOW_SPOOF']:
        return make_response(jsonify(Journal.spoofed), 206)

    return make_response(jsonify(http.json()), http.status_code)
