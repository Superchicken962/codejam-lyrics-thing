const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("play/menu.ejs");
});

router.get("/multiplayer", (req, res) => {
    res.render("play/multiplayer.ejs")
});

module.exports = router;