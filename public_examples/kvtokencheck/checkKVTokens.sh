#!/bin/zsh
## Setup the Environment Variables"
### Akamai API Credentials
export AKAMAI_CLIENT_SECRET=""
export AKAMAI_API_HOST=""
export AKAMAI_ACCESS_TOKEN=""
export AKAMAI_CLIENT_TOKEN=""
###  Slack Webhook
export SLACK_WEB_HOOK=""
### Lead time for expiry
export LEAD_TIME=30
python ./checkKVTokens.py
