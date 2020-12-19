# Spotify Release Reader

A simple Spotify app to clone your weekly Release Radar to your playlists

## Usage:
1) Follow/Add the real Release Radar playlist to your playlist collection. This is required in order to detect the playlist.

1) Install the required packages via `npm install`
2) Create a `.env` file in the project root folder as described in next section
3) Execute the service via `node service.js`
4) Approve the authorization request from a browser

## The .env file:

This file is used to store credentials outside of source code.
These are the few things required:

```
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
PORT=8888
SUBPATH=/srr
BROWSER=google chrome
CLOSETAB=true
```

1) `CLIENT_ID`: Your client_id from spotify developer portal app

2) `CLIENT_SECRET`: Your client_secret from spotify developer portal app (ONLY place this server-side)
3) `PORT`: HTTP port to listen at for authentication
4) `SUBPATH`: Localhost common route used by SRR
5) `BROWSER`: Your browser of choice to use for authentication request (Can be removed or left blank to use default browser)
6) `CLOSETAB`: Closes the successful authentication tab automatically if set to `true`
