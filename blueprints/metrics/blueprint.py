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
import json
from flask import Blueprint, jsonify, render_template, make_response, url_for, request
from pdb import set_trace

from tm_dashboard.blueprints.bp_base import Journal


class JMetrics(Journal):

    def __init__(self, name, **args):
        super().__init__(name, **args)
        self.metrics = {
                'cpu': -1,
                'fam': -1,
                'fabric': -1 }
        pass


    @property
    def spoofed(self):
        """ Refere to the base class for documentation
        TODO: if spoofing data becomes somewhat important, a more sophisticated
        'algorithm' to generate patterns should be applied.
        """
        self.metrics['cpu'] = random.randint(0, 100)
        self.metrics['fam'] = random.randint(0, 100)
        self.metrics['fabric'] = random.randint(0, 100)
        return self.metrics


    def reset_metrics(self):
        self.metrics['cpu'] = -1
        self.metrics['fam'] = -1
        self.metrics['fabric'] = -1


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


@Journal.BP.route('/api/metrics/fab', methods=['GET'])
def get_fab():
    global Journal
    mainapp = Journal.mainapp
    request = None
    fab_data = { 'fabric' : { 'percentage' : -1 }} #json response from request
    response_dict = { 'value' : -1 } #dict data that will be returned

    try:
        request = HTTP_REQUESTS.get(mainapp.config['LMP_SERVER'] + '/fab/',
                                     headers=mainapp.config['HTTP_HEADERS'])
    except HTTP_REQUESTS.exceptions.RequestException as e:
        print('Zmetrics server is not responding! \n Error msg:\n%s' % e)

    if request.status_code != HTTP_REQUESTS.codes.ok:
        if mainapp.config['ALLOW_SPOOF']:
            response_dict['value'] = Journal.spoofed['fabric']
        return make_response(jsonify(response_dict), 500)

    fab_data = request.json()

    if fab_data.get('fabric', None) is None: #to preserve server's state on fail
        response_dict['error'] = 'Key [\'fabric\'] was not found!'
        return make_response(jsonify(response_dict), 500)

    if fab_data['fabric'].get("percentage", None) is None:
        response_dict['error'] = 'Key [\'fabric\'][\'percentage\'] was not found!'
        return make_response(jsonify(response_dict), 500)

    # LMP server returned json data that was handled incorrectly. Quit.
    if response_dict.get('error', None) is None:
        return make_response(jsonify(response_dict), 500)

    #At this point all 'idiot checks' has passed and we can safely extract data
    response_dict['value'] = round(fab_data["fabric"]["percentage"], 2)

    return make_response(jsonify(response_dict), request.status_code)


@Journal.BP.route('/api/metrics/<metric_type>', methods=['GET'])
@Journal.BP.route('/api/metrics', methods=['GET'])
def metrics_all(metric_type=None):
    """
        Return all relevant (for Executive Dashboard) metrics data: cpu, fam, fabric.
    When RestAPI server providing metrics data is not running, user can set flags
    in this server config to return random data instead.
    """
    global Journal
    mainapp = Journal.mainapp
    request = None
    metrics_data = None
    status_code = 200

    request = HTTP_REQUESTS.get(mainapp.config['LMP_SERVER'] + 'global/',
                                     headers=mainapp.config['HTTP_HEADERS'])

    if request.status_code != HTTP_REQUESTS.codes.ok:
        if Journal.mainapp.config['ALLOW_SPOOF']:
            status_code = 200
            Journal.metrics = Journal.spoofed
        else:
            Journal.reset_metrics()
            status_code = request.status_code
    else:
        metrics_data = request.json()

        #TODO: idiot's check on tmetrics_data keys should be here

        cpu = metrics_data["socs"]["cpu_percent"]
        mem_allocated = metrics_data["memory"]["allocated"]
        mem_available = metrics_data["memory"]["available"]
        fam = round((float(mem_allocated) / mem_available) * 100, 2)
        fab = json.loads(get_fab().response[0]).get('value', -1)
        Journal.metrics = {
            "cpu": cpu,
            "fabric": fab,
            "fam": fam,
            'error' : None
        }

    if(metric_type is None):
        return make_response(jsonify(Journal.metrics), status_code)

    # Return a key-value pair { 'value' : -1 } for the metrics type (cpu, fam, fab)
    if(Journal.metrics.get(metric_type, None) is None):
        error_dict = { 'value' : -1, #so that front end wont freak out
                        'error' : 'no such key [' + metric_type + ']' }
        return make_response(jsonify(error_dict), 400)

    return make_response(jsonify({'value' : Journal.metrics[metric_type]}), 200)