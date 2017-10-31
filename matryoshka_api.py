#!/usr/bin/python3
"""
    TODO: docs here
"""
__author__ = "Zakhar Volchak"
__copyright__ = "Copyright 2017 Hewlett Packard Enterprise Development LP"
__maintainer__ = "Zakhar Volchak"
__email__ = "zakhar.volchak@hpe.com"

import argparse
import flask
import addons.flask_cors as flask_cors
from importlib.machinery import SourceFileLoader # to import blueprints from path
import glob
import os

from pdb import set_trace


class MainApp:

    STATIC = os.path.abspath(os.path.dirname(__file__) + "/static/")
    TEMPLATES = os.path.abspath(os.path.dirname(__file__) + "/templates/")

    def __init__(self, bp_path, **kwargs):
        # trip trailing slash from path
        self.path = bp_path.rstrip('/') if bp_path.endswith('/') else bp_path
        self.path = self.root_dir + '/' + self.path
        self.blueprints = []

        self.app = flask.Flask('tm-appliances', static_folder='static', static_url_path='/static')
        flask_cors.CORS(self.app, supports_credentials=True) # to allow authentication

        self.app.config['url_prefix'] = '/appliance/'
        self.app.url_map.strict_slashes = False

        self.RefreshBlueprints()
        self.RegisterBlueprints(kwargs.get('ignore', None))


    def RefreshBlueprints(self):
        ''' Refresh all known blueprints paths from the blueprints folder provided
        in the constructor. '''
        self.blueprints = [path for path in glob.glob(self.path + '/*')]
        self.blueprints = sorted(self.blueprints)
        return self.blueprints


    # TODO: ignore_bp arg parser!
    def RegisterBlueprints(self, ignore_bp=None):
        ''' Add all blueprint scripts found in the blueprints/ folder to the
        flask routine. '''
        ignore_bp = ignore_bp if ignore_bp is not None else []

        bp_list = [] # list of all blueprints scripts (not importable yet)
        for bp_path in self.blueprints:
            bp_list.extend([path for path in glob.glob(bp_path + '/*.bp') ])
            bp_list.extend([path for path in glob.glob(bp_path + '/blueprint.py') ])

        #get rid of .py and .bp extension in the path name to make it importable
        #bp_list = [path.rstrip('.py') for path in bp_list]
        try:
            for bp in bp_list:
                module_name = bp.replace('/', '.')
                bp_name = module_name.split('.')[-3]
                if(bp_name in ignore_bp):
                    print('!!!! Ignoring to load blueprint "%s" !!!!' % bp_name)
                    continue

                imported_bp = SourceFileLoader(module_name, bp).load_module()
                imported_bp.Journal.register(self)

                self.app.register_blueprint(imported_bp.Journal.BP)
                print('Regestring bluerpint "%s"...' % imported_bp.Journal.name)
        except Exception as err:
            raise RuntimeError('Something went wrong while importing blueprints...:\n[ %s ]' % err)


    def SetConfig(self, path):
        """ Remember to use relative path. Assume you are in tm_dashboard
        root location, thus, path would be just 'server.cfg'."""
        self.app.config.from_pyfile(self.root_dir + path)


    @property
    def config(self):
        return self.app.config

    @property
    def root_dir(self):
        """ Absolute path/location of this (web_server.py) file """
        return os.path.dirname(os.path.abspath(__file__)) + '/'



def parse_cmd():
    parser = argparse.ArgumentParser()
    parser.add_argument('--ignore',
                        help='blueprints to be ignored/not-loaded by server. ' +\
                            '--ignore "bp1,bp2,bp2"', default=None)

    parsed = parser.parse_args()
    if parsed.ignore is not None:
        parsed.ignore = parsed.ignore.replace(' ', '').split(',')
    return vars(parsed)




def main(args=None):
    args = {} if args is None else args
    cmd = parse_cmd()
    args.update(cmd)

    mainapp = MainApp('blueprints/', **args)
    mainapp.SetConfig('server.cfg')
    if not args.get('dont_run', False):
        mainapp.app.run(host=mainapp.config['HOST'],
                        port=mainapp.config['PORT'],
                debug=True)
    return mainapp


if __name__ == '__main__':
    main()
