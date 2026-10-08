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
        data.server = { code: SERVER_CODE };

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
let tryingToPlayAudio = false;

const audio = (GAME_MODE == "audio") ? new AudioManager() : null;
/** @type { QuestionAnswerFormat }  */
let questionAnswers = null;

function updateGame(status) {
    const qType = status.state.settings.questionType;
    if (!questionAnswers) {
        setQuestionType(qType);
    }

    const elements = {
        previousQuestions: document.querySelector(".previous_questions .questions"),
        leaderboard: document.querySelector(".leaderboard .positions"),
        quiz: {
            lyrics: document.querySelector(".quiz .lyrics_display"),
            questions: document.querySelector(".quiz .questions"),
            messages: document.querySelector(".quiz .messages"),
            progressBar: {
                container: document.querySelector(".quiz .progress_bar"),
                bar: document.querySelector(".quiz .progress_bar .bar")
            },
            questionNum: document.querySelector(".quiz .question_num"),
            audio: {
                container: document.querySelector(".audio"),
                volume: document.querySelector(".audio .volume_slider"),
                display: document.querySelector(".audio .audio_display")
            }
        }
    };

    // -- Previous Questions/Answers List --

    const me = status.state.players.find(player => player.id === CURRENT_USER_ID);

    let previousQuestionsHtml = "";

    // Essentially just reverse the questions - show the last question as first in the list.
    const previousQuestions = status.state.previousQuestions.sort((a,b) => b.num - a.num);

    for (const question of previousQuestions) {
        const playerSelectedAnswer = question.playerAnswers.find(user => user.id === CURRENT_USER_ID);
        // console.log(question);

        // Only show the exact answer text if the actual question type is text entry.
        const wrongAnswer = question.answers[playerSelectedAnswer?.answer]?.songName || ((qType == "text") ?playerSelectedAnswer?.answer : "N/A");

        let answerResult = `<i class="fa fa-xmark"></i>`;
        let answer = "incorrect";
        let guessedAnswer = `<br><span class="guessedAnswer">You Guessed: ${wrongAnswer}</span>`;

        if (!playerSelectedAnswer) {
            answerResult = "-";
            answer = "none";
            guessedAnswer = "";
        }

        const correctAnswer = question.chosenSong?.answer;

        // Check if player's choice matches the correct answer.
        if (playerSelectedAnswer?.answer === correctAnswer) {
            answerResult = `<i class="fa fa-check"></i>`;
            answer = "correct";
            guessedAnswer = "";
        }

        // If the question was invalid, mark it with a slash.
        if (question.chosenSong.invalid) {
            answerResult = `/`;
            answer = "invalid";
            guessedAnswer = "";
        }
        
        previousQuestionsHtml += `
            <div class="question">
                <span class="number">#${question.num}</span>
                <span class="result ${answer}">${answerResult}</span>
                <span class="correctAnswer">${question.answers[correctAnswer].songName}</span>
                ${guessedAnswer}
            </div>
        `;   
    }

    elements.previousQuestions.innerHTML = previousQuestionsHtml;

    // -- Leaderboard --

    // Join the player list with the scores object, and then sort by the score to show highest at the top.
    const leaderboard = status.state.players.map(p => {
        p.score = status.state.scores[p.id] || 0;
        return p;
    }).sort((a,b) => b.score-a.score);

    let leaderboardHtml = "";

    const showAccuracy = true;

    for (const position of leaderboard) {
        const accuracy = ((position.score / (status.state.currentQuestion.num-1))*100).toFixed(1);
        
        // Show a user icon to indicate who the current player is - If the player is the owner, show a crown instead.
        let playerIndicator = (position.id === CURRENT_USER_ID) ? `<i class="playerIndicator fa fa-user" title="This is you!"></i>` : "";
        if (status.state.ownerId === position.id) {
            playerIndicator = `<i class="playerIndicator fa fa-crown" title="Server owner"></i>`;
        }

        leaderboardHtml += `
            <div class="player">
                <p>
                    ${playerIndicator}
                    <span class="score">${position.score}</span>
                    <span class="name">${position.username}</span>
                    <br>
                    ${(showAccuracy && accuracy !== "NaN") ? `<span class="accuracy">${accuracy}% Accuracy</span>` : ""}
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

    const correctAnswerSong = question.answers[question.chosenSong.answer].songName;

    switch (GAME_MODE) {
        case "lyrics":
            // If lyrics are unavailable, show a message and give the answer.
            elements.quiz.lyrics.innerHTML = `
                <p>${question.chosenSong.randomLyric || "<i>Lyrics Unavailable</i>"}</p>
                <p class="copyright">${question.chosenSong.randomLyric ? "" : correctAnswerSong}</p>
            `;
            elements.quiz.lyrics.show();
            break;

        case "audio":
            // Don't update if audio is playing.
            if (audio.isPlaying() && tryingToPlayAudio) break;
            
            elements.quiz.audio.container.classShow();

            tryingToPlayAudio = true;

            audio.load(question.chosenSong.audioSampleURL);
            audio.play(() => {
                // TODO: Add audio waveform thingy and volume slider.

            }).catch(e => {
                // TODO: Maybe add a timeout because this will error if a blank url is loaded (which will happen inbetween loads).

                // If the song fails to play, show a message and show the correct answer.
                // elements.quiz.audio.display.innerHTML = `
                //     <p>This song could not be played.</p>
                //     <p class="note">${correctAnswerSong}</p>
                // `;

                tryingToPlayAudio = false;
            });
            break;
    }

    if (!hasAnswered) {
        // Do not update again if the question is the same - there is nothing new to add, and it just messes up click listeners and hover effects.
        if (question.id === currentQuestionId) return;
        currentQuestionId = question.id;

        onNewQuestion(question);

        elements.quiz.messages.innerHTML = "";
        elements.quiz.messages.hide();

        questionAnswers.showAnswers(question.answers, guessAnswer);

    } else {
        elements.quiz.questions.innerHTML = "";

        elements.quiz.messages.show();
        elements.quiz.lyrics.hide();
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

function onNewQuestion() {
    // Handle gamemode specific things upon new question - i.e. pause audio.
    switch (GAME_MODE) {
        case "audio":
            audio.reset();
            break;
    }
}

function setQuestionType(type) {
    const container = document.querySelector(".quiz .questions");

    switch(type.toLowerCase()) {
        case "multiple_choice":
            questionAnswers = new MultipleChoiceQuestion(container);
            break;

        case "text":
            questionAnswers = new TextEntryQuestion(container);
            break;
    }
}

// document.addEventListener("keydown", (ev) => {
//     const key = ev.key.toUpperCase();
//     if (!["A", "B", "C", "D"].includes(key)) return;

//     document.querySelector(`.question#${key}`)?.click();
// });