class AudioManager {
    #audio;
    
    constructor() {
        this.#audio = document.createElement("audio");
        this.#audio.volume = 0.1;
    }

    #firstInteractionController = new AbortController();
    #firstInteractionListenerSet = false;

    /**
     * Play audio. If it fails due to user not interacting with page it will replay once they do.
     */
    async play(onplay) {
        this.#audio.addEventListener("playing", onplay, { once: true });

        try {
            await this.#audio.play();
        } catch (error) {
            // Only handling the 'NotAllowedError' error - rethrow if it is a different error.
            if (!error.toString().includes("NotAllowedError")) {
                throw new Error(error);
            }

            // Do not set another listener if it already is set (user has interacted with page).
            if (this.#firstInteractionListenerSet) return;
            
            // If play fails (user has not interacted with document yet), add listener that plays one they have.
            console.log("Playing blocked - waiting until user interacts with page to start playing.");
            this.#firstInteractionListenerSet = true;

            document.addEventListener("click", () => {
                console.log("Playing audio since user has interacted with page.");
                this.play();
            }, { once: true, signal: this.#firstInteractionController.signal });
        }
    }

    /**
     * Pause audio playback.
     */
    pause() {
        // If audio is paused, then remove the listener that will play it again if the user interacts.
        if (this.#firstInteractionListenerSet) {
            this.#firstInteractionController.abort();
            this.#firstInteractionListenerSet = false;
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

    /**
     * @returns { Boolean }
     */
    isPlaying() {
        return this.#audio.currentTime > 0 && !this.#audio.paused && !this.#audio.ended && this.#audio.readyState > 2;
    }

    /**
     * Stops and clears the audio source.
     */
    reset() {
        this.#audio.pause();
        this.#audio.currentTime = 0;
        this.#audio.src = "";
    }
}