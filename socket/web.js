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
                case "servers.getall":
                    reply({
                        "servers": serverManager.getServers()
                    });
                    break;
                    
                case "server.new":
                    if (!data.server || !data.server.name || !data.server.description || !data.owner) {
                        reply({"success": false, "reason": "Insufficient details provided!"});
                        return;
                    }

                    const server = new GameServer(data.server.name, data.server.description, data.server.maxPlayers || 2, data.owner);
                    serverManager.newServer(server);

                    reply({"success": true});
                    break;
            }

        });

    });
}