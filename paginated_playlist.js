const pageLimit = 50;

class PaginatedPlaylist {
    constructor(user, client) {
        this.client = client;
        this.userID = user.body.id;
    }

    async init() {
        await this.#fetchPlaylists(0);
    }

    async #fetchPlaylists(offset) {
        this.playlists = await this.client.getUserPlaylists(
            this.userID,
            {
                limit: pageLimit,
                offset: offset
            }
        );
    }

    getPage() {
        return this.playlists
    }

    async nextPage() {
        if (this.playlists.body.next == null) {
            this.playlists = null;
            return;
        }

        await this.#fetchPlaylists(this.playlists.body.offset + 50);
    }
}

module.exports = { PaginatedPlaylist };