""" This script allows user to get notification on expiring tokens"""
import os
import sys
import datetime
import json
import logging
from urllib.parse import urljoin
import http.client
import urllib3
import requests
from akamai.edgegrid import EdgeGridAuth
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def submit_request(testurl,payload,method,headers):
    """ Function to submit Akamai API """
    logger.debug("Requesting Method: %s URL %s with payload: %s with Headers %s", \
    method, testurl, payload, headers)
    my_headers = headers
    logger.debug(my_headers)
    req_session = requests.Session()
    req_session.trust_env = False
    req_session.auth = EdgeGridAuth(
        client_secret = client_secret,
        access_token = access_token,
        client_token = client_token
    )
    try:
        if method == "GET":
            if len(payload) > 0:
                response = req_session.get(testurl,params=payload, headers=my_headers, \
                           allow_redirects=False, verify=False)
            else:
                response = req_session.get(testurl, headers=my_headers, \
                           allow_redirects=False, verify=False)
        elif method == "POST":
            if len(payload) > 0:
                logger.debug("Using Post with Payload")
                response = req_session.post(testurl,data=json.dumps(payload), headers=my_headers, \
                           allow_redirects=False, verify=False)
            else:
                logger.debug("Using Post without Payload")
                response = req_session.post(testurl, headers=my_headers, \
                           allow_redirects=False, verify=False)
                logger.debug(response.url)
                logger.debug(response.headers)
        return (response.status_code,response)
    except requests.exceptions.HTTPError as my_errh:
        logger.critical ("Http Error: %s",my_errh)
        return_message = "Failure"
        return (response.status_code,return_message,my_errh)
    except requests.exceptions.ConnectionError as my_errc:
        logger.critical ("Error Connecting: %s",my_errc)
        return_status = 500
        return_message = "Failure"
        return (return_status,return_message,my_errc)
    except requests.exceptions.Timeout as my_errt:
        logger.critical ("Timeout Error:%s ",my_errt)
        return_status = 500
        return_message = "Failure"
        return (return_status,return_message,my_errt)
    except requests.exceptions.RequestException as my_eree:
        ## catastrophic error. bail.
        logger.critical("Your Request had an error:%s ",  my_eree)
        logger.critical ("Check parameters")
        logger.critical("Your Request had an error with Status %s", response.status_code)
        return_status = 500
        return_message = "Failure"
        return (response.status_code,return_message,my_eree)


def get_kv_tokens():
    """ Function to get the tokens """
    host = os.environ['AKAMAI_API_HOST']
    #baseurl = 'https://%s' % host
    baseurl = (f"https://{host}")
    headers =  {}
    request_url = '/edgekv/v1/tokens'
    payload = {'includeExpired':'true' }
    status = submit_request(urljoin(baseurl,request_url),payload,"GET",headers)
    logger.debug (status[0])
    if status[0] != 200:
        logger.info("Request to fetch token info failed, please review below errors")
        logger.error(status[0])
        logger.error(status[1])
        sys.exit(1)
    else:
        json_list = json.loads(status[1].text)
        return json_list


def days_between(date1, date2):
    """ function to get difference between two dates """
    date1 = datetime.datetime.strptime(date1, "%Y-%m-%d")
    date2 = datetime.datetime.strptime(date2, "%Y-%m-%d")
    return abs((date2 - date1).days)

### Start Processing
slack_webhook = os.environ['SLACK_WEB_HOOK']
client_secret = os.environ['AKAMAI_CLIENT_SECRET']
access_token = os.environ['AKAMAI_ACCESS_TOKEN']
client_token = os.environ['AKAMAI_CLIENT_TOKEN']
if isinstance(os.environ['LEAD_TIME'], str):
    duration = int(os.environ['LEAD_TIME'])
else:
    duration = os.environ['LEAD_TIME']


## Initialize logger
logger = logging.getLogger('getAkamaiLocationInfo')
logger.setLevel(logging.DEBUG)
# create console handler with a higher log level
ch = logging.StreamHandler()
## Create the Format
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

ch.setFormatter(formatter)

if os.environ.get("DEBUG", False):
    ## Create log file handle
    log_file = os.path.basename(__file__).split(".")[0] + ".log"
    fh = logging.FileHandler(log_file,'w+')
    fh.setFormatter(formatter)
    fh.setLevel(logging.DEBUG)
    ch.setLevel(logging.INFO)
    def httpclient_log(*args):
        """ function to get http debug """
        logger.debug(" ".join(args))
    http.client.print = httpclient_log
    http.client.HTTPConnection.debuglevel = 1
    logger.addHandler(fh)
else:
    ch.setLevel(logging.INFO)


# add the handlers to the logger
logger.addHandler(ch)

current_time = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%f%z")
today = datetime.datetime.now().strftime("%Y-%m-%d")
logger.info("Started Processing at: %s", current_time)
logger.info("Getting current KV tokens")
info = get_kv_tokens()
tokens = info['tokens']
expiring_tokens = []
block_data = []
block_header = { "type": "header", "text": { "type": "plain_text", "text": "Expiring Tokens"}}
block_header_copy = block_header.copy()
block_data.append(block_header_copy)
for token in tokens:
    logger.debug("Token : %s expires on %s -- Will expire in %s days", token['name'], \
                 token['expiry'],days_between(today, token['expiry']))
    if days_between(today, token['expiry']) < duration:
        logger.info("Token: %s will expire on  %s", token['name'], token['expiry'])
        temp_data = { "type": "section", "fields": [ { "type": "mrkdwn", "text": "*Name:*\n" \
                    + token['name'] }, { "type": "mrkdwn", "text": "*expiry Date:*\n" \
                    + token['expiry']  } ] }
        temp_data_copy = temp_data.copy()
        block_data.append(temp_data_copy)
        expiring_tokens.append(token)

#Send all to slack
slack_payload = {}
slack_payload['blocks']= block_data
try:
    slack_response = requests.post( slack_webhook, data=json.dumps(slack_payload), \
    headers={'Content-Type': 'application/json'})
    slack_response.raise_for_status()
except requests.exceptions.HTTPError as errh:
    logger.error("Error Code: %s with Message: %s", slack_response.status_code, errh)
