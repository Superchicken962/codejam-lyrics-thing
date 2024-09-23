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

socket.on("server.state", updateGame);

function updateGame(status) {
    const elements = {
        playerList: document.querySelector(".player_list .players"),
        leaderboard: document.querySelector(".leaderboard .positions"),
        quiz: {
            lyrics: document.querySelector(".quiz .lyrics_display"),
            questions: document.querySelector(".quiz .questions"),
            messages: document.querySelector(".quiz .messages")
        }
    };

    console.log("Game update:", status.state);

    // -- Player List --

    let playersListHtml = "";

    for (const player of status.state.players) {
        playersListHtml += `
            <div class="player">
                ${(player.id === CURRENT_USER_ID) ? `<i class="selfIndicator fa fa-user" title="This is you!"></i>` : ""}
                <p>${player.username}</p>
                ${(status.state.ownerId === player.id) ? `<i class="ownerIndicator fa fa-crown" title="Server owner"></i>` : ""}
            </div>
        `;
    }

    elements.playerList.innerHTML = playersListHtml;

    // -- Leaderboard --

    // Join the player list with the scores object, and then sort by the score to show highest at the top.
    const leaderboard = status.state.players.map(p => {
        p.score = status.state.scores[p.id] || 0;
        return p;
    }).sort((a,b) => b.score-a.score);

    let leaderboardHtml = "";

    for (const position of leaderboard) {
        leaderboardHtml += `
            <div class="player">
                <p>
                    <span class="name">${position.username}</span>
                    <span class="score">${position.score}</span>
                </p>
            </div>
        `;
    }

    elements.leaderboard.innerHTML = leaderboardHtml;


    // -- Quiz --

    if (!status.state.started) {
        elements.quiz.messages.innerHTML = "<h2>Quiz has not started yet!</h2><h4>Ask the server owner to start it!</h4>";
        return;
    }

}