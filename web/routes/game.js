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
    
        res.render("routes/game/multiplayer_game.ejs", {server: findServer, socketAddress: config.socketAddress});
    });
});

module.exports = router;