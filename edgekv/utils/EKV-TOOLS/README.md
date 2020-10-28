# EdgeKV Utilities
A set of EdgeKV helper utilities conveniently provided as `EKV-TOOLS` python package.

Currently includes:
* `ekvTools.accessToken` a utility to describe an EdgeKV Access Token and create/update the EdgeKV Access Token file.

## Installation Instruction

### Pre-requisite
Please ensure you have satisfied the following pre-requisites:
* `Bash` shell installed on your system.
* `python3.6` or higher installed on your system.
* `pip3` installed on your system.
* The latest version of the following git repo: [https://github.com/akamai/edgeworkers-examples](https://github.com/akamai/edgeworkers-examples)

### Install/Update the EdgeKV Utilities
The following install script will create a python virtual environment in the directory from which it is executed
and will install the EdgeKV utilities python package under that virtual environment. 
 
To run the install script, execute:
```
$ mkdir <my_ekv_tools_dir>
$ cd <my_ekv_tools_dir>
$ /path/to/edgeworkers-examples/edgekv/EKV-TOOLS/install.sh
```
 
 ### Uninstall package
You can simply delete the directory in which you installed the EdgeKV utilities virtual environment.

## Running the Utilities
Please run the following commands from within a `bash` shell.

### Running the Access Token Utility

#### Setup your virtual environment
You only need to run this once within a `bash` shell session before using the EdgeKV utilities. 

If you launch a new session/window, make sure to execute it before using the EdgeKV utilities.
```
$ cd <my_ekv_tools_dir>
$ source ./ekv_env/bin/activate
```

#### Command Syntax & Help
Make sure you have set up your virtual environment and execute the following from within the corresponding directory.
```
$ cd <my_ekv_tools_dir>
$ python3 -m ekvTools.accessToken [options]
```
e.g.
```
$ python3 -m ekvTools.accessToken --help
```

#### Usage examples

Common usage examples:

1. You can pipe the JSON output of the EdgeKV Access Token OPENAPI command to the utility to describe the `my_token` token and write/update the EdgeKV Access Token file in the specified EW bundle directory:
    ```
    $ <EdgeKV Access Token OPENAPI command to retrieve/generate my_token> | \
        python3 -m ekvTools.accessToken -i -s -u -b <ew_bundle_path> my_token
    ```

2. You can pass the EdgeKV Access Token base64-encoded value verbatim to the utility to describe the `my_token` token and write/update the EdgeKV Access Token file in the specified EW bundle directory:
    ```
    $ python3 -m ekvTools.accessToken -t <token_base64_encoded_value> -s -u -b <ew_bundle_path> my_token
    ``` 

3. You can describe the `my_token` EdgeKV Access Tokens contained in the EdgeKV Access Token file in the specified EW bundle directory:
    ```
    $ python3 -m ekvTools.accessToken -s -b <ew_bundle_path> my_token
    ``` 
   