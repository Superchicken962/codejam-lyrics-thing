const useVoiceButton = document.querySelector("a.use_voice");
useVoiceButton.addEventListener("click", () => {
    alert("no");
});

async function searchLyrics() {
    let results;

    const search = await fetch("/search/lyrics", {"method": "POST"});

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

}

const searchBtn = document.querySelector(".search_button");
searchBtn.addEventListener("click", searchLyrics);