const searchDiv = document.querySelector(".main");
const resultsDiv = document.querySelector(".results_box");

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

    searchDiv.classList.add("relative");
    resultsDiv.classList.add("visible");

    console.log(results);
    const resultMessage = resultsDiv.querySelector(".message");
    const resultList = resultsDiv.querySelector(".track_list");

    resultMessage.textContent = `Showing ${results.trackList.length} of ${results.totalFound} results.`;

    resultList.innerHTML = "";

    for (const track of results.trackList.map(t => t.track)) {
        let trackElement = document.createElement("div");
        trackElement.className = "track";

        trackElement.innerHTML = `
            ${track.artist_name} - ${track.track_name}
        `;

        resultList.appendChild(trackElement);
    }

}

const searchBtn = document.querySelector(".search_button");
searchBtn.addEventListener("click", searchLyrics);