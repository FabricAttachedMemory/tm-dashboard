#!/usr/bin/python3
"""
    Base class to be used\inherited by all the blueprints that lives in this
directory space. The main reason for this "base" is to incapsulate the steps
taken by all the blueprints to regester it with Flask. Also, adds some other
usefull functions that will be used in most blueprints "as-is" or with slight
modifications.
"""
__author__ = "Zakhar Volchak"
__copyright__ = "Copyright 2017 Hewlett Packard Enterprise Development LP"
__maintainer__ = "Zakhar Volchak"
__email__ = "zakhar.volchak@hpe.com"

from collections import namedtuple
import os
import re   #used to extract version=N; from header
import requests
import json
from flask import Blueprint, make_response, jsonify
from pdb import set_trace


class Journal():
    """
        A Journal in this context is a class that contains Flask Blueprints and
    Routes. Couldn't come up with better alternative the the word "blueprint"
    and using the same word as Flask's class Blueprint is "context confusing".
    """

    def __init__(self, name, **args):
        """
            @param name: pass __file__ to assign blueprint's dirname as Journal
                        name, or pass non empty string to set a custom name.
            @args mainapp: a Flask server that is using this jouranl/blueprint.
        """
        self.json_model = {}
        self.mainapp = args['mainapp'] if ('mainapp' in args) else None

        self.name = os.path.dirname(name).split('/')[-1]
        if not self.name:
            self.name = name

        named_tuple_keys = 'json response status_code reason'
        self.last_response = namedtuple('CustomResponse', named_tuple_keys)
        self.last_response.__new__.__defaults__ = (None,) * \
                                                len(self.last_response._fields)

        self.BP = Blueprint(self.name, __name__, static_url_path='/static/')


    def register(self, mainapp, name=None):
        """ Save reference to Flask server in this journel. """
        self.mainapp = mainapp


    def make_request(self, url, custom_headers=None):
        ''' A simple wrapper around requests.get() function to help catch errors
        that are occuring during the request. It will use Headers defined in the
        server.cfg file by default, but can be modded by the caller.
         @param <str> url: endpoint to make a 'get' request to.
         @param <dict> custom_headers: any additional headers to be used for this
                call. Passing existed in the config file keys will override it.
         @return <namedtuple>: object with json, status_code fields taken from
                            <Response> object returned by requests.get() which
                            is also saved into 'resposnse' field.
        '''
        response = None
        error = None
        all_headers={}
        all_headers.update(self.mainapp.config['HTTP_HEADERS'])
        if custom_headers is not None:      #add/update headers passed by caller
            all_headers.update(custom_headers)

        try:
            response = requests.get(url, headers=all_headers) #API call to the URL
            error = None
        except requests.exceptions.RequestException as e:
            #if you get here, result obj is not set. Thus, make it empy Response
            #so that it can be handled properly further down the code.
            response = requests.Response()
            response.status_code = 500
            response.reason = 'Failed to get response from %s' % url
            response._content = b'{}'

        response = self.handle_bad_response(response)
        # build a dictionary object from json string that is made up by flask's
        # Response() class. End caller just needs an accessible dictionary obj.
        '''
        self.last_response.json = json.loads(response.response[0].decode())
        if error is not None:
            self.last_response['reason'] = error #show what happened

        self.last_response.status_code = response.status_code
        self.last_response.response = response
        '''

        return response


    def handle_bad_response(self, response):
        ''' Check status code of the response to parse it with the same pattern
        of actions during each http request. When status code is not in 200s
        range - make_response() object will be created with the self.json_model
        default or spoofed(when enabled in the server.cfg) values.
         @param <Response> response: returned object from request.get() call.
         @return: make_response() object when status is not good. None - otherwise.
        '''
        resp_json = {} # json data that will be returned
        if response.status_code == requests.codes.ok:
            return response

        if self.mainapp.config['ALLOW_SPOOF']:
            response.status_code = 303 #partial content - because spoofed.
            resp_json = self.spoofed
        else:
            response.status_code = response.status_code
            resp_json = self.json_model
        '''
        resp_json['reason'] = '[%s] %s: %s' % (response.url,
                                                response.status_code,
                                                response.reason)
        return make_response(jsonify(resp_json), status_code)
        '''
        response._content = str.encode(json.dumps(resp_json))
        return response


    @property
    def spoofed(self):
        """ Return some data (random?) when the expected API does not respond.
        This is usefull when you need to "recover" and shouw at least some data
        for to present.
        Note: this must be overwritten by the child class.
        """
        raise NotImplemented("You have you overwrite this property!")


    ''' --- Request handles. Validation and Response makers.... --- '''

    def requestor_wants_json(self, headers):
        """ Check if 'application/json' is in the requestor's header. Return
        True if so. Also, catching ANY exception on getting request.headers will
        return True.

            @param headers: dict of headers passed in the requested header.
        """
        try:
            return 'application/json' in headers['Accept']
        except Exception:
            return True


    def validate_request(self, request):
        """ Take all the steps needed to validate the Request from the client."""
        # This function expected to grow a bit. Could be validating more than
        # just the version.
        if request.headers.get('Accept', None) is None:
            return self.make_error_response('No [Accept] header in request header!')

        is_valid_version = self.validate_version(request.headers)
        return is_valid_version


    def validate_version(self, headers):
        """ Validate requestor's version passed in the header matches this API
        serving version. """
        if not self.requestor_wants_json(headers):  # Ignore versioning for HTML
            return None

        hdr_accept = headers.get('Accept', '')
        version = re.search('version=(.+?)', hdr_accept)

        if version is None:
            return self.make_error_response('No version sent')

        version = float(version.group(1)) # group(0) returns 'version=1.0'. group(1) is just '1.0'
        expected = self.mainapp.config['API_VERSION']
        if version != expected:
            return self.make_error_response('Bad version: %s != %s' % (version, expected))

        return None #Success


    def after_request(self, response):
        response.headers['Content-Type'] += ';charset=utf-8'
        response.headers['Content-Type'] += ';version=%s' % self.mainapp.config['API_VERSION']
        return response


    def make_error_response(self, error_msg, code=418):
        return make_response(jsonify({ 'error' : error_msg}), code)
