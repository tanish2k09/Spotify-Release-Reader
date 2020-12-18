# Spotify Release Reader

A simple Spotify app to clone your weekly Release Radar to your playlists

## Usage:

1) Install the required packages via `npm install`
2) Create a `.env` file in the project root folder as described in next section
2) Execute the service via `node service.js`
3) Approve the authorization request from a browser

## The .env file:

This file is used to store credentials outside of source code.
These are the few things required:

```
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
PORT=8888
SUBPATH=/srr
```
It is recommended you leave the PORT and SUBPATH fields unchanged. You must get the client ID and client secret from Spotify's developer portal by creating an app.