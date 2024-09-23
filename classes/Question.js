// Simply a type definition - really just used for intellisense.

class Question {
    /**
     * Question for the lyrics quiz.
     * @param { number } num - Question number.
     * @param { Object } answers - Object of answers.
     * @param { string } answers.A - Answer A.
     * @param { string } answers.B - Answer B.
     * @param { string } answers.C - Answer C.
     * @param { string } answers.D - Answer D.
     * @param { Object } chosenSong - The answer for this question.
     * @param { number } expiresAt - Timestamp - when the question ends.
     */
    constructor(num, answers, chosenSong, expiresAt) {
        this.num = num;
        this.answers = answers;
        this.chosenSong = chosenSong;
        this.expiresAt = expiresAt;
    }
}

module.exports = Question;