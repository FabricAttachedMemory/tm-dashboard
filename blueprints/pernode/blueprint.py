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

import os
import requests
import random
from flask import Blueprint, jsonify, render_template, make_response, url_for, request
from pdb import set_trace
from pprint import pprint
import time
import threading
import json
from shlex import quote


from tm_dashboard.blueprints.bp_base import Journal


class JPower(Journal):

    def __init__(self, name, **args):
        super().__init__(name, **args)

        self.headers = {
            "Accept": "application/json; Content-Type: application/json; charset=utf-8; version=1.0",
        }

        url = 'http://localhost:31179/lmp/nodes/'
        r = requests.get(url, headers=self.headers)
        data=r.json()
        nodes_list = data['nodes']

        # num_nodes is used to size/index into the nodeinfo array of dicts
        self.num_nodes = len(nodes_list)

        # Initialize nodeifo list of dictionaries for each node's global data:
        #    { active_coordinate: used with LMP to get books and shelves
        #      allocated_coordinate: removes /SocBoard/SoC for FAM usage
        #      nmp_url: used to get the PowerState from MFW on the node MP
        #      hostname: used to do the ssh call
        #      last_network_in: used to calculate current b/sec rate
        #      last_network_out: used to calculate current b/sec rate
        #      last_network_timestamp: used to calculate current b/sec rate
        #      cpu_busy_time: used to calculate CPU Usage rate 
        #      cpu_total_time: used to calculate CPU Usage rate 
        #    }
        self.nodeinfo = [dict() for x in range(self.num_nodes)]

        # from the active shelf data to the node number.
        self.node_dict = {}
        for n in nodes_list:
            node = n['node_id']-1
            soc = n['soc']
            coord = soc['coordinate']
            self.nodeinfo[node]['active_coordinate'] = coord
            self.nodeinfo[node]['allocated_coordinate'] = coord[:-16]

        # Use data from /etc/tmconfig to get hostname and mfwApiUri 
        with open('/etc/tmconfig') as json_data:
            c = json.load(json_data)
            rack_list = c['racks']
            for r in rack_list:
                for e in r['enclosures']:
                    for n in e['nodes']:
                            hostname = n['soc']['hostname']
                            mfwApiUri = n['nodeMp']['mfwApiUri']
                            nodeindex = int(hostname[4:])-1
                            self.nodeinfo[nodeindex]['hostname'] = hostname
                            self.nodeinfo[nodeindex]['mfwApiUri'] = mfwApiUri

        # Use ssh to get initial values for CPU usage and Network In/Out
        for n in nodes_list:
            node = n['node_id']
            nodeindex = node - 1
            epoch_time_cmd="date +%s"
            net_in_out_cmd="ssh l4tm@" + self.nodeinfo[nodeindex]['hostname'] + " awk " + quote(quote('/IpExt: [0-9]+ / { print $8, $9 }')) + " /proc/net/netstat"
            prevtime=os.popen(epoch_time_cmd).read()
            prev_in_out_text=os.popen(net_in_out_cmd).read()
            prev_in_out = prev_in_out_text.split()
            prev_in = int(prev_in_out[0])
            prev_out = int(prev_in_out[1])
            self.nodeinfo[nodeindex]['network_in'] = int(prev_in_out[0])
            self.nodeinfo[nodeindex]['network_out'] = int(prev_in_out[1])
            self.nodeinfo[nodeindex]['network_timestamp'] = int(prevtime)
            cpu_stat_cmd="ssh l4tm@" + self.nodeinfo[nodeindex]['hostname'] + " awk " + quote(quote('/cpu / { print ($2+$4), ($2+$4+$5) }')) + " /proc/stat"
            cpu_stat_text=os.popen(cpu_stat_cmd).read()
            cpu_stat = cpu_stat_text.split()
            self.nodeinfo[nodeindex]['cpu_busy_time'] = int(cpu_stat[0])
            self.nodeinfo[nodeindex]['cpu_total_time'] = int(cpu_stat[1])

    @property
    def spoofed(self):
        """ Refer to the base class (../bp_base.py) for documentation."""
        return "not implemented"


Journal = JPower(__file__)


@Journal.BP.before_request
def validate_request(*args, **kwargs):
    global Journal
    return Journal.validate_request(request)

def get_power_state(node):
    # Get the powerstate of the node from the MFW service
    mfwheaders = {
        "Accept": "application/json; Content-Type: application/json; charset=utf-8",
}

    d_proxy = { "http" : None }
    url = Journal.nodeinfo[node-1]['mfwApiUri'] + '/MgmtService/SoC'
    r = requests.get(url, headers=mfwheaders, proxies=d_proxy)
    if r.status_code != requests.codes.ok:
        return "N/A"
    data=r.json()
    power = data['PowerState']
    return power


def get_os_manifest(node):
    # Get the os manifest for the node from the manifesting service
    url = 'http://localhost:31178/manifesting/api/node/' + str(node)
    r = requests.get(url, headers=Journal.headers)
    if r.status_code != requests.codes.ok:
        return "default"
    data=r.json()
    manifest=data['manifest']
    return manifest


def get_books_and_shelves(node):
    # Get the active books and shelves from LMP active data
    coord = Journal.nodeinfo[node-1]['active_coordinate']
    url = 'http://localhost:31179/lmp/active' + coord
    r = requests.get(url, headers=Journal.headers)
    if r.status_code != requests.codes.ok:
        return [0, 0]
    data=r.json()
    active = data['active']
    return active

