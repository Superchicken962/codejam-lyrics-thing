const express = require("express");
const router = express.Router();
const webSocket = require("../sockets").web;
const config = require("../../config.json");

router.get("/:code", (req, res) => {
    const gameCode = req.params.code;

    webSocket.ask("servers.getall").then(response => {
        const servers = response.servers;

        const findServer = servers.find(server => server.code === gameCode);

        // If server is not found, or user has not joined the server formally (clicked the button), then redirect to servers page.
        if (!findServer || !findServer.players.find(p => p.id === req.session.user?.account?.id)) {
            res.redirect("/play/multiplayer");
            return;
        }
    
        res.render("routes/game/multiplayer_game.ejs", {server: findServer, socketAddress: config.socketAddress, amIOwner: (req.session.user?.account?.id === findServer.owner?.id)});
    });
});

router.get("/:code/start", (req, res) => {
    const userId = req.session.user?.account?.id;

    webSocket.ask("server.startquiz", {server: {code: req.params.code}, user: {id: userId}}).then(resp => {
        if (!resp.success) {
            console.warn(`Server ${req.params.code} quiz attempted to start, but failed:`, resp.reason);
        }
        
        res.redirect(`/game/${req.params.code}`);
    });
});

module.exports = router;