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
    if (cache.exists(isrc)) {
        return cache.getValue(isrc).sampleURL;
    }

    const url = `${baseUrl}/2.0/track/isrc:${isrc}`;
    
    try {
        const data = await (await fetch(url)).json();
        if (!data.preview) return "";

        cache.set(isrc, {
            sampleURL: data.preview
        });

        return data.preview;
    } catch (e) {
        return "";
    }
}

exports.getTrackAudioSample = getTrackAudioSample;