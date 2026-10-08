/**
 * Deezer API - For retrieving audio samples.
 */

const path = require("path");
const SaveCache = require("../../classes/SaveCache");

const baseUrl = "https://api.deezer.com";

/** 
 * @typedef { Object } TrackInfo
 * @property { String } sampleURL - Sample preview url
 * @property { String } lastUpdated - ISO string of last update.
 */

const cache = new SaveCache(path.join(__dirname, "../../data/audioCache.json"));

/**
 * Get track audio sample url from deezer api.
 * 
 * @param { String } isrc - ISRC id
 * @returns { Promise<String> } Audio sample url 
 */
async function getTrackAudioSample(isrc) {
    // Check if it exists in cache.
    if (cache.existsAndValid(isrc)) {
        return cache.getValue(isrc).sampleURL;
    }

    const url = `${baseUrl}/2.0/track/isrc:${isrc}`;
    
    try {
        const data = await (await fetch(url)).json();
        if (!data.preview) return "";

        // Find the expiry from the returned sample url and pass into the cache so we can refetch once expired.
        const now = new Date();
        const expireTimestamp = new Date(data.preview.split("exp=")[1]?.split("~")[0]*1000);
        const expInMins = Math.floor((expireTimestamp - now)/1000/60);
        
        cache.set(isrc, {
            sampleURL: data.preview
        }, isNaN(expInMins) ? 10 : expInMins);

        return data.preview;
    } catch (e) {
        return "";
    }
}

exports.getTrackAudioSample = getTrackAudioSample;