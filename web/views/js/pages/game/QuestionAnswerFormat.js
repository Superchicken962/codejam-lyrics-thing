/**
 * @typedef { Object } Answer
 * @property { String } songName
 * @property { String } artistName
 */

class QuestionAnswerFormat {
    /**
     * @param { any } answers 
     * @param { (answer: string) => void } submitAnswer
     */
    showAnswers(answers, submitAnswer) {
        return;
    }
}

class MultipleChoiceQuestion extends QuestionAnswerFormat {
    #element;

    constructor(container) {
        super();
        this.#element = container;
    }

    /**
     * @param { Record<"A"|"B"|"C"|"D", Answer> } answers 
     * @param { (answer: string) => void } submitAnswer
     */
    showAnswers(answers, submitAnswer) {
        this.#element.innerHTML = `
            <a class="question" id="A">
                <span class="song_name">${answers["A"].songName}</span><br>
                <span class="song_artist">${answers["A"].artistName}</span>
            </a>
            <a class="question" id="B">
                <span class="song_name">${answers["B"].songName}</span><br>
                <span class="song_artist">${answers["B"].artistName}</span>
            </a>

            <br>

            <a class="question" id="C">
                <span class="song_name">${answers["C"].songName}</span><br>
                <span class="song_artist">${answers["C"].artistName}</span>
            </a>
            <a class="question" id="D">
                <span class="song_name">${answers["D"].songName}</span><br>
                <span class="song_artist">${answers["D"].artistName}</span>
            </a>
        `;

        for (const questionBtn of this.#element.querySelectorAll("a.question")) {
            questionBtn.addEventListener("click", function() {
                submitAnswer(this.id);
            });
        }
    }
}

class TextEntryQuestion extends QuestionAnswerFormat {
    #element;

    constructor(container) {
        super();
        this.#element = container;
    }

    /**
     * @param { Record<"A"|"B"|"C"|"D", Answer> } answers 
     * @param { (answer: string) => void } submitAnswer
     */
    showAnswers(answers, submitAnswer) {
        this.#element.innerHTML = `
            <input class="test" list="questionOptions"/>

            <datalist id="questionOptions">
                ${ALL_SONGS.map(song => `<option value="${song}"></option>`)}
            </datalist>
        `;
    }
}