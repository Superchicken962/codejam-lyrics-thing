// Initialise the webSocket that will communicate to the socket through the web namespace.
const webSocket = require("./socketCommuncation");
webSocket.init("web");

module.exports = {
    web: {ask: webSocket.ask}
};