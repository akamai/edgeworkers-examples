#!/usr/bin/python3

#============================================================================
# (c) Copyright 2020 Akamai Technologies, Inc. Licensed under Apache 2 license.
# Version: 0.4
# Purpose:
#   Display EdgeKV access token and/or update the 'edgekv_tokens.js' file.
# Repo: https://github.com/akamai/edgeworkers-examples/tree/master/edgeKV/EKV-TOOLS/ekvTools
#============================================================================


"""
EdgeKV Access Token utility script
"""

import sys
import os.path
import time
import json #pylint: disable=E0401
from optparse import OptionParser
import jwt #pylint: disable=E0401

def err_print(msg):
    """
    print error message
    :param msg: error message to print
    :return: N?A
    """
    print("ERROR: %s" % msg, file=sys.stderr)

def warn_print(msg):
    """
    print error message
    :param msg: error message to print
    :return: N?A
    """
    print("WARNING: %s" % msg, file=sys.stderr)

def dbg_print(msg, debug):
    """
    print debug message
    :param debug: debug flag
    :param msg: error message to print
    :return: N?A
    """
    if debug:
        print("DEBUG: %s" % msg)

def v_print(msg, verbose):
    """
    print debug message
    :param verbose: verbose flag
    :param msg: error message to print
    :return: N/A
    """
    if verbose:
        print(msg)


def open_file(filepath, mode, suppress_error=False):
    """
    Open specified file under specified path
    :param filepath: path+filename
    :param mode: mode to open file
    :return: file descriptor if successful, None otherwise
    """
    try:
        fd = open(filepath, mode)
    except IOError as ex:
        if not suppress_error:
            err_print("Failed to open file '%s' in '%s' mode (%s)!" % (filepath, mode, ex))
        return None
    return fd

def get_token_value(token_name, verbose=False, debug=False):
    """
    Retierve the token value from the Access OPEN OPENAPI response JSON provided via stdin
    :param token_name: Access Token name
    :param verbose: Enable verbose output
    :param debug: Enable debug output
    :return: (True, token_value) tuple upon success where token_value is the base64 encoded Access Token value
            (False, None) upon failure
    """
    token_value = None
    if not token_name:
        err_print("Invalid token name")
        return token_value
    v_print("Enter the access token value for '%s':" % token_name, verbose=verbose)
    try:
        token_value = json.load(sys.stdin)['value']
    except (AttributeError, json.decoder.JSONDecodeError) as errMsg:
        err_print("Invalid token input!")
        dbg_print(errMsg, debug=debug)
    return token_value


def validate_token(parsed_token, debug):
    """
    Validate the decoded EdgeKV Access Token
    :param parsed_token: dictionary containing a valid Parsed Access Token
    :param debug: Enable debug output
    :return: True if token is a valid EdgeKV access token, False otherwise
    """
    if not parsed_token:
        dbg_print("Empty token!", debug=debug)
        return False
    return True

def parse_token(token_value, debug):
    """
    Parse the JWT Access Token
    :param token_value: Access Token base64 encoded value
    :param debug: Enable debug output
    :return: Token as a dictionary upon success, None otherwise
    """
    token = None
    try:
        token = jwt.decode(str(token_value).rstrip(), options={"verify_signature": False})
    except jwt.exceptions.DecodeError as errMsg:
        err_print("Invalid Access Token!")
        dbg_print(errMsg, debug=debug)
        return None
    success = validate_token(token, debug=debug)
    if not success:
        dbg_print("Invalid EdgeKV Access Token!", debug=debug)
        token = None
    return token

def find_namespaces(parsed_token):
    """
    Find the namespace claims in the parsed Access Token
    :param parsed_token: dictionary containing a valid Parsed Access Token
    :return: list of namespace names
    """
    namespaces = []
    for k in parsed_token.keys():
        if k.startswith('namespace-'):
            namespaces.append('-'.join(k.split('-')[1:]))
    return namespaces

