const GameServer = require("../classes/GameServer");
const ServerManager = require("../classes/ServerManager");
const serverManager = new ServerManager();

// serverManager.newServer(new GameServer("Sample Server #1", "The first example server!", 2, false))
// serverManager.newServer(new GameServer("Sample Server #2", "Try creating your own server, with different player slots!", 8, false))

module.exports = {
    serverManager
};