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


@Journal.BP.route('/api/metrics/<metric_type>', methods=['GET'])
@Journal.BP.route('/api/metrics', methods=['GET'])
def metrics_all(metric_type=None):
    """
        Return all relevant (for Executive Dashboard) metrics data: cpu, fam, fabric.
    When RestAPI server providing metrics data is not running, user can set flags
    in this server config to return random data instead.
    """
    mainapp = Journal.mainapp
    response = None
    r = None
    fabr = None
    try:
        fabr = HTTP_REQUESTS.get(mainapp.config['ZMETRICS_SERVER'],
                                     headers=mainapp.config['HTTP_HEADERS'])
    except HTTP_REQUESTS.exceptions.RequestException as e:
#        print(fabr.status_code)
        print(e)
        fab = 0.0
        print('zmetrics.py is not responding.')

#    if fabr.status_code != HTTP_REQUESTS.codes.ok:
#        fab = 0.0
    else:
        fab_data = fabr.json()
        fab = round(fab_data["fabric"]["percentage"], 2)

    r = HTTP_REQUESTS.get(mainapp.config['LMP_SERVER'] + 'global/',
                                     headers=mainapp.config['HTTP_HEADERS'])
    if r.status_code >= 300:
        if Journal.mainapp.config['ALLOW_SPOOF']:
            response = make_response(jsonify(Journal.spoofed), 206)
        else:
            Journal.reset_metrics()
            response = make_response(jsonify(Journal.metrics), r.status_code)
    else:
        data = r.json()
        cpu = data["socs"]["cpu_percent"]
        fam = round((float(data["memory"]["allocated"]) / data["memory"]["available"]) * 100, 2)
        metrics = {
            "cpu": cpu,
            "fabric": fab,
            "fam": fam
        }

        response = make_response(jsonify(metrics), r.status_code)

    if(metric_type is None):
        return response
    return makeSingleValue(response, metric_type)


def makeSingleValue(response, key):
    """ Extract cpu, fabric or fab values from the response json string, which
    is build by "metrics_all" function. This will make a single key-value pair
    of the form { value : -1 }.
        @param key: metrics type to extract - cpu, fabric, fab.
    """
    response_dict = json.loads(response.response[0])
    if(response_dict.get(key, None) is None):
        return make_response(jsonify('No such key "%s"!' % key), 400)
    return make_response(jsonify({'value' : response_dict[key]}), 200)
