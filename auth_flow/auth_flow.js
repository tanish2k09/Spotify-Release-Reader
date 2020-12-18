/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var open = require('opn');

const helper = require('./auth_helper');

var client_id = process.env.CLIENT_ID; // Your client id
var client_secret = process.env.CLIENT_SECRET; // Your secret
var redirect_uri = `http://localhost:${process.env.PORT}${process.env.SUBPATH}/auth/callback`; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

var stateKey = 'srr_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser());

function genCookie(res) {
    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    return state;
}

function succeed(result) {
    result.writeHead(200, { "Content-Type": "text/plain" });
    result.write("Authentication complete\n\nYou may close this tab now.");
    result.end();
    console.log("\nAuthentication/Refresh successful");
}

app.get(`${process.env.SUBPATH}/login`, function (req, res) {

    var state = genCookie(res);
    res.redirect(helper.auth_url(state));
});

app.get(`${process.env.SUBPATH}/auth/callback`, function (req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        console.log(`Request for mismatched state ${state} instead of expected: ${storedState} `);
        console.log('Redirecting to login...');
        res.redirect(`http://localhost:${process.env.PORT}${process.env.SUBPATH}/login`);
    } else {
        res.clearCookie(stateKey);
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                helper.client.setAccessToken(body.access_token);
                helper.client.setRefreshToken(body.refresh_token);
                succeed(res);
            } else {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    }));
            }
        });
    }
});

app.get('/srr/refresh_token', function (req, res) {

    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            helper.client.setAccessToken(body.access_token);
            succeed(res);
        } else {
            res.redirect('/#' +
                querystring.stringify({
                    error: 'invalid_refresh_token'
                }));
        }
    });
});

console.log('Listening on 8888');
app.listen(8888);

console.log('\nAuthentication URL:');
console.log(`http://localhost:${process.env.PORT}${process.env.SUBPATH}/login`);
open(`http://localhost:${process.env.PORT}${process.env.SUBPATH}/login`);