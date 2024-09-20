const GameServer = require("../classes/GameServer");
const ServerManager = require("../classes/ServerManager");
const serverManager = new ServerManager();

serverManager.newServer(new GameServer("Some sort of server", "Join if you want", 2, false))
serverManager.newServer(new GameServer("Another one", "my server", 2, false))

module.exports = {
    serverManager
};