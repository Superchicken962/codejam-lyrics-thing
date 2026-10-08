class AudioManager {
    #audio;
    
    constructor() {
        this.#audio = document.createElement("audio");
    }

    #firstInteractionListener = null;

    /**
     * Play audio. If it fails due to user not interacting with page it will replay once they do.
     */
    async play() {
        try {
            await this.#audio.play();
        } catch (error) {
            // Only handling the 'NotAllowedError' error - rethrow if it is a different error.
            if (!error.toString().includes("NotAllowedError")) {
                throw new Error(error);
            }

            // Do not set another listener if it already is set.
            if (this.#firstInteractionListener) return;
            
            // If play fails (user has not interacted with document yet), add listener that plays one they have.
            console.log("Playing blocked - waiting until user interacts with page to start playing.");

            this.#firstInteractionListener = document.addEventListener("click", () => {
                console.log("Playing audio since user has interacted with page.");
                this.play();
            }, { once: true });
        }
    }

    /**
     * Pause audio playback.
     */
    pause() {
        // If audio is paused, then remove the listener that will play it again if the user interacts.
        if (this.#firstInteractionListener) {
            document.removeEventListener("click", this.#firstInteractionListener);
            this.#firstInteractionListener = null;
        }

        this.#audio.pause();
    }

    /**
     * Load audio from url.
     * 
     * @param { String } url
     */
    load(url) {
        this.#audio.src = url;
        this.#audio.load();
    }
}