const { Namespace } = require("socket.io");

/**
 * @param { Namespace } io 
 */
module.exports = function(io) {
    io.on("connection", (socket) => {

    });
}