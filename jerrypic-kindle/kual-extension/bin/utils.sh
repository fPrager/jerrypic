HOME=/mnt/us/extensions/jerrypic

##############################################################################
# Logs a message to a log file (or to console if argument is /dev/stdout)

logger () {
	MSG=$1
	
	# do nothing if logging is not enabled
	if [ "x1" != "x$LOGGING" ]; then
		return
	fi

	# if no logfile is specified, set a default
	if [ -z $LOGFILE ]; then
		$LOGFILE=stdout
	fi

	echo `date`: $MSG >> $LOGFILE
}


##############################################################################
# Retrieves the current time in seconds

currentTime () {
	date +%s
}

##############################################################################
# sets an RTC alarm
# arguments: $1 - time in seconds from now

# this is the original rtc alarm using wakealarm in rtc sys-folder
wait_for_PW (){
	# calculate the time we should return
	ENDWAIT=$(( $(currentTime) + $1 ))

	# disable/reset current alarm
	echo 0 > /sys/class/rtc/rtc$RTC/wakealarm

	# set new alarm
	echo $ENDWAIT > /sys/class/rtc/rtc$RTC/wakealarm

	# check whether we could set the alarm successfully
	if [ $ENDWAIT -eq `cat /sys/class/rtc/rtc$RTC/wakealarm` ]; then
		logger "Start waiting for timeout ($1 seconds)"

		# wait for timeout to expire
		while [ $(currentTime) -lt $ENDWAIT ]; do
			REMAININGWAITTIME=$(( $ENDWAIT - $(currentTime) ))
			if [ 0 -lt $REMAININGWAITTIME ]; then
				# wait for device to suspend or to resume - this covers the sleep period during which the
				# time counting does not work reliably
				logger "Starting to wait for timeout to expire"
				lipc-wait-event -s $REMAININGWAITTIME com.lab126.powerd resuming || true
			fi
		done

		logger "Finished waiting"
	else
       		logger "Failure setting alarm on rtc$RTC, wanted $ENDWAIT, got `cat /sys/class/rtc/rtc$RTC/wakealarm`"
	fi

	# not sure whether this is required
	lipc-set-prop com.lab126.powerd -i deferSuspend 1
}

# this is a workaround if setting th wakealarm is not possible
# e.g. on a K4
# thanks to StefanS
# source from blog post: http://www.mobileread.mobi/forums/showthread.php?t=236104&page=4
wait_for_K4 () {
	delay=$1
	now=$(currentTime)

        if [ "x1" == "x$LOGGING" ]; then
		state=`/usr/bin/powerd_test -s | grep "Powerd state"`
		defer=`/usr/bin/powerd_test -s | grep defer`
		remain=`/usr/bin/powerd_test -s | grep Remain`
		batt=`/usr/bin/powerd_test -s | grep Battery`
		logger "wait_for called with $delay, now=$now, $state, $defer, $remain, $batt"
	fi		
	# calculate the time we should return
	ENDWAIT=$(( $(currentTime) + $1 ))

	# wait for timeout to expire
	logger "Wait_for $1 seconds"
	while [ $(currentTime) -lt $ENDWAIT ]; do
		REMAININGWAITTIME=$(( $ENDWAIT - $(currentTime) ))
		if [ 0 -lt $REMAININGWAITTIME ]; then
			sleep 2
			lipc-get-prop com.lab126.powerd status | grep "Screen Saver" 
			if [ $? -eq 0 ]
			then
				# in screensaver mode
				if [ 0 -eq $KEEP_CONNECTION ]; then
					logger "go to sleep for $REMAININGWAITTIME seconds, wlan off"
					lipc-set-prop com.lab126.cmd wirelessEnable 0
				fi

				${HOME}/bin/rtcwake -d rtc$RTC -s $REMAININGWAITTIME -m mem
				logger "woke up again"

				if [ 0 -eq $KEEP_CONNECTION ]; then
					logger "Finished waiting, switch wireless back on"
					lipc-set-prop com.lab126.cmd wirelessEnable 1
				fi
			else
				# not in screensaver mode - don't really sleep with rtcwake
				sleep $REMAININGWAITTIME
			fi
		fi
	done


	# not sure whether this is required
	lipc-set-prop com.lab126.powerd -i deferSuspend 40
} 


wait_for () { 
	# decide to use K4 wait-for-fix
	if [ 0 -eq $USE_K4_FIX ]; then
		wait_for_PW $1
	else
		wait_for_K4 $1
	fi
}

