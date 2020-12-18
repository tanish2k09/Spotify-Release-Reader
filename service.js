require('./auth_flow/auth_flow');
const helper = require('./auth_flow/auth_helper');
const CronJob = require('cron').CronJob;
const executeSafeCopy = require('./copymaker').executeSafeCopy;
const executeManualCopy = require('./copymaker').executeManualCopy;

// CronJob pattern for 4:00:00 AM, Fri
const pattern = '0 0 4 * * Fri';
const service = new CronJob(pattern, executeSafeCopy);

// Since we're just starting we might wanna try copying the playlist once
// if it isn't Friday, in order to save this week's Release Radar as well.
// A small QoL bonus :)
const waiting = setInterval(function () {
    if (helper.client.getAccessToken() == null) {
        return;
    }

    clearInterval(waiting);
    executeManualCopy();
    service.start();
}, 5000);