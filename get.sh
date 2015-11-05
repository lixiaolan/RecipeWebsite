#!/bin/bash

SAVEIFS=$IFS
IFS="
"
echo "IFS " $IFS

URI=$1
OUTFILE=$2
echo "URI " $URI
echo "OUT " $OUTFILE
SITE=$(echo $URI | sed 's/http:\/\/[w\.]*\(.*\)\.com.*/\1/')

cd siteScripts/$SITE
curl $URI > $OUTFILE
emacs --script clean.el $OUTFILE
mv $OUTFILE ../../recipes/all/

IFS=$SAVEIFS
