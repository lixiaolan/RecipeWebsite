#!/bin/bash

SAVEIFS=$IFS
IFS="
"
echo "IFS " $IFS

RECIPE=$1
TAG=$2

# TODO: check that the folder actually exists...
cd recipes/$TAG
ln -s ../all/$RECIPE ./

IFS=$SAVEIFS