def show_token(token_name, parsed_token, debug):
    """
    Display the relevant Access Token proprties to stdout
    :param token_name: Access Token name
    :param parsed_token: dictionary containing a valid Parsed Access Token
    :param debug: Enable debug output
    :return: True upon success, False otherwise
    """
    #import pprint
    #print("Parsed Token:")
    #pprint.pprint(parsed_token)
    try:
        iat = parsed_token['iat']
        issue_date = time.strftime("%a, %d %b %Y", time.localtime(iat))
        exp = parsed_token['exp']
        expiry_date = time.strftime("%a, %d %b %Y", time.localtime(exp))
        ewids = parsed_token['ewids']
        env = parsed_token['env']
        prod = 'p' in env
        stag = 's' in env
        cpcode = parsed_token['cpc']
        namespaces = find_namespaces(parsed_token)
    except KeyError:
        dbg_print("Invalid EdgeKV Access Token!", debug=debug)
        err_print("Missing claim!")
        return False
    now = time.time()
    expiry_warning_days = 30
    expiry_warning_period = 60*60*24*expiry_warning_days # in seconds
    expired = exp < now
    expires_soon = not expired and exp-now < expiry_warning_period
    expiry_warning = "***WARNING: Access Token already EXPIRED!***"
    expire_soon_warning = "***WARNING: Access Token will EXPIRE in less than %s days!***"  % expiry_warning_days
    print("Token name:            %s" % token_name)
    print("Issue date:            %s" % issue_date)
    print("Expiry date:           %s" % expiry_date)
    if expired:
        print("             %s" % expiry_warning)
    if expires_soon:
        print("             %s" % expire_soon_warning)
    print("Valid for EWIDs:       %s" % ewids)
    print("Valid on Production:   %s" % prod)
    print("Valid on Staging:      %s" % stag)
    print("CpCode used:           %s" % cpcode)
    print("Namespace Permissions: %s" % ("NONE" if not namespaces else ""))
    for namespace in namespaces:
        permissions = str(parsed_token['namespace-%s' % namespace]).\
            replace("'r'", "READ").replace("'w'", "WRITE").replace("'d'", "DELETE")
        print("  %s: %s" % (namespace, permissions))
    return True


def update_a_token(tokens, token_name, token_value, namespaces, debug, overwrite=False):
    """
    Update a token entry in the tokens dictionary
    :param tokens: tokens dictionary to update
    :param token_name: Access Token name
    :param token_value: Access Token value
    :param namespaces: A list of namespaces associatetd with the token
    :param debug: Enable debug output
    :param overwrite: Update the token value even if existing value mismatch
    :return: True if successful, False otherwise
    """
    _ = debug
    if token_name in tokens:
        if tokens[token_name]['value'] != token_value and not overwrite:
            warn_print("Token value mismatch for token '%s'! Not updating token value." % token_name)
            return False
    else:
        tokens[token_name] = {}
    tokens[token_name]['value'] = token_value
    for namespace in namespaces:
        try:
            if namespace not in tokens[token_name]['namespaces']:
                tokens[token_name]['namespaces'].append(namespace)
        except KeyError:
            tokens[token_name]['namespaces'] = [namespace]
    return True

def parse_token_file(fpath, debug):
    """
    Parse the specified EdgeKV Access Token file and retrieve the tokens
    :param fpath: Path+filname of Access Token file
    :param debug: Enable debug output
    :return: a dictionary containing the tokens and their associated namespaces & values
    """
    tokens = {}
    fd = open_file(fpath, 'r', suppress_error=True)
    if fd:
        lines = fd.read()
        fd.close()
    else:
        dbg_print("Unable to read '%s'!" % fpath, debug=debug)
    if not fd:
        return tokens
    # handle spacing issue, then split
    keywords = lines.replace('edgekv_access_tokens=', 'edgekv_access_tokens = ').replace('={', '= {').\
        replace('}export', '} export').replace('export{', 'export {').\
        replace('{edgekv_access_tokens', '{ edgekv_access_tokens').\
        replace('edgekv_access_tokens}', 'edgekv_access_tokens }').split()
    #print(keywords)
    if keywords[0] != 'var' or keywords[1] != 'edgekv_access_tokens'  or keywords[2] != '=':
        err_print("Not a valid EdgeKV Access Token file (missing 'edgekv_access_tokens' var assignment)!")
        return tokens
    # ignore variable assignment
    keywords = keywords[3:]
    # remove trailing export
    try:
        idx = keywords.index('edgekv_access_tokens')
        #print(idx)
        if keywords[idx-1] != '{' or keywords[idx-2] != 'export':
            idx = -1
    except ValueError:
        idx = -1
    if idx < 0:
        err_print("Not a valid EdgeKV Access Token file (invalid/missing 'export' statement)!")
        return tokens
    # strip the trailing export statement
    keywords = keywords[:idx-2]
    # strip any traling commas
    if ''.join(keywords[-2:]).endswith(',}'):
        keywords[-2] = keywords[-2].replace(',', '')
    #print(keywords)
    # Create the tokens dictionary
    keywords = ['"name":' if k == 'name:' else k for k in keywords]
    keywords = ['"value":' if k == 'value:' else k for k in keywords]
    keywords = [k.replace("'", '"') for k in keywords]
    try:
        token_dict = json.loads(' '.join(keywords).replace(";", ""))
    except json.decoder.JSONDecodeError as errMsg:
        err_print("Invalid EdgeKV Access Token file format")
        dbg_print("%s" % errMsg, debug=debug)
        return {}
    for namespace_id, token in token_dict.items():
        token_name = token['name']
        token_value = token['value']
        namespace = '-'.join(namespace_id.split('-')[1:])
        success = update_a_token(tokens, token_name, token_value, [namespace], debug=debug)
        #print(token_name, success)
        if not success:
            return {}
    return tokens

