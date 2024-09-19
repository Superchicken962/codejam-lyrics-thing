// ----------------------------------------------------
// Main file for handling processes.
// ----------------------------------------------------

const { exec, ChildProcess } = require("child_process");

class FriendlyProcess {
    /**
     * 
     * @param { string } name 
     * @param { ChildProcess } process 
     */
    constructor(name, process) {
        this.name = name;
        this.process = process;
    }

    init = () => {
        // Display any normal logs from the process to main.
        this.process.stdout.on("data", (data) => {
            console.log(`[${this.name}] ${data}`);
        });
        
        // Display any errors from the process to main.
        this.process.stderr.on("data", (data) => {
            console.log(`\x1b[31m [${this.name}] ${data}`);
        });
        
        // Display an exit message to main to show that the process has stopped.
        this.process.on("exit", (code) => {

        });
    }
}

const webProcess = new FriendlyProcess("Web", exec("node web.js"));
webProcess.init();

const socketServer = new FriendlyProcess("Socket", exec("node socket/socket.js"));
socketServer.init();