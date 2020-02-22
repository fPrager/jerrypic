#!/bin/bash
#
##############################################################################
#
# Fetch timestamp and image from a configurable URL.

cd "$(dirname "$0")"

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
	logger "wiFi is off, turning it on now"
	lipc-set-prop com.lab126.cmd wirelessEnable 1
	DISABLE_WIFI=1
fi

# wait for network to be up
TIMER=${NETWORK_TIMEOUT}     # number of seconds to attempt a connection
CONNECTED=0                  # whether we are currently connected
while [ 0 -eq $CONNECTED ]; do
	# test whether we can ping outside
	/bin/ping -c 1 $TEST_DOMAIN > /dev/null && CONNECTED=1

	# if we can't, checkout timeout or sleep for 1s
	if [ 0 -eq $CONNECTED ]; then
		TIMER=$(($TIMER-1))
		if [ 0 -eq $TIMER ]; then
			logger "No internet connection after ${NETWORK_TIMEOUT} seconds, aborting."
			break
		else
			sleep 1
		fi
	fi
done


if [ 1 -eq $CONNECTED ]; then
	compare=0
	remoteTimestamp=$(readRemoteTimestamp)
	if [ -z "$remoteTimestamp" ]; then 
		logger "can't load remote timestamp"
	else
		localTimestamp=$(readLocalTimestamp)
		compare=$(needsToUpdate ${remoteTimestamp} ${localTimestamp})
		storeTimestamp ${remoteTimestamp}
	fi

	if [ 1 -eq $compare ]; then
		logger "needs to update"
		echo load from ${IMAGE_URL}
		if curl $IMAGE_URL -o $TMPFILE; then
			mv $TMPFILE $SCREENSAVERFILE
			logger "screen saver image updated"

			# refresh screen
			lipc-get-prop com.lab126.powerd status | grep "Screen Saver" && (
				logger "updating image on screen"
				eips -g $SCREENSAVERFILE
			)
		else
			logger "error updating screensaver"
			if [ 1 -eq $DONOTRETRY ]; then
				touch $SCREENSAVERFILE
			fi
		fi
	else
		logger "no need to update"
	fi
fi

# disable wireless if necessary
if [ 1 -eq $DISABLE_WIFI ]; then
	logger "Disabling WiFi"
	lipc-set-prop com.lab126.cmd wirelessEnable 0
fi