def get_fabric_usage(node):
    # Calculate the fabric usage from the LMP allocated data
    coord = Journal.nodeinfo[node-1]['allocated_coordinate']
    url = 'http://localhost:31179/lmp/allocated' + coord
    r = requests.get(url, headers=Journal.headers)
    if r.status_code != requests.codes.ok:
        return 0
    data=r.json()
    mem = data['memory']
    if mem['total'] == 0:
        fam = 0
    else:
        fam = float(mem['allocated']) / mem['total']
    return round(fam, 2)

def get_DRAM_usage(node):
   # Get the DRAM percent used by calling ssh to the node
    cmd="ssh l4tm@" + Journal.nodeinfo[node-1]['hostname'] + " head -2 /proc/meminfo | awk '{ print $2 }' | paste - - | awk '{print 100.00-(($2/$1)*100)}'"
    dram = os.popen(cmd).read()
    return round(float(dram[:-1]), 2)

def get_network_bps(node):
    # Get the node's network traffic using ssh to the node
    net_in_out_cmd="ssh l4tm@" + Journal.nodeinfo[node-1]['hostname'] + " awk " + quote(quote('/IpExt: [0-9]+ / { print $8, $9 }')) + " /proc/net/netstat"
    epoch_time_cmd="date +%s"
    curtime=os.popen(epoch_time_cmd).read()
    cur_in_out_text=os.popen(net_in_out_cmd).read()
    cur_in_out = cur_in_out_text.split()
    cur_in = int(cur_in_out[0])
    cur_out = int(cur_in_out[1])
    bytes_in = cur_in - Journal.nodeinfo[node-1]['network_in']
    bytes_out = cur_out - Journal.nodeinfo[node-1]['network_out']
    secs = int(curtime) - Journal.nodeinfo[node-1]['network_timestamp']

    # Update the nodeinfo array with the latest network data
    Journal.nodeinfo[node-1]['network_in']=bytes_in
    Journal.nodeinfo[node-1]['network_out']=bytes_out
    Journal.nodeinfo[node-1]['network_timestamp']=int(curtime)

    network = []
    # It is possible for the time to be 0 seconds so avoid divide by 0
    if secs == 0:
        network.append(0)
        network.append(0)
    else:
        network.append(round((bytes_in/secs), 1))
        network.append(round((bytes_out/secs), 1))
    return network

def get_cpu_usage(node):
    # Calculate the CPU utilization from /proc/stat and previously saved
    # values to get a recent timeslice rather than since boot.
    cpu_stat_cmd="ssh l4tm@" + Journal.nodeinfo[node-1]['hostname'] + " awk " + quote(quote('/cpu / { print ($2+$4), ($2+$4+$5) }')) + " /proc/stat"
    cpu_stat_text=os.popen(cpu_stat_cmd).read()
    cpu_stat = cpu_stat_text.split()
    busy_time = int(cpu_stat[0])
    total_time = int(cpu_stat[1])
    # Update the saved values in nodeinfo for next time
    if total_time == Journal.nodeinfo[node-1]['cpu_total_time']:
        cpu = 0
    else:
        cpu = round(100 * (busy_time - Journal.nodeinfo[node-1]['cpu_busy_time']) / (total_time - Journal.nodeinfo[node-1]['cpu_total_time']), 2)
        print("cpu_usage: ", cpu)
    Journal.nodeinfo[node-1]['cpu_busy_time'] = busy_time
    Journal.nodeinfo[node-1]['cpu_total_time'] = total_time
    return cpu


""" ----------------- ROUTES ----------------- """

@Journal.BP.route('/api/pernode/<nodestr>', methods=['GET'])
def pernode_api(nodestr=1):
    """ Gather all data for the given node:  
    Power State, CPU Usage, Fabric Usage, No. of Shelves, No. of Books, 
    DRAM Usage, Network In, Networkout, and OS Manifest
    
    Note: The node passed in is in base 0 and is the index into the 
    Journal.nodedata array. E.g., hostname node01 is node 0.
    """
    global Journal
    mainapp = Journal.mainapp

    # nodedata is the dictionary of data returned
    nodedata = {}

    # Validate the node is within range. Return 0s if not.
    nodeindex = int(nodestr)
    node = nodeindex+1
    if nodeindex < 0 or nodeindex > (Journal.num_nodes-1):
        return make_response(jsonify({'results': nodedata}), 400)

    nodedata['Node'] = node
    nodedata['Power State'] = get_power_state(node)
    nodedata['OS Manifest'] = get_os_manifest(node)
    active = get_books_and_shelves(node)
    nodedata['No. of Shelves'] = active['shelves']
    nodedata['No. of Books'] = active['books']
    nodedata['Fabric Usage'] = get_fabric_usage(node) 

    # If the power to the node is off, then the remaining data is 0
    if nodedata['Power State'] == 'Off':
        nodedata['CPU Usage'] = 0
        nodedata['DRAM Usage'] = 0
        nodedata['Network In'] = 0
        nodedata['Network Out'] = 0
        return make_response(jsonify({'results': nodedata}), 200)

    nodedata['DRAM Usage'] = get_DRAM_usage(node)
    network = get_network_bps(node)
    nodedata['Network In'] = network[0]
    nodedata['Network Out'] = network[1]
    nodedata['CPU Usage'] = get_cpu_usage(node)

    return make_response(jsonify({'results': nodedata}), 200)
