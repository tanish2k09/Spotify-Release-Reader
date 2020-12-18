const client = require("./auth_flow/auth_helper").client;

var releaseRadar = null;
var user = null;

function showGuide() {
    console.log("\n!!! Release Radar playlist not found !!!");
    console.log("Make sure to add your Release Radar playlist to your library!");
}

function getPlaylistsFromUser(userData) {
    if (userData == null || userData.statusCode != 200) {
        console.log("Received bad profile on getMe()");
        return null;
      }

      return client.getUserPlaylists(userData.body.id);
}

function getReleaseRadarFromPlaylists(playlists) {
    releaseRadar = getMatchingPlaylist(playlists, "Release Radar", "spotify");

    if (releaseRadar == null) {
        showGuide();
        return null;
    }

    console.log("\n---------------");
    console.log("Found Release Radar playlist:");
    console.log(releaseRadar);
    console.log("---------------\n");

    return releaseRadar;
}

function checkDuplicate(playlists) {
    var date = new Date().toISOString().replace(/T.*/, '');

    return getMatchingPlaylist(playlists, "Release Radar : " + date, user.id);
}

function getMatchingPlaylist(playlists, name, owner) {
    if (playlists == null || playlists.statusCode != 200) {
        console.log("Received bad playlists");
        return null;
      }

      for (playlist of playlists.body.items) {
        if (playlist.name == name && playlist.owner.id == owner) {
          return playlist;
        }
      }

      return null;
}

function pumpTracks(rr, newPlaylist) {
    client.getPlaylistTracks(rr.id)
    .then(function (data) {
        if (data == null || data.statusCode != 200) {
            console.log(`${new Date().toISOString()} : Something went wrong reading tracks from RR`);
            return;
        }

        var collection = []
        for (trackInfo of data.body.items) {
            collection.push(trackInfo.track.uri);
        }

        client.addTracksToPlaylist(newPlaylist.id, collection)
        .then(() => {console.log(`${newPlaylist.name} cloning successful`)});
    });
}

function cloneReleaseRadar(rr) {
    if (rr == null) {
        return;
    }

    var date = new Date().toISOString().replace(/T.*/, '');
    client.createPlaylist(
        `Release Radar : ${date}`,
        {
            'description': 'Release Radar clone playlist - created using Spotify-Release-Reader',
            'public': false
        }
    )
    .then(function (newPlaylist) {
        if (newPlaylist == null || newPlaylist.statusCode != 201) {
            console.log(`${new Date().toISOString()} : Something went wrong while creating playlist`);
            return;
        }

        pumpTracks(rr, newPlaylist.body);
    });
}

function executeCommonCopy(userData) {
    getPlaylistsFromUser(userData)
    .then(function (playlists) {
        if (checkDuplicate(playlists) != null) {
            console.log(`${new Date().toISOString()} : Playlist already exists, skipping`);
            return;
        }

        cloneReleaseRadar(getReleaseRadarFromPlaylists(playlists));
    })
}

function shouldExecuteManual() {
    const friday = 5; // Day of the week
    var date = new Date();

    // False if it's Friday and earlier than 4AM right now
    return (date.getDay() != friday) || (date.getHours() > 4) || (date.getHours() == 4 && date.getMinutes() > 0);
}

function executeManualCopy() {
    if (shouldExecuteManual()) {
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
