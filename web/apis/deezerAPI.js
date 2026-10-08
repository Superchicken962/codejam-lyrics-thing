/**
 * Deezer API - For retrieving audio samples.
 */

const baseUrl = "https://api.deezer.com";

/**
 * Get track audio sample url from deezer api.
 * 
 * @param { String } isrc - ISRC id
 * @returns { String } Audio sample url 
 */
async function getTrackAudioSample(isrc) {
    const url = `${baseUrl}/2.0/track/isrc:${isrc}`;
    
    return "";
}

exports.getTrackAudioSample = getTrackAudioSample;