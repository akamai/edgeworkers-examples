import time, sys, os, datetime, tzlocal
import json
import logging
from urllib.parse import urljoin
import requests
import http.client
import ssl
import urllib3
from akamai.edgegrid import EdgeGridAuth, EdgeRc
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def submit_request(testurl,payload,method,headers):
    logger.debug("Requesting Method: %s URL %s with payload: %s with Headers %s" %(method, testurl,payload,headers))
    my_headers = headers
    logger.debug(my_headers)
    s = requests.Session()
    s.trust_env = False
    s.auth = EdgeGridAuth(
        client_secret = client_secret,
        access_token = access_token,
        client_token = client_token
    )
    try:
        if method == "GET":
           if len(payload) > 0 :
              response = s.get(testurl,params=payload, headers=my_headers, allow_redirects=False, verify=False)
           else:
              response = s.get(testurl, headers=my_headers, allow_redirects=False, verify=False)
        elif method == "POST":
           if len(payload) > 0 :
              logger.debug("Using Post with Payload")
              response = s.post(testurl,data=json.dumps(payload), headers=my_headers, allow_redirects=False, verify=False)
           else:
              logger.debug("Using Post without Payload")
              response = s.post(testurl, headers=my_headers, allow_redirects=False, verify=False)
        logger.debug(response.url)
        logger.debug(response.headers)
        return (response.status_code,response)


    except requests.exceptions.HTTPError as errh:
        logger.critical ("Http Error:",errh)
        return_message = "Failure"
        return (response.status_code,return_message,errh)
    except requests.exceptions.ConnectionError as errc:
        logger.critical ("Error Connecting:",errc)
        return_status = 500
        return_message = "Failure"
        return (return_status,return_message,errc)
    except requests.exceptions.Timeout as errt:
        logger.critical ("Timeout Error:",errt)
        return_status = 500
        return_message = "Failure"
        return (return_status,return_message,errt)
    except requests.exceptions.RequestException as e:
        ## catastrophic error. bail.
        logger.critical("Your Request had an error: ",  e)
        logger.critical ("Check parameters")
        logger.critical("Your Request had an error with Status %s" %(response.status_code))
        return_status = 500
        return_message = "Failure"
        return (response.status_code,return_message,e)


def getKVTokens():
   host = os.environ['AKAMAI_API_HOST']
   baseurl = 'https://%s' % host 
   #headers = {
   #      'content-type': 'application/json',
   #}
   headers =  {}
   requestURL = '/edgekv/v1/tokens'
   payload = {'includeExpired':'true' }
   status = submit_request(urljoin(baseurl,requestURL),payload,"GET",headers)
   logger.debug (status[0])
   jsonList = json.loads(status[1].text)
   return(jsonList)


def days_between(d1, d2):
    d1 = datetime.datetime.strptime(d1, "%Y-%m-%d")
    d2 = datetime.datetime.strptime(d2, "%Y-%m-%d")
    return abs((d2 - d1).days)

### Start Processing
slack_webhook = os.environ['SLACK_WEB_HOOK']
client_secret = os.environ['AKAMAI_CLIENT_SECRET']
access_token = os.environ['AKAMAI_ACCESS_TOKEN']
client_token = os.environ['AKAMAI_CLIENT_TOKEN']
if isinstance(os.environ['LEAD_TIME'], str):
   print("FOUND STRING")
   duration = int(os.environ['LEAD_TIME'])
else:
   duration = os.environ['LEAD_TIME']

if 'DEBUG' in os.environ:
   debug_level = True
else:
   debug_level = False

## Initialize logger
logger = logging.getLogger('getAkamaiLocationInfo')
logger.setLevel(logging.DEBUG)
# create console handler with a higher log level
ch = logging.StreamHandler()
## Create the Format
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

ch.setFormatter(formatter)

if debug_level:
   ## Create log file handle
   log_file = os.path.basename(__file__).split(".")[0] + ".log"
   fh = logging.FileHandler(log_file,'w+')
   fh.setFormatter(formatter)
   fh.setLevel(logging.DEBUG)
   ch.setLevel(logging.INFO)
   def httpclient_log(*args):
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
logger.info("Started Processing at: %s" %(current_time))
logger.info("*** Getting current KV tokens")
info = getKVTokens()
tokens = info['tokens']
expiring_tokens = []
block_data = []
block_header = { "type": "header", "text": { "type": "plain_text", "text": "Expiring Tokens"}}
block_header_copy = block_header.copy()
block_data.append(block_header_copy)
for token in tokens:
   logger.debug("Token : %s expires on %s -- Will expire in %s days" %(token['name'], token['expiry'], days_between(today, token['expiry'])))
   if days_between(today, token['expiry']) < duration:
      logger.info("Token: %s will expire on  %s" %(token['name'], token['expiry']))
      temp_data = { "type": "section", "fields": [ { "type": "mrkdwn", "text": "*Name:*\n" + token['name'] }, { "type": "mrkdwn", "text": "*expiry Date:*\n" + token['expiry']  } ] }
      temp_data_copy = temp_data.copy()
      block_data.append(temp_data_copy)
      expiring_tokens.append(token)

#Send all to slack
slack_payload = {}
slack_payload['blocks']= block_data
response = requests.post( slack_webhook, data=json.dumps(slack_payload), headers={'Content-Type': 'application/json'})
if response.status_code != 200:
    raise ValueError(
        'Request to slack returned an error %s, the response is:\n%s'
       % (response.status_code, response.text)
)

