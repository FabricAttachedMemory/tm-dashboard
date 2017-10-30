#!/usr/bin/python3
"""
    Blueprint to provide information about the api, options and etc.
"""
__author__ = "Zakhar Volchak"
__copyright__ = "Copyright 2017 Hewlett Packard Enterprise Development LP"
__maintainer__ = "Zakhar Volchak"
__email__ = "zakhar.volchak@hpe.com"

import os
from flask import Blueprint, jsonify, render_template, make_response, request, url_for
from pdb import set_trace

from tm_dashboard.blueprints import bp_base

Journal = self = bp_base.Journal(__file__)


""" ----------------- ROUTES ----------------- """

@Journal.BP.before_request
def validate_request(*args, **kwargs):
    return Journal.validate_request(request)


@Journal.BP.after_request
def salt_the_response(response):
    return Journal.after_request(response)


@Journal.BP.before_request
def validate_request(*args, **kwargs):
    return Journal.validate_version(request.headers)


@Journal.BP.route('/', methods=['GET'])
@Journal.BP.route('/index', methods=['GET'])
def index():
    if Journal.requestor_wants_json(request.headers):
        return index_api() # still getting json, even though thinking to get html
    return render_template('index.html')


@Journal.BP.route('/api/', methods=['GET'])
@Journal.BP.route('/api/help', methods=['GET'])
def index_api():
    """ Return list of all the routes served by this server. """
    mainapp = Journal.mainapp
    all_routes = []
    for route in mainapp.app.url_map.iter_rules():
        try:
            if route.endpoint != 'static':
                if url_for(route.endpoint) not in all_routes:
                    all_routes.append(url_for(route.endpoint))
        except Exception as err:
            print(err)
            continue

    return make_response(jsonify({'routes' : sorted(all_routes)}), 200)


@Journal.BP.route('/api/toggle_spoof', methods=['GET'])
def toggle_spoof():
    mainapp = Journal.mainapp

    mainapp.config['ALLOW_SPOOF'] = not mainapp.config['ALLOW_SPOOF']
    isSpoof = mainapp.config['ALLOW_SPOOF']
    return make_response(jsonify('Spoofer set to %s' % isSpoof), 200)
