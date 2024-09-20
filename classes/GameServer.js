const { generateRandomCode } = require("../utility");


class GameServer {
    /**
     * 
     * @param { string } name - Server name. 
     * @param { string } description - Server description.
     * @param { number } maxPlayers - Max players that will be able to join.
     * @param { boolean } isPrivate - Should server be private? (Hidden from server browser).
     */
    constructor(name, description, maxPlayers = 2, isPrivate = false) {
        this.name = name;
        this.description = description;
        this.maxPlayers = maxPlayers;
        this.players = [];
        this.private = isPrivate;
        this.code = generateRandomCode(8);
    }
}

module.exports = GameServer;