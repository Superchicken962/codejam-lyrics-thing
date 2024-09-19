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
    const getServer = await fetch(`/play/get/server/${id}`, {"method": "GET"});
    const server = await getServer.json();

    viewServerInfo.querySelector(".server_info").innerHTML = `
        <h2>${server.name}</h2>
        <p>
            ${server.players.length} of ${server.maxPlayers} players<br>
            <a class="join_server">Join</a>
        </p>
    `;
    
    // Use 'onclick' to override existing listeners because this may be run a few times.
    viewServerInfo.querySelector(".menu_button").onclick = () => {
        updateServers();
    };

    viewServerInfo.style.display = "block";
    viewServers.style.display = "none";
}