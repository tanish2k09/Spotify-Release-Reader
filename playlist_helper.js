// Ideally we want to be able to find multiple playlist descriptors in one scan.
// This means we should already know what we're looking for, and *then* fetch paginated results.
// as we go through all the playlists, we keep references to the ones we are looking for.
//
// It is also important that we don't clone the same playlist multiple times, so we 
// can take an additional parameter as "target"
//
// What if we wanna scale and have multiple targets? Well, the might mean we also have multiple sources.
// A simple way would be to create a new scan for each target, but that's also inefficient.
// We wanna reduce the number of API calls by doing as much work needed in the same request.
// This means our helper should be able to take a [target-source] parameter and check all of them in one go. 
// We already know how to identify our target, which is based on the name. However, that might change based
// on other stuff like creator. Therefore, we should take both target and source as a "closure"/function
// that can be called and check for the match at the source of truth.
//
// Suggested params: [target(), source()], user, client
const PaginatedPlaylist = require('./paginated_playlist').PaginatedPlaylist;
const TimeHelper = require('./time_helper');

async function getMatchedPlaylists(playlistDescriptors, user, client) {
    // Sanitize playlistDescriptors:
    if (playlistDescriptors == null || playlistDescriptors.size == 0) {
        return {};
    }

    // No need to sanitize user or client here
    let pager = new PaginatedPlaylist(user, client);
    await pager.init()

    // We might run out of things to check for, or pages to check them in.
    // If the target matches, we remove the pair from the descriptors. 
    // If the source matches, we save that as a return value.
    // It is possible that the source might match before a duplicate target,
    // so the return value set might already have it.
    var matchedPlaylists = new Set();

    while (pager.getPage() != null) {
        playlistDescriptors.forEach(function (descriptor) {
            pager.getPage().body.items.some( function (playlist) {
                if (playlistDescriptors.size == 0) {
                    return true;
                }

                if (descriptor.source(playlist)) {
                    descriptor.setSourceID(playlist)
                    matchedPlaylists.add(descriptor);
                }

                if (descriptor.target(playlist, user)) {
                    descriptor.setSourceID(null);
                    matchedPlaylists.delete(descriptor);
                    playlistDescriptors.delete(descriptor);
                }
            }
        )});

        if (playlistDescriptors.size == 0) {
            break;
        }
        
        await pager.nextPage();
    }

    return matchedPlaylists;
}

function isReleaseRadarSource(playlist) {
    let isReleaseRadar = (playlist.name == "Release Radar" && playlist.owner.id == "spotify")

    if (isReleaseRadar) {
        console.log('Found Release Radar!');
    }

    return isReleaseRadar;
}

function isReleaseRadarTarget(playlist, user) {
    let isTarget = (playlist.name == getReleaseRadarTargetName() && playlist.owner.id == user.body.id)

    if (isTarget) {
        console.log(`Found matching target for ${getReleaseRadarTargetName()}, doing nothing.`);
    }

    return isTarget;
}

function getReleaseRadarTargetName() {
    return `Release Radar : ${TimeHelper.getFridayDate()}`
}

module.exports = { 
    getMatchedPlaylists, 
    isReleaseRadarSource, 
    isReleaseRadarTarget,
    getReleaseRadarTargetName
};