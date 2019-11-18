// necessary files...
const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const cons = require('consolidate');
const pageRouter = require('./router/pages')



// const variables important for assignments
const config = require('./config.json');
const client = path.resolve("../client")
const port = config.port;
const debug = config.debug;
var USER_LIST = {}

// mongoose configuration
const Player = require("./core/playerSchema");
const mongoose = require("mongoose");

// DB connection
mongoose.connect('mongodb://localhost/my_database', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

// set morgan to log info about our requests for development use.
app.use(morgan('dev'));

// initialize body-parser to parse incoming parameters requests to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// initialize cookie-parser to allow us access the cookies stored in the browser. 
app.use(cookieParser());
app.use(express.static(path.resolve(client)));

// session
app.use(session({
    secret: 'user_sid',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 10 * 60 * 1000
    }
}))

// setting the express static and files for client
app.engine('html', cons.swig)
app.set('views', path.resolve("../client/views"))
app.set('view engine', 'html');

// routers 
app.use('/', pageRouter)

// // Errors => page not found 404
// app.use((req, res, next) =>  {
//     var err = new Error('Page not found');
//     err.status = 404;
//     next(err);
// })

// // Handling errors (send them to the client)
// app.use((err, req, res, next) => {
//     res.status(err.status || 500);
//     res.send(err.message);
// });

// Setting up the server
// app.listen(3001, () => {
//     console.log('Server is running on port 3000...');
// });

// server events and listening
server.on("error", (err) => {
    console.log('Server Error: ' + err);
});

// listening to the port
server.listen(port, () => {
    console.log(`Listening at port ${port}...`);
});


// socket connection for players/clients
io.on("connection", function (socket) {

    // For signing in
    socket.on('signIn', function (username, password) {

        Player.findOne({
            name: username
        }, async function (err, player) {
            let hashedPassword = await bcrypt.compare(password, player.password);
            if (err) {
                socket.emit("loginResponse", {
                    success: false,
                    login: true,
                    signup: false
                }, err)
            } else if (!player) {
                socket.emit("loginResponse", {
                    success: false,
                    login: true,
                    signup: false
                }, "Username doesn't exist in database")
            } else if (hashedPassword) {
                socket.emit("loginResponse", {
                    success: true,
                    login: true,
                    signup: false
                }, `Welcome back ${username}`)
            } else {
                socket.emit("loginResponse", {
                    success: false,
                    login: true,
                    signup: false
                }, "Password is incorrect")
            }
        })
    })

    // For signing up
    socket.on('signUp', async (username, password) => {
        Player.findOne({
            name: username
        }, async function (err, player) {
            if (err) {
                console.log(err)
                console.log("SignUp unsuccessful.")
            } else if (!player) {
                try {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    const player = new Player({
                        _id: new mongoose.Types.ObjectId(),
                        name: username,
                        password: hashedPassword,
                        x: 10,
                        y: 20,
                        health: 100,
                        score: 0,
                        kills: 1
                    });
                    player.save().then(result => {
                        socket.emit('signUp')
                        console.log(result)
                    }).catch(err => console.log(err));
                } catch (err) {
                    console.log(err)
                }
            } else {
                console.log(player)
                console.log("Username already exists.");
            }
        })
    })


    socket.on('message', function () {
        console.log(socket.id)
    })
})