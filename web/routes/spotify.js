const express = require("express");
const router = express.Router();
const config = require("../../config.json");
const { SessionTokens } = require("../storage");
const { generateRandomCode } = require("../../utility");
const SpotifyAPI = require("../apis/spotifyAPI");
require("dotenv").config();
const QueryString = require("qs");

let clientSecret, clientId;

if (!config["use-prod-api"]) {
    // Use dev api keys for spotify (redirect to localhost)
    clientSecret = process.env.SPOTIFY_API_CLIENT_SECRET;
    clientId = process.env.SPOTIFY_API_CLIENT_ID;
} else {
    // Use production testing api keys for spotify (redirect to public ip).
    clientSecret = process.env.PROD_SPOTIFY_API_CLIENT_SECRET;
    clientId = process.env.PROD_SPOTIFY_API_CLIENT_ID;
}

router.get("/login", (req, res, next) => {
    // If user is already logged in, redirect them back home.
    if (req.session.isLoggedIn) {
        res.redirect("/");
        return;
    };

    if (typeof req.query.error !== "undefined") {
        // TODO: Send a page with this error instead of just text.
        res.send("There was an error logging you in! Please try again later.");
        return;
    }

    // Send authorisation information to Spotify to login.
    res.redirect("https://accounts.spotify.com/authorize?" + QueryString.stringify({
        response_type: "code",
        client_id: clientId,
        scope: config.spotifyAPI.scope,
        redirect_uri: (config["use-prod-api"]) ? config.spotifyAPI["prod-redirectUri"] : config.spotifyAPI.redirectUri,
        state: SessionTokens.get(req.sessionID) || generateRandomCode(16)
    }));
});

// This is where the Spotify authorisation will send the user back to.
router.get("/auth", async(req, res) => {
    // Check if the session tokens match, and if there is any error returned from the API.
    if (req.query.state !== SessionTokens.get(req.sessionID) || req.query.error) {
        // TODO: "Stylise" errors - send them to user on a page.
        if (req.query.error) {
            console.error("Error with Spotify authentication!");
            res.status(500).send("Oops");
            return;
        }

        res.status(400).send("Invalid information provided!");
        return;
    }

    const body = {
        code: req.query.code,
        redirect_uri: (config["use-prod-api"]) ? config.spotifyAPI["prod-redirectUri"] : config.spotifyAPI.redirectUri,
        grant_type: "authorization_code"
    };

    const headers = {
        "content-type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + (new Buffer.from(clientId + ":" + clientSecret).toString("base64"))
    };

    // Request access token from the API.
    const request = await fetch("https://accounts.spotify.com/api/token", {method: "POST", body: QueryString.stringify(body), headers: headers});
    const response = await request.json();

    if (request.status !== 200) {
        console.error(`Error fetching token from Spotify API: ${response.error} (${response.error_description})`);
        res.redirect("/spotify/login?error");
        return;
    }

    const userAccountInfo = await SpotifyAPI.GET("/me", "v1", response.access_token);

    const userInfo = {
        access_token: {
            token: response.access_token,
            type: response.token_type,
            scope: response.scope,
            expires_in: response.expires_in,
            refresh_token: response.refresh_token
        },
        account: userAccountInfo
    };

    req.session.user = userInfo;
    req.session.isLoggedIn = true;

    res.redirect("/play");
});

router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
})

router.use("*", (req, res) => {
    res.render("routes/spotify/about.ejs");
});

module.exports = router;