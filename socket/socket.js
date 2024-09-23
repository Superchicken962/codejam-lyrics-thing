// ------------------------------------------------------------------------------
// Seperate server to store game info, and communicate with webserver & clients.
// ------------------------------------------------------------------------------

const http = require("http");
const server = http.createServer();
const { Server } = require("socket.io");
const config = require("../config.json");

const PORT = config.socketPort || 3001;

// Set max buffer size to allow for big payloads that might be required in games.
const io = new Server(server, {
    "cors": { "origin": "*" },
    "maxHttpBufferSize": 1e8
});

// Seperate namespaces into seperate files.
require("./web")(io.of("/web"));
require("./game")(io.of("/game"));

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}!`);
});