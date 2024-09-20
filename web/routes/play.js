const express = require("express");
const errors = require("../errors");
const { requireLoggedInAPI } = require("../middlewares");
const router = express.Router();
const webSocket = require("../sockets").web;

router.get("*", (req, res, next) => {
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

router.post("/multiplayer/new", requireLoggedInAPI, (req, res) => {
    const { name, description, maxPlayers } = req.body;

    const noValue = (!name || !description || !maxPlayers);
    const outOfRange = (name?.length > 75 || description?.length > 120 || !(maxPlayers >= 2 && maxPlayers <= 8))

    if (noValue || outOfRange) {
        res.status(400).json(errors.api.buildError(400, "Bad Request", "Invalid fields given!"));
        return;
    }

    webSocket.ask("server.new", {
        server: {
            name, description, maxPlayers
        },
        owner: {
            username: req.session.user?.account?.display_name,
            id: req.session.user?.account?.id
        }
    }).then(resp => {
        
        if (resp.success) {
            res.status(200).json({});
        } else {
            res.status(500).json(errors.api.buildError(500, "Error Creating Server", resp.reason));
        }

    });
});

// TODO: Consider changing the method to GET. POST just makes it harder for a user to join without navigating through the site.
router.post("/multiplayer/join/:code", requireLoggedInAPI, (req, res) => {
    const gameCode = req.params.code;

    webSocket.ask("server.join", {
        server: {
            code: gameCode
        },
        user: {
            // TODO: Consider changing how data is stored in the session - changing display_name to username, storing only relevant info.
            username: req.session.user?.account?.display_name,
            id: req.session.user?.account?.id,
        }
    }).then(resp => {

        if (resp.success) {
            res.status(200).json({});
        } else {
            res.status(500).json(errors.api.buildError(500, "Error Joining Server", resp.reason));
        }
        
    });

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