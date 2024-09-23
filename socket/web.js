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
                    if (!data.server || !data.server.name || !data.server.description || !data.owner || !data.playlistInfo) {
                        reply({"success": false, "reason": "Insufficient details provided!"});
                        return;
                    }

                    const server = new GameServer(data.server.name, data.server.description, data.server.maxPlayers || 2, data.owner, data.playlistInfo);
                    serverManager.newServer(server);

                    reply({"success": true});
                    break;

                case "server.join":
                    if (!data.server?.code || !data.user?.username || !data.user?.id) {
                        reply({"success": false, "reason": "Insufficient details provided!"});
                        return;
                    }

                    let findServer = serverManager.findServerByCode(data.server.code);
                    if (!findServer) {
                        reply({"success": false, "reason": "Server not found!"});
                        return;
                    }

                    // joinPlayer does not return anything, so it is assumed it works. 
                    // Only thing that could fail is if the player has already joined the server.
                    findServer.joinPlayer(data.user.username, data.user.id);
                    reply({"success": true});
                    break;

                case "server.startquiz":
                    if (!data.server?.code || !data.user.id) {
                        reply({"success": false, "reason": "Insufficient details provided!"});
                        return;
                    }

                    let serverToStart = serverManager.findServerByCode(data.server.code);
                    if (!serverToStart) {
                        reply({"success": false, "reason": "Server not found!"});
                        return;
                    }

                    // Do not allow quiz to be started by someone that is not the owner.
                    if (data.user.id !== serverToStart.owner.id) {
                        reply({"success": false, "reason": "User is not the owner of this server!"});
                        return;
                    }

                    if (serverToStart.state.started) {
                        reply({"success": false, "reason": "Server has already been started!"});
                        return;
                    }

                    serverToStart.startGame();

                    reply({"success": true});
                    break;
            }

        });

    });
}