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

        console.log(headers);

        return fetch(url, {"method": "GET", headers}).then(resp => resp.json());
    }
};

module.exports = SpotifyAPI;