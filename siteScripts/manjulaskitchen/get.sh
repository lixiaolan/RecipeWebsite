#!/bin/bash

URI=$1
OUTFILE=$2

curl $URI > $OUTFILE
emacs --script clean.el $OUTFILE
