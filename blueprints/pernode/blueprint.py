#!/usr/bin/python3
"""
    Route for the Overview tab's per node data

    Example:
    $ curl -v -H "Acept:application/json;version=1.0;" -H "Accept-encoding:gzip" http://localhost:9099/api/pernode/0
    * Hostname was NOT found in DNS cache
    *   Trying ::1...
    * connect to ::1 port 9099 failed: Connection refused
    *   Trying 127.0.0.1...
    * Connected to localhost (127.0.0.1) port 9099 (#0)
    > GET /api/pernode/1 HTTP/1.1
    > User-Agent: curl/7.38.0
    > Host: localhost:9099
    > Accept:application/json;version=1.0;
    > Accept-encoding:gzip
    > 
    * HTTP 1.0, assume close after body
    < HTTP/1.0 200 OK
    < Content-Type: application/json
    < Content-Length: 267
    < Server: Werkzeug/0.9.6 Python/3.4.2
    < Date: Mon, 23 Oct 2017 19:59:53 GMT
    < 
    {
      "results": {
        "CPU Usage": 53.64,
        "DRAM Usage": 1.01,
        "Fabric Usage": 0.6,
        "Network In": 1101633.4,
        "Network Out": 2130226.6,
        "No. of Books": 3,
        "No. of Shelves": 1,
        "Node": 1,
        "OS Manifest": "l4tm_base_nophrase",
        "Power State": "On"
      }
    * Closing connection 0
"""
__author__ = "Betty Dall"
__copyright__ = "Copyright 2017 Hewlett Packard Enterprise Development LP"
__maintainer__ = "Betty Dall"
__email__ = "betty.dall@hpe.com"

import copy
import os
import requests
import random
from flask import Blueprint, jsonify, render_template, make_response, url_for, request
from pdb import set_trace
from pprint import pprint
import time
import threading
import json
import subprocess
import shlex
import sys
from shlex import quote


from tm_dashboard.blueprints.bp_base import Journal
from tm_dashboard.blueprints.pernode import utils


