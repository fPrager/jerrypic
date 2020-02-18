HOME=/mnt/us/extensions/jerrypic
export LD_LIBRARY_PATH=${HOME}/lib

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

TIME_STAMP_URL="${API_ROOT}${KINDLE_ID}%2F${TIMESTAMP_FILE}"
IMAGE_URL="${API_ROOT}${KINDLE_ID}%2F${IMAGE_FILE_NAME}"

readRemoteTimestamp () {
	${HOME}/bin/wget -qO- "${TIME_STAMP_URL}"
}

readLocalTimestamp () {
	cat ${TIME_STAMP_FILE_NAME}
}

needsToUpdate () {
    recent=$1
    last=$2
    echo "$recent > $last" | ${HOME}/bin/bc -l
}

storeTimestamp () {
    recent=$1
    echo ${recent} > ${TIME_STAMP_FILE_NAME}
}