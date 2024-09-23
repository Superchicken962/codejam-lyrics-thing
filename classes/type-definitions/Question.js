// Simply a type definition - really just used for intellisense.

class Question {
    /**
     * Question for the lyrics quiz.
     * @param { string } id - Id to uniquely identify the question.
     * @param { number } num - Question number.
     * @param { Object } answers - Object of answers.
     * @param { string } answers.A - Answer A.
     * @param { string } answers.B - Answer B.
     * @param { string } answers.C - Answer C.
     * @param { string } answers.D - Answer D.
     * @param { Object } chosenSong - Chosen song.
     * @param { string } chosenSong.answer - The answer that is correct.
     * @param { string } chosenSong.lyrics - The lyrics to show.
     * @param { number } expiresAt - Timestamp - when the question ends.
     * @param { number } expiryTime - Time (in miliseconds) that the question will have until it expires (ie. 60000).
     * @param { Object[] } playerAnswers - List of players with their selected answer.
     * @param { string } playerAnswers.id - Player id.
     * @param { string } playerAnswers.answer - Player's selected answer.
     */
    constructor(id, num, answers, chosenSong, expiresAt, expiryTime, playerAnswers) {
        this.id = id;
        this.num = num;
        this.answers = answers;
        this.chosenSong = chosenSong;
        this.expiresAt = expiresAt;
        this.expiryTime = expiryTime;
        this.playerAnswers = playerAnswers;
    }
}

module.exports = Question;