class JPower(Journal):

    def __init__(self, name, **args):
        super().__init__(name, **args)
        self.defaults = {
            'Node' : 'n/a',
            'Power State' : 'n/a',
            'DRAM Usage' : 'n/a',
            'CPU Usage' : 'n/a',
            'Network In' : 'n/a',
            'Network Out' : 'n/a',
            'Fabric Usage' : 'n/a',
            'No. of Books' : 'n/a',
            'No. of Shelves' : 'n/a',
            'OS Manifest' : 'n/a'
        }

        self.hasDoneThings = False
        self.nodes_list = {}
        self.nodeinfo = {}
        self.num_nodes = 0


    def __str__(self):
        return 'Size: {0};\n'\
                'Available Nodes: {1}'\
                .format(self.num_nodes, self.available_nodes)

    @property
    def available_nodes(self):
        result = []
        for node_index in range(len(self.nodeinfo)):
            if self.nodeinfo[node_index]:
                result.append(node_index)
        return result


    def doThings(self):
 #       if self.hasDoneThings is True:
            #return
        self.hasDoneThings = True
        response = None

        url = self.mainapp.config['LMP_SERVER'] + 'nodes/'
        response = requests.get(url, headers=self.mainapp.config['HTTP_HEADERS'])
        data=response.json()
        nodes_list = data['nodes']
        self.nodes_list = nodes_list

        # num_nodes is used to size/index into the nodeinfo array of dicts
        self.num_nodes = len(nodes_list)

        # Initialize nodeifo list of dictionaries for each node's global data:
        #    { active_coordinate: used with LMP to get books and shelves
        #      allocated_coordinate: removes /SocBoard/SoC for FAM usage
        #      nmp_url: used to get the PowerState from MFW on the node MP
        #      hostname: used to do the ssh call
        #    }
        self.nodeinfo = [dict() for x in range(40)]

        # from the active shelf data to the node number.
        self.node_dict = {}
        for node_item in nodes_list:
            node = node_item['node_id'] - 1
            soc = node_item['soc']
            coord = soc['coordinate']
            self.nodeinfo[node]['active_coordinate'] = coord
            self.nodeinfo[node]['allocated_coordinate'] = coord[:-16]

        # Use data from /etc/tmconfig to get hostname and mfwApiUri
        self.nodeinfo = utils.hostnameFromTmconfig('/etc/tmconfig', self.nodeinfo)

    @property
    def spoofed(self):
        """ Refer to the base class (../bp_base.py) for documentation."""
        return "not implemented"


    def spoofStats(self, node):
        result = self.defaults
        result['CPU Usage'] = '%s%%' % random.randint(0,100)
        result['DRAM Usage'] = '%s%%' % random.randint(0,100)
        result['Fabric Usage'] = '%s%%' % random.randint(0,100)
        result['Network In'] = '%s b/sec' % random.randint(500,2100)
        result['Network Out'] = '%s b/sec' % random.randint(500,2100)
        result['No. of Books'] = random.randint(100,3100)
        result['No. of Shelves'] = random.randint(0,100)
        result['OS Manifest'] = "spoofed_manifest"
        result['Node'] = node
        result['Power State'] = 'On'
        return result


    def get_curtime(self):
        r = subprocess.Popen(['date', '+%s'], shell=False,
                                stdout=subprocess.PIPE,
                                    stderr=subprocess.PIPE)
        curtime_list=r.stdout.readlines()
        if curtime_list == []:
            error = r.stderr.readlines()
            print("Error: ", error, file=sys.stderr)
            return "0"
        else:
            curtime=curtime_list[0].decode("utf-8")
        return curtime


    def get_power_state(self, node):
        # Get the powerstate of the node from the MFW service
        d_proxy = { "http" : None }
        try:
            header = self.mainapp.config['HTTP_HEADERS']
            url = self.nodeinfo[node-1]['mfwApiUri'] + '/MgmtService/SoC'
            r = requests.get(url, headers=header, proxies=d_proxy)
            if r.status_code != requests.codes.ok:
                return 'N/A'
            data=r.json()
            power = data['PowerState']
        except Exception as err: #FIXME
            print('Failed to get power state for node %s! [%s]' % (node, err))
            power = 'n/a'

        return power


    def get_os_manifest(self, node):
        # Get the os manifest for the node from the manifesting service
        url = self.mainapp.config['MANIFESTING_SERVER'] + 'api/node/' + str(node)
        r = requests.get(url, headers=self.mainapp.config['HTTP_HEADERS'])
        if r.status_code != requests.codes.ok:
            return "default"
        data=r.json()
        manifest=data['manifest']
        return manifest


    def get_books_and_shelves(self, node):
        # Get the active books and shelves from LMP active data
        active = { 'shelves' : 'n/a', 'books' : 'n/a' }
        try:
            coord = self.nodeinfo[node-1]['active_coordinate']
            url = self.mainapp.config['LMP_SERVER'] + 'active' + coord
            r = requests.get(url, headers=self.mainapp.config['HTTP_HEADERS'])
            if r.status_code != requests.codes.ok:
                return [0, 0]
            data=r.json()
            active = data['active']
        except Exception as err:
            print('Failed to get books and shelves for node %s! [%s]' % (node, err))
            active['shelves'] = 'n/a'
            active['books'] = 'n/a'

        return active


    def get_fabric_usage(self, node):
        # Calculate the fabric usage from the LMP allocated data
        try:
            coord = self.nodeinfo[node-1]['allocated_coordinate']
            url = self.mainapp.config['LMP_SERVER'] + 'allocated' + coord
            r = requests.get(url, headers=self.mainapp.config['HTTP_HEADERS'])
            if r.status_code != requests.codes.ok:
                return 0
            data=r.json()
            mem = data['memory']
            if mem['total'] == 0:
                fam = 0
            else:
                fam = float(mem['allocated']) / mem['total']
        except Exception as err:
            print('Failed to get fabric for node %s! [%s]' % (node, err))
            fam = -1
        return round(fam, 2)


    def get_DRAM_usage(self, node):
       # Get the DRAM percent used by calling ssh to the node
        dram = self.nodes_list[node-1]['soc']['mem_percent']
        return dram

    def get_network_in_bps(self, node):
        network_in = self.nodes_list[node-1]['soc']['network_in']
        return network_in

    def get_network_out_bps(self, node):
        network_out = self.nodes_list[node-1]['soc']['network_out']
        return network_out

    def get_cpu_usage(self, node):
        cpu = self.nodes_list[node-1]['soc']['cpu_percent']
        return cpu

