RTC=1

# load configuration
if [ -e "utils.sh" ]; then
	source utils.sh
else
	# set default values
	echo no scheduler
fi

echo 0 > /sys/class/rtc/rtc$RTC/wakealarm 
if [ 0 -eq `cat /sys/class/rtc/rtc$RTC/wakealarm` ]; then
	echo Using the kindle rtc should work, set USE_K4_FIX to 0
else
	echo Can\'t write to wakealarm in /sys/class/rtc/rtc$RTC/wakealarm, try use K4-Fix and set USE_K4_FIX to 1
fi