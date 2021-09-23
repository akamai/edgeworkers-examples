# Akamai EdgeKV Token Expiration monitor

As simple tool that monitors KV token expiration dates. This will allow one to be alerted in advance for upcoming token expiration


## Installation Instruction
### Pre-requisite
Please ensure you have satisfied the following pre-requisites:
* `Bash` shell installed on your system.
* `python3.6` or higher installed on your system.
* `pip3` installed on your system.
* `slack webhook` to the slack application 
* `Akamai API Credentials` to invoke the 

### Install the necessary modules
To install necessary modules, execute:
```
$ pip install -r requirements.txt in your shell
```

### Setup the environment variables
Edit the file checkKVTokens.sh  and update the values of the following variables
- AKAMAI_CLIENT_SECRET
- AKAMAI_API_HOST
- AKAMAI_ACCESS_TOKEN
- AKAMAI_CLIENT_TOKEN
- SLACK_WEB_HOOK
- LEAD_TIME

### Run the script
```
sh ./checkKVTokens.sh
```

### Schedule the job using Jenkins
The python script can be invoked as a Jenkins job with the necessary parameters and secret texts. A regular schedule jpb will allow one to have slack notification sent when a token is coming up for expiration.

### Sample Output
![Slack Notificaiton](./KVTokenExpiry.png)