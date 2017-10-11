#!/usr/bin/python3
"""
    TODO: docs here
"""
__author__ = "Zakhar Volchak"
__author__ = "Betty Dall"
__copyright__ = "Copyright 2017 Hewlett Packard Enterprise Development LP"
__maintainer__ = "Zakhar Volchak"
__email__ = "zakhar.volchak@hpe.com"
__email__ = "betty.dall@hpe.com"

import os
import requests as HTTP_REQUESTS
import random
from flask import Blueprint, jsonify, render_template, make_response, url_for, request
from pdb import set_trace
from pprint import pprint

from tm_dashboard.blueprints.bp_base import Journal


class JNodes(Journal):

    def __init__(self, name, **args):
        super().__init__(name, **args)
        self.topology = {
            "size" : -1,
            "nodes" : {},
            "flow_matrix" : []
        }
        # headers = {
        #     "Accept": "application/json; Content-Type: application/json; charset=utf-8; version=1.0",
        # }
        # url = 'http://localhost:31179/lmp/nodes/'
        # r = HTTP_REQUESTS.get(url, headers=headers)
        # data=r.json()
        # nodes_list = data['nodes']


        # self.node_dict has {coordinate, node_id} for converting coordinate path
        # from the active shelf data to the node number.
        # self.node_dict = {}
        # for n in nodes_list:
        #     for keys, values in n.items():
        #         self.node_dict[n['coordinate'] + '/SocBoard/1/Soc/1'] = n['node_id']

        # num_nodes is used to return a NxN matrix with the connection data
        # It is zero based matrix meaning node N is indexed with N-1.
        # self.num_nodes = max(self.node_dict.values())

        # Create a list of all LZA addresses per node.
        # This is used to associate the LZAs of an active shelf with the
        # nodes that contribute the LZAs of the active shelf.
        # url = 'http://localhost:31179/lmp/books/'
        # self.book_dict = {}
        # for n in self.node_dict.values():
        #         # ASSUMPTION: interleave group number is node number-1
        #         iurl = url + str(n - 1)
        #         r = HTTP_REQUESTS.get(iurl, headers=headers)
        #         data=r.json()
        #         books_list = data['books']
        #         for b in books_list:
        #                 for keys, values in b.items():
        #                         self.book_dict[b['lza']] = n


    @property
    def spoofed(self):
        """ Refer to the base class (../bp_base.py) for documentation."""
        nodes = { 'somePath_1/SocBoard/1/Soc/1' : 'node_id_1',
                'somePath_2/SocBoard/1/Soc/1' : 'node_id_2',
                'somePath_3/SocBoard/1/Soc/1' : 'node_id_3'
        }
        return { 'nodes' : nodes,
                 "flow_matrix" : self.spoof_flow_matrix(10)
                }


    def spoof_flow_matrix(self, size):
        matrix = []
        for i in range(size):
            row = []
            for j in range(size):
                row.append(1)
            row[i] = 0
            matrix.append(row)
        return matrix


Journal = JNodes(__file__)


""" ----------------- ROUTES ----------------- """

@Journal.BP.before_request
def validate_request(*args, **kwargs):
    global Journal
    return Journal.validate_request(request)


@Journal.BP.route('/api/topology', methods=['GET'])
def get_machine_topology():
    global Journal

    mainapp = Journal.mainapp
    request = None
    response = Journal.topology #dict data to be returned

    request = HTTP_REQUESTS.get(mainapp.config['LMP_SERVER'] + 'lmp/nodes/',
                                headers=mainapp.config['HTTP_HEADERS'])

    if request.status_code != HTTP_REQUESTS.codes.ok:
        if mainapp.config['ALLOW_SPOOF']:
            return make_response(jsonify(Journal.spoofed), 206)
        return make_response(jsonify(response), 500)

    data = request.json()
    nodes_list = data['nodes']

    # nodes_list has {coordinate, node_id} for converting coordinate path
    # from the active shelf data to the node number.
    node_dict = {}
    for node in nodes_list:
        for keys, values in node.items():
            node_full_name = node['coordinate'] + '/SocBoard/1/Soc/1'
            node_dict[node_full_name] = node['node_id']

    # num_nodes is used to return a NxN matrix with the connection data
    # It is zero based matrix meaning node N is indexed with N-1.
    self.num_nodes = max(node_dict.values())

    Journal.topology['nodes'] = node_dict
    return make_response(jsonify(Journal.topology['nodes']), 200)


@Journal.BP.route('/api/nodes', methods=['GET'])
def nodes_api():
    """ Make an API request to the LMP(?) server to get all Nodes relevant
    data: books, shelves, data flow between nodes and etc.
    """
    global Journal
    mainapp = Journal.mainapp
    response = Journal.topology
    request = None

    # To get the arcs matrix, loop through all shelves and look for
    # active ones. The arcs matrix is base 0. The rows represent the
    # source node and the columns represent the nodes accessed for
    # memory by the souce node.

    # arcs = [[0]*(Journal.num_nodes) for i in range(Journal.num_nodes)]

    # get the list of all shelves
    request = HTTP_REQUESTS.get(mainapp.config['LMP_SERVER'] + "/lmp/shelf/",
                                headers=mainapp.config['HTTP_HEADERS'])

    if request.status_code != HTTP_REQUESTS.codes.ok:
        if mainapp.config['ALLOW_SPOOF']:
            return make_response(jsonify(Journal.spoofed), 206)
        return make_response(jsonify(response), 500)

    data = request.json()
    shelf_list = data['entries']
    for s in shelf_list:
        # for each shelf, determine if it is active and what books it uses
        r = HTTP_REQUESTS.get(url + s['name'], headers=mainapp.config['HTTP_HEADERS'])
        shelf_data = r.json()

        # If it is active then add to the arc matrix
        if len(shelf_data['active']) > 0:
            for book in shelf_data['books']:
                uses_memory_from_node = Journal.book_dict[book] - 1
                for coord in shelf_data['active']:
                        source_node = Journal.node_dict[coord] - 1
                        arcs[int(source_node)][int(uses_memory_from_node)] = 1

    return make_response(jsonify({'results': arcs}), 200)
