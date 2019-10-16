// necessary files...
const express = require('express')
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');

const config = require('./config.json');
const client = path.resolve("../client")

// setting the express static and files for client
app.use(express.static(client));
app.get('/', function (req, res) {
    res.sendFile(client + "/index.html");
});
app.use('/client', express.static(client));

// server events and listening
server.on("error", (err) => {
    console.log('Server Error: ' + err);
});
server.listen(3000, () => {
    console.log("Listening at port 3000...");
});

debug = config.debug;
console.log(Math.floor(Math.random() * 100000));

// socket connection for players/clients
io.on("connection", function (socket) {
    console.log("Client connected.")

    socket.on("message", function () {
        console.log("Hello there");
    })
})