const { generateRandomCode } = require("../utility");
const Player = require("./Player");
const gameSocket = require("../web/sockets").game;

class GameServer {
    /**
     * 
     * @param { string } name - Server name. 
     * @param { string } description - Server description.
     * @param { number } maxPlayers - Max players that will be able to join.
     * @param { Object } ownerInfo - Information about the player that made the server.
     * @param { string } ownerInfo.username - Player's Spotify username.
     * @param { string } ownerInfo.id - Player's Spotify id.
     * @param { boolean } isPrivate - Should server be private? (Hidden from server browser).
     */
    constructor(name, description, maxPlayers = 2, ownerInfo, isPrivate = false) {
        this.name = name;
        this.description = description;
        this.maxPlayers = maxPlayers;
        this.players = [];
        this.private = isPrivate;
        this.code = generateRandomCode(8);

        this.state = {
            started: false
        };
        this.interval = null;

        this.owner = ownerInfo;
        this.startBroadcast();
    }

    /**
     * Find a player that is connected to the server by id.
     * @param { string } id - Player's Spotify id.
     */
    findPlayerById = (id) => {
        return this.players.find(player => player.id === id) || null;
    }

    /**
     * Join player to server.
     * @param { string } username - Player's Spotify username.
     * @param { string } id - Player's Spotify Id.
     */
    joinPlayer = (username, id) => {
        // TODO: Consider setting limit of servers player can join.

        // Add player to players if not already joined.
        if (!this.findPlayerById(id)) {
            this.players.push(new Player(username, id));
        }
    }

    broadcastState = () => {
        // Ask the socket server to relay information to the players, since we cannot do that here (We're technically a client too).   
        gameSocket.ask("server.relayState", {state: this.state, server: {code: this.code}});
    }
    startBroadcast = () => {
        this.interval = setInterval(this.broadcastState, 100);
    }
}

module.exports = GameServer;