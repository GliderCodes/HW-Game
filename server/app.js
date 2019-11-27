// Loading necessary modules with Node.js
const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const morgan = require('morgan');
const cons = require('consolidate');
const pageRouter = require('./router/pages')
const RedisStore = require("connect-redis")(session);



// Constant variables important for assignments
const config = require('./config.json');
const client = path.resolve("../client")
const port = config.port;
const debug = config.debug;

// Mongoose database configuration
const mongoose = require("mongoose");
const Player = require('./core/playerSchema')

// Mongoose database connection
mongoose.connect('mongodb://localhost/my_database', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

// Setting morgan to load information about the requests for development/configuration uses.
app.use(morgan('dev'));

// Initialize bodyParser to parse the incoming parameter requests to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Initialize cookieParser to allow us to access the cookies stored in the browser.
app.use(cookieParser());
app.use(express.static(path.resolve(client)));

var sessionMiddleware =
    session({
        secret: 'user_sid',
        resave: true,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 10 * 60 * 1000
        }
    })
io.use(function (socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

// Using session
app.use(sessionMiddleware)

// Setting the express static and files for client
app.engine('html', cons.swig)
app.set('views', path.resolve("../client/views"))
app.set('view engine', 'html');

// Using routers 
app.use('/', pageRouter)

// Errors => page not found 404
app.use((req, res, next) => {
    var err = new Error('Page not found');
    err.status = 404;
    next(err);
})

// Handling errors (send them to the client)
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send(err.message);
});


// server events and listening
server.on("error", (err) => {
    console.log('Server Error: ' + err);
});

// listening to the port
server.listen(port, () => {
    console.log(`Listening at port ${port}...`);
});

function valueExists(jsObj, value, cb){
    for (var key in jsObj){
        if (jsObj[key].username == value) 
        return cb(key, true);
    }
    return cb(key, false);
}
// socket connection for players/clients
var players = {};
io.on('connection', function (socket) {
    
    var playerdb = socket.request.session.user
    // console.log(players)
    if (playerdb)
    valueExists(players, playerdb.username, function(key, exists) {
        if (exists) {
            // console.log(players[key])
            delete players[key] 
            players[socket.id] = {
                username: playerdb.username,
                x: playerdb.x,
                y: playerdb.y,
                score: 0
            };

        } else {
            players[socket.id] = {
                username: playerdb.username,
                x: playerdb.x,
                y: playerdb.y,
                score:0
            };
        }
    })
    console.log(players)

    // Socket listener for when players disconnect
    socket.on('disconnect', function () {
        // console.log("Disconnected")
        if (players[socket.id] && players[socket.id].x != undefined && players[socket.id].y != undefined) {
            Player.findOneAndUpdate({_id: playerdb._id}, {x:players[socket.id].x, y:players[socket.id].y})
        }
        delete players[socket.id];
    });

    // Socket listener for when players move
    socket.on('movement', function (data) {
        var player = players[socket.id];
        if (data.left) {
            player.x -= 5;
        }
        if (data.up) {
            player.y -= 5;
        }
        if (data.right) {
            player.x += 5;
        }
        if (data.down) {
            player.y += 5;
        }
    });
    socket.on('storeOldScore', function(oldScore) {
        // console.log("Storing Score: "+oldScore)
        if (players[socket])
            players[socket.id].score = oldScore
    })
    socket.on('onDeath', function(param) {
        // console.log(socket)
        // console.log(players[socket.id])
        Player.find({}, null, {sort: {score: -1}}, function(err, result) {
            if (!err)
            socket.emit('leaderboardUpdate', result)
        })
        if (players[socket.id] != undefined)
        var playerUsername = players[socket.id].username
        
        Player.findOne({username:playerUsername}, function(err, player) {
            if (player && player.score < param) {
                socket.send(param)
                Player.findOneAndUpdate({username: playerUsername}, {score: param}, (err) => {
                    console.log(err)
                })
        }else {
            socket.send(player.score)
        }})
        
    })
});
setInterval(function () {
    io.sockets.emit('state', players);
    
}, 1000 / 60);
