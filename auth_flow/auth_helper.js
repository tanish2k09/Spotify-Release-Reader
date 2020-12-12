const Client = require('spotify-web-api-node');
require('dotenv').config();

// credentials are optional
const client = new Client({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: `http://localhost:${process.env.PORT}${process.env.SUBPATH}/auth/callback`
});

const scopes = ['user-read-private', 'user-read-email'];

function auth_url(state) {
    return client.createAuthorizeURL(scopes, state);
}

module.exports = { client, auth_url };