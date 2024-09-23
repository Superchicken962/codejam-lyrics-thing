const { generateRandomCode } = require("../utility");
const GameServer = require("./GameServer");

class ServerManager {
    // Make servers private, can only be accessed through getServers.
    #servers;

    constructor() {
        this.#servers = [];
    }

    /**
     * Return all servers.
     * @returns { GameServer[] } List of game servers.
     */
    getServers() {
        return this.#servers.map(this.cleanseServer);
    }

    /**
     * Create a new server by passing in a game server instance.
     * @param { GameServer } server - The game server instance.
     * @returns { boolean } Was the server created?
     */
    newServer(server) {
        let existingServer = this.findServerByCode(server.code);

        let attempts = 0;

        // Regenerate a code if it already exists - fail after 5 tries.
        while (existingServer && attempts < 5) {
            server.code = generateRandomCode(8);
            existingServer = this.findServerByCode(server.code);

            attempts++;
        }

        // If it still cannot find a unique id (This is highly unlikely), then return false to indicate the server has not been created.
        if (existingServer) {
            console.warn("Failed to create server after 5 tries! Unique code not found!");
            return false;
        }

        // Add to servers array, and return true to show that it has been created successfully.
        this.#servers.push(server);
        return true;
    }

    /**
     * Find a server by code.
     * @param { string } code - Code to search.
     * @returns { GameServer | null } Returns server if found, or null if not.
     */
    findServerByCode(code) {
        return this.cleanseServer(this.#servers.find(server => server.code === code));
    }

    /**
     * Get servers that a player has joined.
     * @param { string } id - Player's Spotify id.
     * @returns { GameServer[] } Array of servers the player has joined.
     */
    getServersWithPlayer = (id) => {
        // Filter servers list down to servers that contain a player with the givene id.
        return this.#servers.filter(server => server.players?.find(player => player.id === id)).map(this.cleanseServer);
    }

    /**
     * Remove unneeded values from the server object (values that do not need to be sent across sockets).
     * @param { GameServer | null | undefined } server - Server to use. Can safely pass in null - just returns null instantly.
     */
    cleanseServer = (server) => {
        if (!server) return null;

        let updatedServer = server;

        // delete updatedServer.broadcastState;
        // delete updatedServer.startBroadcast;
        
        // Delete interval from server object to send - otherwise it throws a "max call size exceeded" error when sending to socket.
        delete updatedServer.interval;

        return updatedServer;
    }
}

module.exports = ServerManager;