def constuct_token_file_content(tokens, debug):
    """
    Create the content to be written into the EdgeKV Access Token file
    :param tokens: ictionary containing the tokens and their associated namespaces & values
    :param debug: Enable debug output
    :return: a string containing the EdgeKV Access Token file contents
    """
    _ = debug
    token_file_content = 'var edgekv_access_tokens = {\n'
    namespaces = {}
    for token_name, token in tokens.items():
        for namespace in token['namespaces']:
            if namespace in namespaces:
                err_print("Found multiple tokens for same namespace. This is not currently supported!")
                return ""
            namespaces[namespace] = {'name': token_name, 'value': token['value']}
    for namespace, token in namespaces.items():
        token_file_content += '        "namespace-%s":{\n' % namespace
        token_file_content += '            "name": "%s",\n' % token['name']
        token_file_content += '            "value": "%s"\n' % token['value'].strip('\n')
        token_file_content += '        },\n'
    token_file_content += '}\nexport { edgekv_access_tokens };'
    return token_file_content

def write_token_file(fpath, token_file_content, debug):
    """
    Parse the specified EdgeKV Access Token file and retrieve the tokens
    :param fpath: Path+filname of Access Token file
    :param token_file_content: a string containing the EdgeKV Access Token file contents
    :param debug: Enable debug output
    :return: True upon successfully writing the file, False otherwise
    """
    _ = debug
    fd = open_file(fpath, 'w')
    if not fd:
        return False
    fd.write(token_file_content)
    fd.flush()
    fd.close()
    return True

def update_token(token_name, token_value, parsed_token, bundle_path, overwrite, debug):
    """
    Update the Access Token file 'edgekv_tokens.js' in the specified bundle path with the specified token name/value
    :param token_name: Access Token name
    :param token_value: Access Token base64 encoded value
    :param parsed_token: dictionary containing a valid Parsed Access Token
    :param bundle_path: Valid path to the EdgeWorker bundle where 'edgekv_tokens.js' resides
                        If 'edgekv_tokens.js' does not exits, a new copy is created, otherwise the specified token
                        is updated within that existing file (added or modified)
    :param overwrite: Overwrite exsiting Access Token if value mismatch from one provided
    :param debug: Enable debug output
    :return: True upon success, False otherwise
    """
    filename = 'edgekv_tokens.js'
    fpath = os.path.join(bundle_path, filename)
    tokens = parse_token_file(fpath, debug=debug)
    namespaces = find_namespaces(parsed_token)
    # Add token if not there, or add to list of namespace is there
    if not tokens:
        tokens = {}
        tokens[token_name] = {'namespaces': namespaces, 'value': token_value}
    else:
        success = update_a_token(tokens, token_name, token_value, namespaces, debug=debug, overwrite=overwrite)
        #print(token_name, success)
        if not success:
            warn_print("Use '-o' to overwrite token value.")
    token_file_content = constuct_token_file_content(tokens, debug=debug)
    #print("Token File Content:\n%s\n" % token_file_content)
    if not token_file_content:
        err_print("No tokens to write to '%s'! Not updating file." % fpath)
        return False
    success = write_token_file(fpath, token_file_content, debug=debug)
    if not success:
        err_print("Failed to update '%s'!" % fpath)
        return False
    return True

def retrieve_token_from_file(token_name, bundle_path, debug):
    """
    Retrieve the value of the specified token from the Access Token file 'edgekv_tokens.js' in the specified bundle path
    :param token_name: Access Token name
    :param bundle_path: Valid path to the EdgeWorker bundle where 'edgekv_tokens.js' resides
    :param debug: Enable debug output
    :return: Token as a dictionary upon success, None otherwise
    """
    token_value = None
    filename = 'edgekv_tokens.js'
    fpath = os.path.join(bundle_path, filename)
    tokens = parse_token_file(fpath, debug=debug)
    if not tokens:
        dbg_print("Could not parse tokens in '%s'" % fpath, debug=debug)
        return token_value
    try:
        token_value = tokens[token_name]['value']
    except KeyError:
        dbg_print("Token '%s not found in '%s'" % (token_name, fpath), debug=debug)
    return token_value

