const express = require("express");
const errors = require("../errors");
const router = express.Router();

router.use("*", (req, res, next) => {
    if (!req.session.isLoggedIn) {
        res.render("login_prompt.ejs");
        return;
    }
    
    next();
});

router.get("/", (req, res) => {
    res.render("routes/play/menu.ejs");
});

router.get("/multiplayer", (req, res) => {
    res.render("routes/play/multiplayer.ejs")
});

router.get("/multiplayer/new", (req, res) => {
    res.render("routes/play/multiplayer.ejs")
});

// Sample data.
const servers = [
    {
        "name": "Some sort of server",
        "description": "Join if you want",
        "maxPlayers": 2,
        "players": [],
        "private": false,
        "code": "SxjAmle"
    },
    {
        "name": "Another one",
        "description": "my server",
        "maxPlayers": 2,
        "players": [],
        "private": false,
        "code": "lAksjXw"
    }
];
router.get("/get/servers", (req, res) => {
    res.status(200).json(servers);
});

router.get("/get/server/:code", (req, res) => {
    const findServer = servers.find(server => server.code === req.params.code);

    if (!findServer) {
        res.status(404).json(errors.api.buildError(404, "Not Found", "Server not found!"));
        return;
    }

    res.json(findServer);
});

module.exports = router;