const client = require("./auth_flow/auth_helper").client;
const PlaylistDescriptor = require("./playlist_descriptor").PlaylistDescriptor;
const TimeHelper = require("./time_helper");
const PlaylistHelper = require("./playlist_helper");

var user = null;
var playlistDescriptors = new Set();
playlistDescriptors.add(
    new PlaylistDescriptor(
        PlaylistHelper.isReleaseRadarTarget,
        PlaylistHelper.isReleaseRadarSource,
        releaseRadarTrigger
    ));

function pumpTracks(rr, newPlaylist) {
    if (rr == null) {
        console.log("Returning from pumper, rr was null");
        return;
    }

    client.getPlaylistTracks(rr.id)
    .then(function (data) {
        if (data == null || data.statusCode != 200) {
            console.log(`${new Date().toISOString()} : Something went wrong reading tracks from RR`);
            return;
        }

        var collection = []
        for (trackInfo of data.body.items) {
            if (trackInfo.track != null) {
                collection.push(trackInfo.track.uri);
            }
        }

        client.addTracksToPlaylist(newPlaylist.body.id, collection)
        .then(() => {console.log(`${newPlaylist.body.name} cloning successful`)});
    });
}

async function releaseRadarTrigger(rr) {
    releaseRadar = rr;

    let newPlaylist = await createReleaseRadarClone()
    pumpTracks(rr, newPlaylist);
}

async function createReleaseRadarClone() {
    let newPlaylist = await client.createPlaylist(
        PlaylistHelper.getReleaseRadarTargetName(),
        {
            'description': 'Release Radar clone playlist - created using Spotify-Release-Reader',
            'public': false
        }
    );
    
    if (newPlaylist == null || (newPlaylist.statusCode != 200 && newPlaylist.statusCode != 201)) {
        console.log(`${new Date().toISOString()} : Something went wrong while creating playlist for ${TimeHelper.getFridayDate()}`);
        return null;
    }

    console.log(`Release Radar clone created: ${newPlaylist.body.name}`);
    return newPlaylist;
}

async function executeCommonCopy(userData) {
    if (userData == null || userData.statusCode != 200) {
        console.log("User Data received is bad, doing nothing for now.");
        return;
    }

    console.log("Executing common copy");

    // TODO: Figure out copying flow
    let activeDescriptors = await PlaylistHelper.getMatchedPlaylists(playlistDescriptors, userData, client);

    activeDescriptors.forEach(function (descriptor) {
        descriptor.trigger(descriptor.sourceID);
    });
}

function executeManualCopy() {
    if (TimeHelper.shouldExecuteManual()) {
        console.log("\nExecuting manual copy based on time\n");
        executeSafeCopy();
        return;
    }

    console.log("\nSkipping manual copy based on time\n");
}

function executeSafeCopy() {
    if (user != null) {
        executeCommonCopy(user);
        return;
    }

    // Cache the user info (only ID is actually used though)
    // Then execute the common pathway as usual
    client.getMe()
    .then(function (data) {
        user = data.body;
        return data;
    })
    .then(executeCommonCopy);
}

module.exports = { executeSafeCopy, executeManualCopy };
