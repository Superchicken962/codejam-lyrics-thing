const useVoiceButton = document.querySelector("a.use_voice");
useVoiceButton.addEventListener("click", () => {
    alert("no");
});

async function searchLyrics() {
    let results;

    // Set the content type so it can be read in the backend.
    const headers = {"Content-type": "application/json"};
    const body = {
        "lyrics": document.querySelector("textarea.lyrics_input")?.value || "0"
    };

    const search = await fetch("/search/lyrics", {"method": "POST", "headers": headers, "body": JSON.stringify(body)});

    if (!search.ok) {
        new ErrorBox("Error Searching!", "There was an error searching for your song!", 500, search.statusText);
        return;
    }

    try {
        results = await search.json();        
    } catch (error) {
        new ErrorBox("Error Reading Data!", "There was an error reading the response data!", 503, error.name);
        return;
    }

    console.log(results);
}

const searchBtn = document.querySelector(".search_button");
searchBtn.addEventListener("click", searchLyrics);