#!/usr/bin/env bash

python3 -m pip install virtualenv
TOOLDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ENVDIR=$PWD
echo ">> Setting up python virtual environment for EKV-TOOLS under $ENVDIR..."
virtualenv $ENVDIR/ekv_env
source $ENVDIR/ekv_env/bin/activate
pip3 install --upgrade setuptools wheel
echo ">> Installing EKV-TOOLS from $TOOLDIR..."
pip3 install --upgrade $TOOLDIR
echo ">> Installation complete. "
echo "************************************************************"
echo "Execute 'source ./ekv_env/bin/activate' to setup the virtual environment"
echo " then execute 'python3 -m ekvTools.accessToken --help' for usage instructions"
echo "************************************************************"
