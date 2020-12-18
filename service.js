require('./auth_flow/auth_flow');
const helper = require('./auth_flow/auth_helper');
const CronJob = require('cron').CronJob;
const executeSafeCopy = require('./copymaker').executeSafeCopy;

// CronJob pattern for 4:00:00 AM, Fri
const pattern = '0 0 4 * * Fri';
const service = new CronJob(pattern, executeSafeCopy);

// Flow:
// 1) Wait for auth
// 2) Attempt to copy once (a startup-copy)
// 3) Set up the cronjob to do the copy
// 4) Make copy handle duplication case and time
const waiting = setInterval(function () {
    if (helper.client.getAccessToken() == null) {
        return;
    }

    clearInterval(waiting);
    executeSafeCopy();
    //service.start();
}, 5000);

// Since we're just starting we might wanna try copying the playlist once
// and then queue a cronjob to do it periodically. Duplicate playlists are
// appropriately handled and discarded.


// const service = new CronJob(pattern, executeCopy);
// service.start();