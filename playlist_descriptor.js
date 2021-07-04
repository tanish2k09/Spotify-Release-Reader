class PlaylistDescriptor {
    constructor(target, source, trigger) {
        this.target = target;
        this.source = source;
        this.trigger = trigger;
        this.sourceID = null;
    }

    setSourceID(sourceID) {
        this.sourceID = sourceID;
    }
}

module.exports = { PlaylistDescriptor };