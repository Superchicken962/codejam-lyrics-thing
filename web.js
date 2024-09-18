// ----------------------------------------------------
// File for web process - using express.js
// ----------------------------------------------------

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require("node:path");
const fs = require("node:fs");
const PORT = 3080;
require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.engine("html", require('ejs').renderFile);
app.set("view-engine", "html");


app.get("/", (req, res) => {
    res.redirect("/search/lyrics");
    // res.render("index.ejs");
});

app.get("/search/lyrics", (req, res) => {
    res.render("search_lyrics.ejs");
});

app.post("/search/lyrics", (req, res) => {
    res.status(200).json({});
});








// Handle js, css, and assets routes.
app.get(["/js/*", "/css/*", "/assets/*"], (req, res, next) => {
    let requestPath = req.path;
    
    // Remove a trailing '/' if it is there.
    if (requestPath.slice(-1) === "/") {
        requestPath = requestPath.slice(0, -1);
    }
    
    let filePath = path.join(__dirname, "views/"+requestPath);
    
    // If path is for a css file, but an extension is not given then we add the .css ourselves.
    if (requestPath.startsWith("/css") && !filePath.endsWith(".css")) {
        filePath += ".css";
    }

    // Do the same for JavaScript files.
    if (requestPath.startsWith("/js") && !filePath.endsWith(".js")) {
        filePath += ".js";
    }
    
    if (!fs.existsSync(filePath) || !filePath.endsWith(".css") && !filePath.endsWith(".js") && !filePath.endsWith(".png") && !filePath.endsWith(".jpg")) {
        next();
        return
    }
    
    res.sendFile(filePath);
});

if (!process.env.LYRICS_API_KEY) {
    throw new Error("Missing API Key! Must be added to .env with key 'LYRICS_API_KEY'!");
}

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}!`);
});