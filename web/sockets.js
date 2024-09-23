// Initialise the webSocket that will communicate to the socket through the web namespace.
const { init } = require("./socketCommuncation");

const webSocket = init("web");
const gameSocket = init("game");

module.exports = {
    web: {ask: webSocket.ask},
    game: gameSocket
};