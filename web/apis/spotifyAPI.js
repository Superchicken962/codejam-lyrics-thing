// -------------------------
// Wrapper for Spotify API
// -------------------------

require("dotenv").config();
const QueryString = require("qs");

const SpotifyAPI = {
    constants: {
        BASE_API_URL: "https://api.spotify.com/"
    },

    joinURL: function(endpoint = "", version = "v1") {
        return this.constants.BASE_API_URL + version + endpoint;
    },

    GET: function(endpoint, version, accessToken, query_params, headers = {}) {
        let url = this.joinURL(endpoint, version);

        // If query parameters are given (and an object), then add to url.
        if (typeof query_params === "object") {
            url += QueryString.stringify(query_params, {"addQueryPrefix": true});
        }

        headers["Content-type"] = "application/x-www-form-urlencoded";

        // Add the auth header if a token is given.
        if (accessToken) headers["Authorization"] = "Bearer " + accessToken;

        return fetch(url, {"method": "GET", headers}).then(resp => resp.json());
    },

    playlistUrlToId: function(url) {
        let id = url.split("https://open.spotify.com/playlist/");

        // If there are no other parts than the base from the split, then it is not a valid id.
        if (!(id.length > 1)) {
            return null;
        }
    
        // Select the id part after the "open.spotify" part of the url.
        id = id[1];
    
        // Check if there is a song id/ query variable on the url and remove it if there is.
        id = (id.split("?si=").length > 1) ? id.split("?si=")[0].trim() : id.trim();
    
        return id;
    }
};

module.exports = SpotifyAPI;