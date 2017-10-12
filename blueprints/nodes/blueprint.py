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
from pprint import pprint
from pdb import set_trace

from tm_dashboard.blueprints.bp_base import Journal


class JNodes(Journal):

    def __init__(self, name, **args):
        super().__init__(name, **args)
        self.json_model = {
                        "size" : -1,
                        "nodes" : {},
                        "flow_matrix" : []
                        }
        self.topology = {}
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
        return { "NOT IMPLEMENTED" : "YET" }


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
@Journal.BP.route('/api/topology/<is_force_update>', methods=['GET'])
def get_machine_topology(is_force_update=None):
    global Journal
    response = None

    # save time if topology has been already created, since it doesn't change
    # during server's runtime. However, it is possible to re-update by calling
    # api/topology/force endpoint.
    if Journal.topology and is_force_update is None:
        # spoofed should be regenerated for the hope of getting real data during
        # the API call..
        if Journal.topology.get('spoofed', False) is False:
            return make_response(jsonify(Journal.topology), 206)

    return make_response(jsonify(build_topology()), 200)


@Journal.BP.route('/api/nodes', methods=['GET'])
def nodes_api():
    """ Make an API request to the LMP(?) server to get all Nodes relevant
    data: books, shelves, data flow between nodes and etc.
     To get the arcs matrix, loop through all shelves and look for active ones.
    The arcs matrix is base 0. The rows represent the source node and the columns
    represent the nodes accessed for memory by the souce node.
    """
    global Journal
    mainapp = Journal.mainapp
    response = None

    if not Journal.topology:
        build_topology() # that will build into Journal.topology variable

    num_nodes =  Journal.topology['size']

    arcs = [[0]*(num_nodes) for i in range(num_nodes)]

    # get the list of all shelves
    url = mainapp.config['LMP_SERVER'] + "shelf/"
    response = Journal.make_request(url)

    data = response.json()
    shelf_list = data['entries']
    for s in shelf_list:
        # for each shelf, determine if it is active and what books it uses
        shelf_req_url = url + s['name']
        shelf_resp = Journal.make_request(shelf_req_url)
        shelf_data = shelf_resp.json()

        # If it is active then add to the arc matrix
        if len(shelf_data['active']) > 0:
            for book in shelf_data['books']:
                book_lza = Journal.topology['lza'][book]
                uses_memory_from_node = Journal.book_dict[book] - 1
                for coord in shelf_data['active']:
                        source_node = Journal.node_dict[coord] - 1
                        arcs[int(source_node)][int(uses_memory_from_node)] = 1

    return make_response(jsonify({'results': arcs}), 200)


def build_topology():
    global Journal
    mainapp = Journal.mainapp
    response = None

    result = Journal.topology #json data to be returned

    url = mainapp.config['LMP_SERVER'] + 'nodes/'
    response = Journal.make_request(url)

    resp_json = response.json()
    nodes_list = resp_json['nodes']

    # nodes_list has {coordinate, node_id} for converting coordinate path
    # from the active shelf data to the node number.
    node_dict = {}
    for node in nodes_list:
        for keys, values in node.items():
            node_full_name = node['coordinate'] + '/SocBoard/1/Soc/1'
            node_dict[node_full_name] = node['node_id']

    # num_nodes is used to return a NxN matrix with the connection data
    # It is zero based matrix meaning node N is indexed with N-1.
    result['size'] = max(node_dict.values())

    result['nodes'] = node_dict
    result['lza'] = build_lza_data(node_dict)

    # save result into Journal.topology, so that it can be accessed on the next
    # calls without making API request.
    Journal.topology.update(result)

    return Journal.topology


def build_lza_data(node_dict):
    '''Create a list of all LZA addresses per node. This is used to associate
    the LZAs of an active shelf with the nodes that contribute the LZAs of the
    active shelf.
    '''
    global Journal
    mainapp = Journal.mainapp
    url = mainapp.config['LMP_SERVER'] + 'books/'
    book_dict = {}

    for node_id in node_dict.values():
        # ASSUMPTION: interleave group number is node number-1
        interleave_url = url + str(node_id - 1)
        interleave_resp = Journal.make_request(interleave_url)
        data=interleave_resp.json()

        books_list = data['books']
        for book in books_list:
            for keys, values in book.items():
                lza = book['lza']
                book_dict[lza] = node_id
    return book_dict
