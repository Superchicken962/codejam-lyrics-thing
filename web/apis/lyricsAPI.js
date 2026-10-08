const genius = require("genius-lyrics-api");
require("dotenv").config();

/**
 * @typedef { Object } LyricsObject
 * @property { String[] } lyrics
 */

/**
 * Get lyrics for a song given song information.
 * 
 * @param { String } artist - Artist.
 * @param { String } song - Song name.
 * @param { String } album - Album name.
 * @returns { Promise<LyricsObject> }
 */
async function getLyricsForSong(artist, song, album) {
    // const resp = await genius.getLyrics({
    //     apiKey: process.env.GENIUS_API_ACCESS_TOKEN,
    //     artist,
    //     title: song,
    //     optimizeQuery: true
    // });

    // const text = resp.split("[Verse 1]")[1];
    // const lyrics = text?.split("\n")?.filter(l => l);

    // console.log(lyrics);

    // return { lyrics };

    // Return nothing at the moment until a suitable lyrics solution can be implemented.
    return { lyrics: [] };
}

module.exports = {
    getLyricsForSong
}