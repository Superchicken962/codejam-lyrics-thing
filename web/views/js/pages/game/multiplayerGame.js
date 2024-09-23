import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

const socket = io(SOCKET_URL+"game");

socket.on("connect", () => {
    socket.on("askSocket:response", (data) => {
        if (messagesAwaitingResponses[data.id]) {
            if (typeof messagesAwaitingResponses[data.id] === "function") messagesAwaitingResponses[data.id](data);

            delete messagesAwaitingResponses[data.id];
        }
    });
});

const messagesAwaitingResponses = {};

/**
 * Send and recieve message to/from the socket server.
 * @param { string } event - Name of the event/message to be sent.
 * @param { Object } data - Data to be sent.
 */
function askSocket(event, data = {}) {
    return new Promise((resolve) => {
        if (!data.id) data.id = generateRandomCode(16);
        data.message = event;

        messagesAwaitingResponses[data.id] = resolve;
        socket.emit("askSocket", data);
    });
}

// Join the server's socket room to recieve game states.
askSocket("server.join", {server: {code: SERVER_CODE}}).then(resp => {
    if (resp.status !== 200) {
        console.error("Failed to connect to game server!");
        return;
    }

    console.log("Connected to game server!");
});

socket.on("server.state", (data) => {
    console.log("Game update:", data);
});