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

// Store the current question id so we can check if there is an new question each state update.
let currentQuestionId = "";

function updateGame(status) {
    const elements = {
        playerList: document.querySelector(".player_list .players"),
        leaderboard: document.querySelector(".leaderboard .positions"),
        quiz: {
            lyrics: document.querySelector(".quiz .lyrics_display"),
            questions: document.querySelector(".quiz .questions"),
            messages: document.querySelector(".quiz .messages"),
            progressBar: {
                container: document.querySelector(".quiz .progress_bar"),
                bar: document.querySelector(".quiz .progress_bar .bar")
            },
            questionNum: document.querySelector(".quiz .question_num")
        }
    };

    // console.log("Game update:", status.state);

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

    const me = status.state.players.find(player => player.id === CURRENT_USER_ID);

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

    elements.quiz.progressBar.container.show();
    elements.quiz.questionNum.show();

    const question = status.state.currentQuestion;

    // Calculate time left % to set progress bar width to.
    const now = Date.now();
    const questionTotalTime = question.expiryTime;
    const questionTimeLeft = (question.expiresAt - now);

    const questionTimeLeftPercent = (questionTimeLeft/questionTotalTime)*100;
    elements.quiz.progressBar.bar.style.width = questionTimeLeftPercent + "%";

    elements.quiz.questionNum.innerHTML = `Question ${question.num}`;


    // Show the questions

    const hasAnswered = !!question.playerAnswers?.find(player => player.id === me.id);

    if (!hasAnswered) {
        // Do not update again if the question is the same - there is nothing new to add, and it just messes up click listeners and hover effects.
        if (question.id === currentQuestionId) return;
        currentQuestionId = question.id;

        console.log(question);

        elements.quiz.messages.innerHTML = "";
        elements.quiz.messages.hide();

        elements.quiz.questions.innerHTML = `
            <a class="question" id="A">
                <span class="song_name">${question.answers["A"].songName}</span><br>
                <span class="song_artist">${question.answers["A"].artistName}</span>
            </a>
            <a class="question" id="B">
                <span class="song_name">${question.answers["B"].songName}</span><br>
                <span class="song_artist">${question.answers["B"].artistName}</span>
            </a>

            <br>

            <a class="question" id="C">
                <span class="song_name">${question.answers["C"].songName}</span><br>
                <span class="song_artist">${question.answers["C"].artistName}</span>
            </a>
            <a class="question" id="D">
                <span class="song_name">${question.answers["D"].songName}</span><br>
                <span class="song_artist">${question.answers["D"].artistName}</span>
            </a>
        `;

        for (const questionBtn of elements.quiz.questions.querySelectorAll("a.question")) {
            questionBtn.addEventListener("click", function() {
                guessAnswer(this.id);
            });
        }
    } else {
        elements.quiz.questions.innerHTML = "";

        elements.quiz.messages.show();
        elements.quiz.messages.innerHTML = "<h2>You have chosen an answer!</h2><h4>Wait for everyone else to answer, or for the timer to end.</h4>";
    }

}

function guessAnswer(answer) {
    askSocket("quiz.question.answer", {server: SERVER_CODE, user: CURRENT_USER_ID, answer: answer}).then(resp => {
        // The only "normal" time this will fail, is when an answer is clicked twice, or somehow another answer is selected.
        if (resp.status !== 200) {
            console.error("Failed to submit answer!");
            return;
        }
    });
}