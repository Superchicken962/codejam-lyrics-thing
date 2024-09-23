const createServerForm = document.querySelector(".new_server_form");
const chooseSpotifyBtn = document.querySelector(".chooseSpotifyBtn");

const spotifyFormValues = {
    playlistUrl: null
};

let serverCreating = false;

// Prevent form from submitting itself, as we will do the post request ourselves - we just use a form so it provides a default layer of input validation to the form.
createServerForm.addEventListener("submit", async function(ev) {
    ev.preventDefault();

    if (serverCreating) return;

    const formBtn = createServerForm.querySelector(".create_server_btn")
    formBtn.value = "...";
    serverCreating = true;

    const serverName = createServerForm.querySelector("#server_name")?.value;
    const serverDesc = createServerForm.querySelector("#server_description")?.value;
    const maxPlayers = createServerForm.querySelector("#max_players")?.value;

    // Input validation - because form can be edited.
    const noValue = (!serverName || !serverDesc || !maxPlayers);
    const outOfRange = (serverName.length > 75 || serverDesc.length > 120 || !(maxPlayers >= 2 && maxPlayers <= 8))

    if (noValue || outOfRange) {
        new ErrorBox("Invalid Values!", "You must have values for each field, and keep the values in range!", 400, null, 8000, false, true);
        formBtn.value = "Create";
        serverCreating = false;
        return;
    }

    if (!spotifyFormValues.playlistUrl) {
        new ErrorBox("No playlist selected!", "Please select a Spotify playlist, or enter a url.", 400);
        formBtn.value = "Create";
        serverCreating = false;
        return;
    }

    // Make the POST request since there were no errors.
    const headers = {"Content-type": "application/json"};
    const body = {
        "name": serverName,
        "description": serverDesc,
        "maxPlayers": maxPlayers,
        "playlistUrl": spotifyFormValues.playlistUrl
    };

    const requestCreation = await fetch("/play/multiplayer/new", {"method": "POST", headers, body: JSON.stringify(body)});
    const responseData = await requestCreation.json();

    // Display error if the fetch did not respond with a status of 200.
    if (!requestCreation.ok) {
        const errorMsg = responseData.message || "We were unable to create your server, please try again later!";
        new ErrorBox("Error Creating Server!", errorMsg, requestCreation.status, null, 8000, false, true);
        formBtn.value = "Create";
        serverCreating = false;
        return;
    }

    // TODO: Send player to lobby page.
    window.location = "/play/multiplayer";
});

chooseSpotifyBtn.addEventListener("click", async() => {
    document.querySelector(".spotifyPrompt")?.remove();

    const spotifyPlaylistPrompt = document.createElement("div");
    spotifyPlaylistPrompt.className = "spotifyPrompt";

    // TODO: Add functionality to show user playlists in prompt.
    // const getPlaylists = await fetch();

    spotifyPlaylistPrompt.innerHTML = `
        <h2>Choose a Spotify Playlist</h2>

        <div class="playlist_list"></div>

        <p>
            Or, enter a playlist URL here:
            <input class="manualPlaylistUrl"/>
        </p>

        <a class="select_playlist">Select</a>
    `;

    spotifyPlaylistPrompt.querySelector(".select_playlist").addEventListener("click", () => {
        const playlistUrl = spotifyPlaylistPrompt.querySelector(".manualPlaylistUrl")?.value;
        if (playlistUrl) spotifyFormValues.playlistUrl = playlistUrl;

        spotifyPlaylistPrompt.remove();
    });

    document.body.appendChild(spotifyPlaylistPrompt);
});