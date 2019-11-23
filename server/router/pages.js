// Loading necessary modules with Node.js
const express = require('express');
const User = require('../core/user');
const session = require('express-session');
const router = express.Router();
const io = require('socket.io');


// Creating a new user object
const user = new User()

// Get the index page
router.get('/', (req, res, next) => {

    let user = req.session.user;

    // If there is a session named user that means the user is logged in. So we redirect him to the home page by using /home route below
    if (user) {
<<<<<<< HEAD
        // console.log(req.session)
=======

>>>>>>> 5727ca08eed9f40b657c856e1d75a80418b611f7
        console.log(req.session.sid + " is logged in")
        res.render('index', {
            opp: req.session.opp,
            id: {
                session: req.session.userid,
                db: req.session.user._id
            },
            name: user.username
        });
        return;
    }

    // if not we just send the login page.
    res.render('login')
})

// Getting home page
router.get('/index', (req, res, next) => {
    let user = req.session.user;

    if (user) {
        res.render('index', {
            opp: req.session.opp,
            id: {
                session: req.session.userid,
                db: req.session.user._id
            },
            name: user.username
        });
        return;
    }
    res.redirect('/');
});

// Getting login page
router.get('/login', (req, res, next) => {
    let user = req.session.user;

    if (user) {
        res.render('index', {
            opp: req.session.opp,
            id: {
                session: req.session.userid,
                db: req.session.user._id
            },
            name: user.username
        });
        return;
    }
    res.render('login');
});


// Post login data
router.post('/login', (req, res, next) => {

    // The data sent from the user are stored in the req.body object.
    // Call our login function and it will return the result(the user data).
    user.login(req.body.username, req.body.password, function (result) {
        if (result) {

            // Store the user data in a session.
            var session = req.session;
            session.user = result;
            session.sid = req.cookies['connect.sid']
            session.opp = 1;

            // Redirect the user to the home page.
            res.redirect('/');
        } else {

            // If the login function returns null, send this error message back to the user.
            res.send('Username/Password incorrect!');
        }
    })

});

// Post register data
router.post('/register', (req, res, next) => {

    // Create an object containing all user inputs.
    let userInput = {
        username: req.body.username,
        password: req.body.password
    };

    // Call a create function to create a new user. If there is no error, this function will return user's id.
    user.create(userInput, function (lastId) {

        // If the creation of the user goes well, we should get an integer (id of the inserted user)
        if (lastId) {

            // Get the user data by it's id and store it in a session.
            user.find(lastId, true, function (result) {
                req.session.user = result;
                req.session.valid = 0;
                res.render('index', req.session);
            });

        } else {
            console.log('Error creating a new user ...');
        }
    });

});

module.exports = router;