Journal = JPower(__file__)


@Journal.BP.before_request
def validate_request(*args, **kwargs):
    global Journal
    return Journal.validate_request(request)


""" ----------------- ROUTES ----------------- """

@Journal.BP.route('/api/pernode/<nodestr>', methods=['GET'])
@Journal.BP.route('/api/pernode', methods=['GET'])
def pernode_api(nodestr=-1):
    """ Gather all data for the given node:
    Power State, CPU Usage, Fabric Usage, No. of Shelves, No. of Books,
    DRAM Usage, Network In, Networkout, and OS Manifest

    Note: The node passed in is in base 0 and is the index into the
    Journal.nodedata array. E.g., hostname node01 is node 0.
    """
    global Journal
    mainapp = Journal.mainapp

    # Validate the node is within range. Return 0s if not.
    if nodestr != -1:
        nodeindex = int(nodestr)
        node = nodeindex+1
    else:
        nodeindex = -1
        node = -1

    allNodes = [ { i : Journal.defaults } for i in range(40)]

    try:
        Journal.doThings()
    except Exception as err:
        print('Things went wrong! [%s]' % err)
        Journal.defaults['Node'] = node
        if nodeindex != -1:
            return make_response(jsonify(Journal.spoofStats(node)), 302)
        else:
            result = [ copy.deepcopy(Journal.defaults) for i in range(5)]
            nodes_indecies = [0, 4, 8, 14, 20]
            for i in range(len(nodes_indecies)):
                result[i] = copy.deepcopy(Journal.spoofStats(nodes_indecies[i]))
                result[i]['Node'] = nodes_indecies[i]
            return make_response(jsonify( { 'nodes' : result } ), 302)

    # nodedata is the dictionary of data returned
    nodedata = {}
    '''
    if not Journal.nodeinfo[nodeindex]:
        Journal.defaults['Node'] = node
        return make_response(jsonify(Journal.defaults), 302)
    '''

    if nodeindex != -1:
        nodeData = Journal.defaults
        try:
            nodeData = getNodeStats(node-1)
        except Exception as err:
            print('Failed to get node stats! [%s]' % err)
            nodeData = Journal.defaults

        return make_response(jsonify(nodeData), 200)
    else:
        result = []
        for node_index in Journal.available_nodes:
            try:
                nodeData = getNodeStats(node_index + 1)
                nodeData['Node'] = node_index
                result.append(copy.deepcopy(nodeData))
            except Exception as err:
                print('Failed to get node stats! [%s]' % err)
        return make_response(jsonify( { 'nodes' : result }), 200)



def getNodeStats(node):
    global Journal
    nodedata = Journal.defaults
    nodedata['Node'] = node
    nodedata['Power State'] = Journal.get_power_state(node)
    nodedata['OS Manifest'] = Journal.get_os_manifest(node)
    active = Journal.get_books_and_shelves(node)
    nodedata['No. of Shelves'] = active['shelves']
    nodedata['No. of Books'] = active['books']
    nodedata['Fabric Usage'] = '%s%%' % str(Journal.get_fabric_usage(node))

    # If the power to the node is off, then the remaining data is 0
    if nodedata['Power State'] == 'Off':
        nodedata['CPU Usage'] = '0%'
        nodedata['DRAM Usage'] = '0%'
        nodedata['Network In'] = '0 b/sec'
        nodedata['Network Out'] = '0 b/sec'
        return nodedata

    # gather the nodes data from LMP for the remaining data
    url = Journal.mainapp.config['LMP_SERVER'] + 'nodes/'
    response = requests.get(url, headers=Journal.mainapp.config['HTTP_HEADERS'])
    data=response.json()
    nodes_list = data['nodes']
    Journal.nodes_list = nodes_list

    nodedata['DRAM Usage'] = '%s%%' % str(Journal.get_DRAM_usage(node))
    nodedata['CPU Usage'] = '%s%%' % str(Journal.get_cpu_usage(node))
    nodedata['Network In'] = '%s b/sec' % str(Journal.get_network_in_bps(node))
    nodedata['Network Out'] = '%s b/sec' % str(Journal.get_network_out_bps(node))

    return nodedata
