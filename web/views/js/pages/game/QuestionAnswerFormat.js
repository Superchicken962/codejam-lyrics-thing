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
            <form>
                <input class="answer" list="questionOptions"/>
            </form>

            <datalist id="questionOptions"></datalist>
        `;

        const form = this.#element.querySelector("form");
        const inp = form.querySelector("input.answer");

        form.addEventListener("submit", (ev) => {
            ev.preventDefault();
            
            console.log(inp.value);
        });

        const dataList = this.#element.querySelector("#questionOptions");
        const MAX_ANSWERS_TO_SHOW = 5;

        inp.addEventListener("input", () => {
            const val = inp.value.toLowerCase();

            dataList.innerHTML = "";
            if (!val) return;

            // Search array of songs with value, and then only show n results.
            const matchingSongs = ALL_SONGS.filter(s => s.name.toLowerCase().includes(val) || s.artist.toLowerCase().includes(val)).slice(0, MAX_ANSWERS_TO_SHOW);
            for (const song of matchingSongs) {
                const opt = document.createElement("option");
                opt.setAttribute("value", song.name);
                opt.textContent = song.artist;

                dataList.appendChild(opt);
            }
        });
    }
}