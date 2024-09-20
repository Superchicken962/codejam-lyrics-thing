const createServerForm = document.querySelector(".new_server_form");

// Prevent form from submitting itself, as we will do the post request ourselves - we just use a form so it provides a default layer of input validation to the form.
createServerForm.addEventListener("submit", async function(ev) {
    ev.preventDefault();

    const serverName = createServerForm.querySelector("#server_name")?.value;
    const serverDesc = createServerForm.querySelector("#server_description")?.value;
    const maxPlayers = createServerForm.querySelector("#max_players")?.value;

    // Input validation - because form can be edited.
    const noValue = (!serverName || !serverDesc || !maxPlayers);
    const outOfRange = (serverName.length > 75 || serverDesc.length > 120 || !(maxPlayers >= 2 && maxPlayers <= 8))

    if (noValue || outOfRange) {
        new ErrorBox("Invalid Values!", "You must have values for each field, and keep the values in range!", 400, null, 8000, false, true);
        return;
    }

    // Make the POST request since there were no errors.
    const headers = {"Content-type": "application/json"};
    const body = {
        "name": serverName,
        "description": serverDesc,
        "maxPlayers": maxPlayers
    };

    const requestCreation = await fetch("/play/multiplayer/new", {"method": "POST", headers, body: JSON.stringify(body)});
    const responseData = await requestCreation.json();

    // Display error if the fetch did not respond with a status of 200.
    if (!requestCreation.ok) {
        const errorMsg = responseData.message || "We were unable to create your server, please try again later!";
        new ErrorBox("Error Creating Server!", errorMsg, requestCreation.status, null, 8000, false, true);
        return;
    }

    // TODO: Send player to lobby page.
    window.location = "/play/multiplayer";
});