def parse_opts_and_args(opts, args):
    """
    parse command options & arguments and do basic sanity check on them
    :param opts: Command options
    :param args: Command arguments
    :return: (True, params) tuple upon success,
             (False, no_params) upon failure
    """
    debug = opts.debug
    verbose = opts.verbose
    interactive = opts.interactive
    token_value = opts.token_value
    no_params = (None, None, None, None, None, interactive, verbose, debug)
    fail = (False, no_params)
    if not isinstance(args, list):
        args = [args]
    if len(args) != 1:
        err_print("Please specify token name!")
        return fail
    token_name = args[0]
    show = opts.show
    update = opts.update
    ew_bundle_path = opts.ew_bundle_path
    if interactive and token_value:
        err_print("You can either use 'interactive' or specify a token value, but not both at the same time!")
        return fail
    if update and not ew_bundle_path:
        err_print("Must specify a bundle path when using the 'update' option!")
        return fail
    if ew_bundle_path and not os.path.isdir(ew_bundle_path):
        err_print("Invalid bundle path '%s'!" % ew_bundle_path)
        return fail
    params = (token_name, token_value, show, update, ew_bundle_path, interactive, verbose, debug)
    return True, params

def execute():
    """
    Main execution function
    :return: True if successful, False otherwise
    """
    parser = OptionParser(usage='Usage: %prog [options] <token_name>')
    parser.add_option('-d', '--debug', action='store_true', dest='debug',
                      help='Display extra debug information.', default=False)
    parser.add_option('-v', '--verbose', action='store_true', dest='verbose',
                      help='Enable Verbose output.', default=False)
    parser.add_option('-o', '--overwrite', action='store_true', dest='overwrite',
                      help='Overwrite existing token value in case of mismatch.', default=False)
    parser.add_option('-i', '--interactive', action='store_true', dest='interactive',
                      help='Provide the access token JSON returned by the access token OPENAPI endpoint via stdin.',
                      default=False)
    parser.add_option('-t', '--token_value', action='store', dest='token_value',
                      help="The base64 encoded access token value.", default=None)
    parser.add_option('-s', '--show', action='store_true', dest='show',
                      help='Show details of the EdgeKV Access Token.', default=False)
    parser.add_option('-u', '--update', action='store_true', dest='update',
                      help='Updtate the EdgeKV Access Token JS file "edgekv_tokens.js" with the token data.',
                      default=False)
    parser.add_option('-b', '--bundle_path', action='store', dest='ew_bundle_path',
                      help="Path for the EdgeWorker JS bundle.", default=None)
    opts, args = parser.parse_args()
    success, params = parse_opts_and_args(opts, args)
    if not success:
        parser.print_help()
        return False
    token_name, token_value, show, update, ew_bundle_path, interactive, verbose, debug = params
    if interactive:
        token_value = get_token_value(token_name, verbose=verbose, debug=debug)
    dbg_print("Token name: '%s'" % token_name, debug=debug)
    dbg_print("Bundle Path: '%s'" % ew_bundle_path, debug=debug)
    dbg_print("Token value: '%s'" % token_value, debug=debug)
    if update and not token_value:
        err_print("Must provide a token value!")
        return False
    success = True
    parse_from_bundle_file = False
    if ew_bundle_path and not token_value:
        parse_from_bundle_file = True
    if parse_from_bundle_file:
        token_value = retrieve_token_from_file(token_name, ew_bundle_path, debug=debug)
    parsed_token = None
    if token_value:
        parsed_token = parse_token(token_value, debug=debug)
    if not parsed_token:
        err_print("Failed to find/parse token '%s'!" % token_name)
        success = False
    if success and show:
        success = show_token(token_name, parsed_token, debug=debug)
    if success and update:
        success = update_token(token_name, token_value, parsed_token, ew_bundle_path,
                               overwrite=opts.overwrite, debug=debug)
    v_print(">> %s." % ("SUCCESS" if success else "FAILURE"), verbose=verbose)
    return success

if __name__ == '__main__':
    ret = execute()
    sys.exit(1 if not ret else 0)
