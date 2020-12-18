const Client = require('spotify-web-api-node');
require('dotenv').config();

// credentials are optional
const client = new Client({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: `http://localhost:${process.env.PORT}${process.env.SUBPATH}/auth/callback`
});

const scopes = [
    'user-read-private',
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-private'
];

function auth_url(state) {
    return client.createAuthorizeURL(scopes, state);
}

var refreshFailures = 0;

function scheduleRefresh(seconds) {
    console.log(`\n!! Token expires in ${seconds} seconds !!`);

    setTimeout(() => {
        client.refreshAccessToken().then(function(data) {
            client.setAccessToken(data.body.access_token);
            console.log("!! Access Token refreshed !!");

            if (data.body.refresh_token != null) {
                client.setRefreshToken(data.body.refresh_token);
                console.log("!! Refresh Token refreshed !!");
            }

            refreshFailures = 0;
            scheduleRefresh(parseInt(data.body.expires_in));
        }, function(err) {
            console.log("\n!!!!!! COULD NOT REFRESH ACCESS TOKEN !!!!!!\n");
            console.log(err);

            refreshFailures++;

            if (refreshFailures < 3) {
                scheduleRefresh(parseInt(data.body.expires_in));
            } else {
                process.exit(1);
            }
        })
    }, seconds * 1000 / 2);

    console.log(`!! Token refreshes in ${seconds / 2} seconds !!`);
}

module.exports = { client, auth_url, scheduleRefresh };