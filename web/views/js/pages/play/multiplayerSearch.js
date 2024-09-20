const viewServers = document.querySelector(".viewServers");
const viewServerInfo = document.querySelector(".viewServerInfo");

async function updateServers() {
    const serverList = document.querySelector(".multiplayer_servers");
    serverList.innerHTML = "";

    viewServerInfo.style.display = "none";
    viewServers.style.display = "block";

    const getServers = await fetch("/play/get/servers", {"method": "GET"});

    if (!getServers.ok) {
        serverList.innerHTML = "Error fetching servers!";
        return;
    }

    const servers = await getServers.json();

    if (servers.length === 0) {
        serverList.innerHTML = "No servers found! Try creating your own!";
        return;
    }

    for (const server of servers) {
        let serverElement = document.createElement("a");
        serverElement.className = "server";
        serverElement.id = server.code;

        serverElement.innerHTML = `
            <p>
                <b>${server.name} - ${server.players.length}/${server.maxPlayers}</b><br>
                ${server.description}
            </p>
        `;

        serverElement.addEventListener("click", () => {
            viewServer(server.code);
        });
        serverList.appendChild(serverElement);
    }
}
updateServers();

async function viewServer(id) {
    // TODO: Add error message for get server if it fails? 
    const getServer = await fetch(`/play/get/server/${id}`, {"method": "GET"});
    const server = await getServer.json();

    const isInServer = server.players.find(player => player.id === CURRENT_USER_ID);

    const serverInfo = viewServerInfo.querySelector(".server_info");
    serverInfo.innerHTML = `
        <h2>${server.name}</h2>
        <p>
            ${server.players.length} of ${server.maxPlayers} players<br>
            ${(!isInServer) ? `<a class="join_server">Join</a>` : `<a class="goto_server">Goto</a>`}
        </p>
    `;
    
    // Use 'onclick' to override existing listeners because this may be run a few times.
    viewServerInfo.querySelector(".menu_button").onclick = () => {
        updateServers();
    };

    // Since the join button is only shown if we have not joined, we need to check before setting a click listener.
    const joinBtn = serverInfo.querySelector(".join_server");
    if (joinBtn) joinBtn.onclick = () => {
        joinServer(id);
    };

    viewServerInfo.style.display = "block";
    viewServers.style.display = "none";
}

async function joinServer(id) {
    const joinRequest = await fetch(`/play/multiplayer/join/${id}`, {"method": "POST"});
    const joinResponse = await joinRequest.json();

    if (!joinRequest.ok) {
        new ErrorBox(joinResponse.name, joinResponse.message, joinResponse.code, null, 8000);
        return;
    }
}