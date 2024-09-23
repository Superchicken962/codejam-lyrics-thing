const { Namespace } = require("socket.io");
const { serverManager } = require("./data");
const GameServer = require("../classes/GameServer");

/**
 * @param { Namespace } io 
 */
module.exports = function(io) {
    io.on("connection", (socket) => {
        socket.on("askSocket", (data) => {
            function reply(reply_data = {}) {
                if (!reply_data.id) reply_data.id = data.id;
                socket.emit("askSocket:response", reply_data);
            }

            switch(data.message) {
                case "server.relayState":
                    if (!data.server?.code) {
                        reply({"status": 400});
                        return;
                    }

                    socket.to(`server#${data.server.code}`).emit("server.state", {state: data.state});
                    reply({"status": 200});
                    break;

                case "server.join":
                    if (!data.server?.code) {
                        reply({"status": 400});
                        return;
                    }

                    // Join the socket to the server's socket room.
                    socket.join(`server#${data.server.code}`);

                    reply({
                        "status": 200,
                    });
                    break;
            }
        });
    });
};