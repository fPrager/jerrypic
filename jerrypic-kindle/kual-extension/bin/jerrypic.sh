HOME=/mnt/us/extensions/jerrypic
export LD_LIBRARY_PATH=${HOME}/lib

# load configuration
if [ -e "config.sh" ]; then
	source config.sh
else
	TMPFILE=/tmp/tmp.jerrypic.png
fi

# load credentials
if [ -e "credentials.sh" ]; then
	source credentials.sh
else
	echo "Could not find credentials.sh in `pwd`"
	exit
fi

# do nothing if no URL is set
if [ -z $STORAGE_ROOT ]; then
	logger "No storage root has been set. Please add STORAGE_ROOT=[url] to credentials.sh."
	return
fi

# do nothing if no URL is set
if [ -z $KINDLE_ID ]; then
	logger "No kindle id has been set. Please add KINDLE_ID=[id] to credentials.sh."
	return
fi

TIMESTAMP_URL="${STORAGE_ROOT}${KINDLE_ID}%2F${TIMESTAMP_FILE}"
IMAGE_URL="${STORAGE_ROOT}${KINDLE_ID}%2F${IMAGE_FILE}"

readRemoteTimestamp () {
	${HOME}/bin/wget -qO- "${TIMESTAMP_URL}"
}

isValidTimestring () {
	echo "$1 > 0" | ${HOME}/bin/bc -l
}

readLocalTimestamp () {
	cat ${TIMESTAMP_FILE}
}

needsToUpdate () {
    recent=$1
    last=$2
    echo "$recent > $last" | ${HOME}/bin/bc -l
}

storeTimestamp () {
    recent=$1
    echo ${recent} > ${TIMESTAMP_FILE}
}