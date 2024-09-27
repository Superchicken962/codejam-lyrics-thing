const { Namespace } = require("socket.io");
const { serverManager } = require("./data");
const GameServer = require("../classes/GameServer");
const musixmatch = require("../web/apis/musixmatch");

/**
 * @param { Namespace } io 
 */
module.exports = function(io) {
    io.on("connection", (socket) => {
        socket.on("askSocket", async(data) => {
            function reply(reply_data = {}) {
                if (!reply_data.id) reply_data.id = data.id;
                socket.emit("askSocket:response", reply_data);
            }

            switch(data.message) {
                case "server.relayState":
                    if (!data.server?.code) {
                        reply({"status": 400});
                        return;
                    }

                    socket.to(`server#${data.server.code}`).emit("server.state", {state: data.state});
                    reply({"status": 200});
                    break;

                case "server.join":
                    if (!data.server?.code) {
                        reply({"status": 400});
                        return;
                    }

                    // Join the socket to the server's socket room.
                    socket.join(`server#${data.server.code}`);

                    reply({
                        "status": 200,
                    });
                    break;

                case "quiz.question.answer":
                    if (!data.server || !data.user || !data.answer) {
                        reply({"status": 400});
                        return;
                    }

                    let server = serverManager.findServerByCode(data.server);
                    if (!server) {
                        reply({"status": 404});
                        return;
                    }

                    let registerSuccess = server.registerPlayerAnswer(data.user, data.answer);

                    if (!registerSuccess) {
                        reply({"status": 500});
                        return;
                    }

                    reply({"status": 200});
                    break;

                case "song.get.randomLyrics":
                    if (!data.isrc) {
                        reply({"status": 400});
                        return;
                    }

                    const lyricsData = await musixmatch.GET("track.lyrics.get", [
                        {"name": "track_isrc", "value": data.isrc}
                    ]);

                    // Split into lines, and remove empty lines and ones with just "...".
                    let lyrics = lyricsData.message?.body?.lyrics?.lyrics_body?.split("\n");
                    lyrics = lyrics.filter(line => line !== "" && line !== "...");

                    // Remove the last two results. (Musixmatch copyright stuff).
                    lyrics.pop();
                    lyrics.pop();

                    const randomLineIndex = Math.floor(Math.random() * lyrics.length);
                    randomLyrics = lyrics[randomLineIndex];

                    reply({"status": 200, "lyrics": randomLyrics, "copyrightNote": lyricsData.message?.body?.lyrics?.lyrics_copyright, "scriptTracking": lyricsData.message?.body?.lyrics?.script_tracking_url, "pixelTracking": lyricsData.message?.body?.lyrics?.pixel_tracking_url});
                    break;
            }
        });
    });
};