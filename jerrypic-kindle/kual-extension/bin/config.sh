#############################################################################
### ONLINE-SCREENSAVER CONFIGURATION SETTINGS
#############################################################################

# Interval in SECONDS in which to update the screensaver by default. This
# setting will only be used if no schedule (see below) fits. Note that if the
# update fails, the script is not updating again until INTERVAL minutes have
# passed again. So chose a good compromise between updating often (to make
# sure you always have the latest image) and rarely (to not waste battery).

# WARNING: the original online screensaver sets intervalls in MINUTES, we use SECONDS
DEFAULTINTERVAL=60

# Schedule for updating the screensaver. Use checkschedule.sh to check whether
# the format is correctly understood. 
#
# The format is a space separated list of settings for different times of day:
#       SCHEDULE="setting1 setting2 setting3 etc"
# where each setting is of the format
#       STARTHOUR:STARTMINUTE-ENDHOUR:ENDMINUTE=INTERVAL
# where
#       STARTHOUR:STARTMINUTE is the time this setting starts taking effect
#       ENDHOUR:ENDMINUTE is the time this setting stops being active
#       INTERVAL is the interval in SECONDS in which to update the screensaver
#
# Time values must be in 24 hour format and not wrap over midnight.
# EXAMPLE: "00:00-06:00=480 06:00-18:00=15 18:00-24:00=30"
#          -> Between midnight and 6am, update every 4 MINUTES
#          -> Between 6am and 6pm (18 o'clock), update every 15 SECONDS
#          -> Between 6pm and midnight, update every 30 SECONDS
#
# Use the checkschedule.sh script to verify that the setting is correct and
# which would be the active interval.
# SCHEDULE="00:00-06:00=240 06:00-22:00=120 22:00-24:00=240"

# WARNING: the original online screensaver sets intervalls in MINUTES, we use SECONDS
SCHEDULE="00:00-24:00=3600"

# folder that holds the screensavers
SCREENSAVERFOLDER=/mnt/us/linkss/screensavers/

# In which file to store the downloaded image. Make sure this is a valid
# screensaver file. E.g. check the current screensaver folder to see what
# the first filename is, then just use this. THIS FILE WILL BE OVERWRITTEN!
SCREENSAVERFILE=$SCREENSAVERFOLDER/bg_medium_ss00.png

# Whether to create log output (1) or not (0).
LOGGING=0

# Where to log to - either /dev/stderr for console output, or an absolute
# file path (beware that this may grow large over time!)
#LOGFILE=/dev/stderr
LOGFILE=/mnt/us/extensions/jerrypic/onlinescreensaver.log

# whether to disable WiFi after the script has finished (if WiFi was off
# when the script started, it will always turn it off)
DISABLE_WIFI=0

# Domain to ping to test network connectivity. Default should work, but in
# case some firewall blocks access, try a popular local website.
TEST_DOMAIN="www.amazonaws.com"

# How long (in seconds) to wait for an internet connection to be established
# (if you experience frequent timeouts when waking up from sleep, try to
# increase this value)
NETWORK_TIMEOUT=30

# timestamp file name local and at your online storage
# used to do an update if remote timestamp is higher than local timestamp
# remote address patter: [STORAGE_ROOT]/[KINDLE_ID]/[TIMESTAMP_FILE]
# add STORAGE_ROOT and KINDLE_ID in credentials.sh
TIMESTAMP_FILE="timestamp"

# imgae file name at your online storage
# downloaded if update of the screensaver is needed
# remote address patter: [STORAGE_ROOT]/[KINDLE_ID]/[IMAGE_FILE]
# add STORAGE_ROOT and KINDLE_ID in credentials.sh
IMAGE_FILE="jerrypic"

#############################################################################
# Advanced
#############################################################################

# the temporary file to download the screensaver image to
TMPFILE=/tmp/tmp.jerrypic.png

# the real-time clock to use (0, 1 or 2)
# look for file /sys/class/rtc/rtc[RTC]/wakealarm
RTC=1

# some kindles kind of block access to the rtc clock or don't have it (e.g K4)
# for these devices StefanS wrote a workaround with a custom rtcwake script
# if you see, that the original wait_for function in utils.sh (for PW) doesn't work
# set USE_K4_FIX=1
# run the checkrtc.sh script to figure out, if rtc works
USE_K4_FIX=1

# whether to disable wifi if you use K4 fix
# set KEEP_CONNECTION=1, if you plan to use G3 connectivity
# cause to establish a G3-connection needs some time, better leave it on
# be aware that it drains the battery
KEEP_CONNECTION=1
