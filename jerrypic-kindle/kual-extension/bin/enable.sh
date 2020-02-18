#!/bin/sh

# change to directory of this script
cd "$(dirname "$0")"

# load configuration
if [ -e "config.sh" ]; then
	source config.sh
fi

# load utils
if [ -e "utils.sh" ]; then
	source utils.sh
else
	echo "Could not find utils.sh in `pwd`"
	exit
fi

if [ -e /etc/upstart ]; then
	logger "Enabling jerrypic auto-update"

	mntroot rw
	cp jerrypic.conf /etc/upstart/
	mntroot ro

	start jerrypic
else
	logger "Upstart folder not found, device too old"
fi
