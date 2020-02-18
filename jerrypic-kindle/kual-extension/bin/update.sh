#!/bin/bash
#
##############################################################################
#
# Fetch timestamp and image from a configurable URL.

cd "$(dirname "$0")"

echo run
exit

# load configuration
if [ -e "config.sh" ]; then
	source config.sh
else
	TMPFILE=/tmp/tmp.jerrypic.png
fi

# load utils
if [ -e "utils.sh" ]; then
	source utils.sh
else
	echo "Could not find utils.sh in `pwd`"
	exit
fi

# load jerrypic logic
if [ -e "jerrypic.sh" ]; then
	source jerrypic.sh
else
	echo "Could not find jerrypic.sh in `pwd`"
	exit
fi

# enable wireless if it is currently off
if [ 0 -eq `lipc-get-prop com.lab126.cmd wirelessEnable` ]; then
	logger "WiFi is off, turning it on now"
	lipc-set-prop com.lab126.cmd wirelessEnable 1
	DISABLE_WIFI=1
fi

echo load timestamp ${TIME_STAMP_URL}

remoteTimestamp=$(readRemoteTimestamp)
localTimestamp=$(readLocalTimestamp)
compare=$(needsToUpdate ${remoteTimestamp} ${localTimestamp})

if [ 1 -eq $compare ]; then
	logger needs to update
	echo load from ${IMAGE_URL}
	if curl $IMAGE_URL -o $TMPFILE; then
		mv $TMPFILE $SCREENSAVERFILE
		logger "Screen saver image updated"

		# refresh screen
		lipc-get-prop com.lab126.powerd status | grep "Screen Saver" && (
			logger "Updating image on screen"
			eips -f -g $SCREENSAVERFILE
		)
	else
		logger "Error updating screensaver"
		if [ 1 -eq $DONOTRETRY ]; then
			touch $SCREENSAVERFILE
		fi
	fi
else
	echo no need to update
fi

# disable wireless if necessary
if [ 1 -eq $DISABLE_WIFI ]; then
	logger "Disabling WiFi"
	lipc-set-prop com.lab126.cmd wirelessEnable 0
fi
