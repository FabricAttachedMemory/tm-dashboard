#!/usr/bin/python3
import json


def hostnameFromTmconfig(path, nodeinfo):
    ''' Parse tmconfig file and extract hostnames and mfwApiUri data for each
    node defined. '''
    tmconfig_json = None
    # Use data from /etc/tmconfig to get hostname and mfwApiUri 
    with open(path) as json_data:
        tmconfig_json = json.load(json_data)

    rack_list = tmconfig_json['racks']
    for rack in rack_list:
        for enc in rack['enclosures']:
            for node in enc['nodes']:
                hostname = node['soc']['hostname']
                mfwApiUri = node['nodeMp']['mfwApiUri']
                nodeindex = int(hostname[4:])-1
                nodeinfo[nodeindex]['hostname'] = hostname
                nodeinfo[nodeindex]['mfwApiUri'] = mfwApiUri
    return nodeinfo
