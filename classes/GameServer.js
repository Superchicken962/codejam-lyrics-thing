const { generateRandomCode } = require("../utility");
const Player = require("./Player");
const Question = require("./type-definitions/Question");
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
     * @param { Object} playlistInfo - Chosen Spotify playlist.
     * @param { string } playlistInfo.id - Playlist id.
     * @param { Object[] } playlistInfo.songs - List of songs in the playlist.
     * @param { boolean } isPrivate - Should server be private? (Hidden from server browser).
     */
    constructor(name, description, maxPlayers = 2, ownerInfo, playlistInfo, isPrivate = false) {
        this.name = name;
        this.description = description;
        this.maxPlayers = maxPlayers;
        this.players = [];
        this.private = isPrivate;
        this.code = generateRandomCode(8);
        this.scores = {};
        
        this.playlistId = playlistInfo.id;
        this.songs = playlistInfo.songs;

        this.askedQuestions = 0;

        this.state = {
            started: false,
            players: this.players,
            settings: {
                maxPlayers: this.maxPlayers,
                questionTime: 60000
            },
            scores: this.scores,
            ownerId: ownerInfo.id || null,

            // Instantiate a question class just for the intellisense types. It will be replaced when the quiz starts anyway.
            currentQuestion: new Question(),
            previousQuestions: []
        };
        
        this.playerAnswers = {};

        this.interval = null;

        this.owner = ownerInfo;
        this.startBroadcast();

        // TODO: Possibly allow user to select the time per question.
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

    /**
     * The game "tick" that will be sent to lobbies every 100ms.
     */
    broadcastState = () => {
        if (this.state.started) {
            const now = Date.now();

            // Everyone has answered if the length of the player answers for this question matches the length of the connected players.
            const everyoneAnswered = (this.state.currentQuestion?.playerAnswers?.length === this.state.players.length);

            // Check if the question should expire (if expiry date has passed), Or if all the players in the server have chosen an answer.
            if (now > this.state.currentQuestion.expiresAt || everyoneAnswered) {
                const correctAnswer = this.state.currentQuestion.chosenSong.answer;

                // Check if the question number key exists, because it won't if no one answers in time.
                if (this.playerAnswers[this.askedQuestions]) {
                    // Get player answers for the current question number, and check them.
                    for (const [player, answer] of Object.entries(this.playerAnswers[this.askedQuestions])) {
                        if (answer === correctAnswer) {
                            this.awardCorrectAnswer(player);
                        }
                    }
                }

                // If there is current question, add it to the previous questions array before getting a new one.
                if (this.state.currentQuestion) this.state.previousQuestions.push(this.state.currentQuestion);

                this.state.currentQuestion = this.newQuestion();
            }

            // TODO: Add another check for if each player has answered the question - if so, go to next question.
        }

        // Ask the socket server to relay information to the players, since we cannot do that here (We're technically a client too).  
        gameSocket.ask("server.relayState", {state: this.state, server: {code: this.code}});
    }
    startBroadcast = () => {
        this.interval = setInterval(this.broadcastState, 100);
    }

    /**
     * Start the quiz.
     */
    startGame = () => {
        this.state.started = true;
        this.state.currentQuestion = this.newQuestion();
    }

    /**
     * Generate a new question.
     * @returns { Question } Question info
     */
    newQuestion = () => {
        // Set question expiry to be after the specified questionTime (default 60000ms)
        const questionExpiryDate = new Date();
        questionExpiryDate.setMilliseconds(questionExpiryDate.getMilliseconds() + this.state.settings.questionTime);

        // Increment asked questions by 1.
        this.askedQuestions++;

        const obj = {
            "id": generateRandomCode(16),
            "num": this.askedQuestions,
            "answers": {
                "A": null,
                "B": null,
                "C": null,
                "D": null,
            },
            "chosenSong": {
                "answer": null,
                "lyrics": ""
            },
            "expiresAt": questionExpiryDate.getTime(),
            "expiryTime": this.state.settings.questionTime || 60000,
            "playerAnswers": []
        };

        // Choose song.

        // Copy songs into new array for this method.
        const availableSongs = this.songs.slice();

        // Pick a random song to be the answer.
        const chosenSongIndex = Math.floor(Math.random() * availableSongs.length);
        let chosenSong = availableSongs[chosenSongIndex];

        // Pick a random answer to be the correct answer.
        const answerSlots = ["A","B","C","D"];
        const songAnswerPositionIndex = Math.floor(Math.random() * answerSlots.length);
        const songAnswerPosition = answerSlots[songAnswerPositionIndex];

        // Assign song info to the answer position.
        obj.answers[songAnswerPosition] = {
            songId: chosenSong.id,
            songName: chosenSong.name,
            artistName: chosenSong.artists[0].name,
            isrc: chosenSong.external_ids?.isrc,
            album: {
                name: chosenSong.album?.name,
                cover: chosenSong.album?.images[0]
            }
        };
        obj.chosenSong.answer = songAnswerPosition;

        // Remove the slot from the available slots so then it won't be refilled.
        answerSlots.splice(songAnswerPositionIndex, 1);

        // Delete correct answer song from available songs so it cannot be one of the other answers.
        availableSongs.splice(chosenSongIndex, 1);


        // Assign random songs to the remaining slots.
        for (const slot of answerSlots) {
            let randomSongIndex = Math.floor(Math.random() * availableSongs.length);
            let randomSong = availableSongs[randomSongIndex];

            obj.answers[slot] = {
                songId: randomSong.id,
                songName: randomSong.name,
                artistName: randomSong.artists[0].name,
                isrc: randomSong.external_ids?.isrc,
                album: {
                    name: randomSong.album?.name,
                    cover: randomSong.album?.images[0]
                }
            };

            // Once again, delete the chosen song so it cannot be chosen again.
            availableSongs.splice(randomSongIndex, 1);
        }

        return obj;
    }

    /**
     * Registers a player's answer to the current question.
     * @param { string } id - The player's id.
     * @param { string } answer - The selected answer.
     * @returns { boolean } Was the answer successfully registered?
     */
    registerPlayerAnswer = (id, answer) => {
        // Do not add an answer if the player has already chosen one for the question.
        if (this.state.currentQuestion.playerAnswers.find(player => player.id === id)) return false;

        this.state.currentQuestion.playerAnswers.push({"id": id, "answer": answer});

        // Add player answe to list of answered questions object, with the key as the id.
        this.playerAnswers[this.askedQuestions] = (this.playerAnswers[this.askedQuestions] || {});
        this.playerAnswers[this.askedQuestions][id] = answer;

        return true;
    }

    /**
     * Gives score to the player that answered correctly.
     * @param { string } id - Player id that answered.
     */
    awardCorrectAnswer = (id) => {
        // Set the user score as it's existing value or 0, then add 1.
        this.scores[id] = (this.scores[id] || 0);
        this.scores[id] += 1;
    }
}

module.exports = GameServer;