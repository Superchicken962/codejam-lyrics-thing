const { Namespace } = require("socket.io");
const { serverManager } = require("./data");

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
                case "servers.getall":
                    reply({
                        "servers": serverManager.getServers()
                    });
                    break;
            }

        });

    });
}