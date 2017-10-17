#!/usr/bin/python3
"""
    Provide CPU, FAM, FABRIC (and other?) percent data from LMP API that is
running somewhere on The Machine nodes.
"""
__author__ = "Zakhar Volchak"
__copyright__ = "Copyright 2017 Hewlett Packard Enterprise Development LP"
__maintainer__ = "Zakhar Volchak"
__email__ = "zakhar.volchak@hpe.com"

from collections import namedtuple
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
        self.json_model = {
                'metrics' : {
                    'cpu': -1,
                    'fam': -1,
                    'fabric': -1
                }
        }
        pass


    @property
    def spoofed(self):
        """ Refere to the base class for documentation
        TODO: if spoofing data becomes somewhat important, a more sophisticated
        'algorithm' to generate patterns should be applied.
        """
        self.json_model['metrics']['cpu'] = random.randint(0, 100)
        self.json_model['metrics']['fam'] = random.randint(0, 100)
        self.json_model['metrics']['fabric'] = random.randint(0, 100)
        return self.json_model


    def reset_metrics(self):
        for key, _ in self.json_model:
            self.json_model[key] = -1

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
    global Journal
    mainapp = Journal.mainapp
    response = None
    resp_model = Journal.json_model
    status_code = 200

    url = mainapp.config['LMP_SERVER'] + 'lmp/global/';
    response = Journal.make_request(url)
    resp_json = response.json()

    if response.status_code == HTTP_REQUESTS.codes.ok:
        cpu = resp_json["socs"]["cpu_percent"]
        mem_allocated = resp_json["memory"]["allocated"]
        mem_available = resp_json["memory"]["available"]
        fam = round((float(mem_allocated) / mem_available) * 100, 2)

        fab_result = get_fab()
        fab = fab_result.value

        # since cpu and fam getting real data at this point, fab should show
        # no flow, if it can't get a response from the FAB(zmetrics) server
        if fab_result.response.status_code >= 300:
            fab = -1

        resp_model['metrics'] = {
                                'cpu': cpu,
                                'fabric': fab,
                                'fam': fam
                                }
    #keep json_data in sync with the last response data. That will help with
    #debugging, logging and such
    #Journal.json_model.update(metrics_data)

    if metric_type is None:
        return make_response(jsonify(resp_model), response.status_code)

    # Make a dict obj with {'value': 99} for the metrics type (cpu, fam, fab)
    if(resp_model['metrics'].get(metric_type, None) is None):
        #Keep 'value' key alive, so that front end wont freak out
        error_dict = { 'value' : -1,
                        'error' : 'no such key [%s]' % metric_type }
        return make_response(jsonify(error_dict), 400)

    return make_response(jsonify({'value' : resp_model['metrics'][metric_type]}),
                                    200)

def get_fab():
    global Journal
    mainapp = Journal.mainapp
    request = None
    result = namedtuple('FabResponse', 'value response')

    url = mainapp.config['LMP_SERVER'] + 'fab/'
    response = Journal.make_request(url)

    fab_val = -1
    resp_json = response.json()

    if response.status_code < 300:
        try:
            fab_val = resp_json['fabric']['percentage']
        except KeyError as err:
            Journal.json_model['error'] = err
    else:
        fab_val = resp_json['metrics']['fabric']

    fab_val = round(fab_val, 2)
    result.value = fab_val
    result.response = response
    return result
