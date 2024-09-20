const express = require("express");
const errors = require("../errors");
const router = express.Router();
const webSocket = require("../sockets").web;

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
    res.render("routes/play/create_server.ejs")
});

router.post("/multiplayer/new", (req, res) => {
    res.status(200).send("Hey");
});

router.get("/get/servers", (req, res) => {
    webSocket.ask("servers.getall").then(response => {
        res.status(200).json(response.servers);
    });
});

// TODO: Consider adding a new event to the socket to find a server. This still works.
router.get("/get/server/:code", (req, res) => {
    webSocket.ask("servers.getall").then(response => {
        const servers = response.servers;

        const findServer = servers.find(server => server.code === req.params.code);

        if (!findServer) {
            res.status(404).json(errors.api.buildError(404, "Not Found", "Server not found!"));
            return;
        }
    
        res.json(findServer);
    });
});

module.exports = router;