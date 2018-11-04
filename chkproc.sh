daemon=`netstat -tlnp | grep :::3000 | wc -l`
if [ "$daemon" -eq "0" ] ; then
        nohup node /home/bsscco/add-all-calendars/app.js &
fi