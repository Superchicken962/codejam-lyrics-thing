const { io } = require("socket.io-client");
const config = require("../config.json");
const { generateRandomCode } = require("../utility");

// Store callbacks for when responses are given.
const waitingResponses = {};

function addResponseListener(socket) {
    socket.on("askSocket:response", (data) => {
        // Check if there is any responses being awaited by the same id, and if there is then try calling the callback function.
        if (waitingResponses[data.id]) {
            // Call the callback if it is a function, then delete it regardless since it will not be needed again.
            if (typeof waitingResponses[data.id] === "function") waitingResponses[data.id](data);
    
            delete waitingResponses[data.id];
        }
    });
}

// Basically create a socket send/ask object for a given namespace.
module.exports = {
    init: function(namespace = "") {
        let socket = io(config.socketAddress+namespace);
        addResponseListener(socket);

        // Return send/ask functions.
        return {
            /**
             * Send data to socket and await the response.
             * @param { string } eventName - Event name to send to socket.
             * @param { Object } data - Data to send to socket.
             */
            ask: function(eventName, data = {}) {
                data.message = eventName;

                return new Promise((resolve) => {
                    // If id is not given, generate a random one.
                    if (!data.id) data.id = generateRandomCode(16);

                    waitingResponses[data.id] = resolve;
                    socket.emit("askSocket", data);
                });
            }
        };
    }
}