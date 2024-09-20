const express = require("express");
const router = express.Router();
const webSocket = require("../sockets").web;

router.get("/:code", (req, res) => {
    const gameCode = req.params.code;

    // TODO: This route, add page and create the game logic.
    res.send(gameCode);
});

module.exports = router;