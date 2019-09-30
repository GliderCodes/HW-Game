const express = require('express')
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);  

app.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

http.listen(3000);
console.log("Connected")



