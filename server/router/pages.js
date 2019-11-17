const express = require('express');
const User = require('../core/user');
const session = require('express-session');
const router = express.Router();
const io = require('socket.io');


// new user
const user = new User()
// Get the index page
router.get('/', (req, res, next) => {
    let user = req.session.user;
    // If there is a session named user that means the use is logged in. so we redirect him to home page by using /home route below
    if (user) {
        console.log(req.session.sid + " is logged in")
        res.render('index', {
            opp: req.session.opp,
            id: req.session.userid,
            name: user.username
        });
        return;
    }
    // if not we just send the login page.
    res.render('login')
})

// Get home page
router.get('/index', (req, res, next) => {
    let user = req.session.user;

    if (user) {
        // document.getElementById('user-panel').style.display = "none";
        res.render('index', {
            opp: req.session.opp,
            id: req.session.userid,
            name: user.username
        });
        return;
    }
    res.redirect('/');
});

// Get login page
router.get('/login', (req, res, next) => {
    let user = req.session.user;

    if (user) {
        // document.getElementById('user-panel').style.display = "none";
        res.render('index', {
            opp: req.session.opp,
            id: req.session.userid,
            name: user.username
        });
        return;
    }
    res.render('login');
});

// Post login data
router.post('/login', (req, res, next) => {
    // The data sent from the user are stored in the req.body object.
    // call our login function and it will return the result(the user data).
    user.login(req.body.username, req.body.password, function (result) {
        if (result) {
            // Store the user data in a session.
            var session = req.session;
            session.user = result;
            session.sid = req.cookies['connect.sid']
            session.opp = 1;
            // redirect the user to the home page.
            res.redirect('/');
        } else {
            // if the login function returns null send this error message back to the user.
            res.send('Username/Password incorrect!');
        }
    })

});

// Post register data
router.post('/register', (req, res, next) => {
    // prepare an object containing all user inputs.
    let userInput = {
        username: req.body.username,
        password: req.body.password
    };
    // call create function. to create a new user. if there is no error this function will return it's id.
    user.create(userInput, function (lastId) {
        // if the creation of the user goes well we should get an integer (id of the inserted user)
        if (lastId) {
            // Get the user data by it's id. and store it in a session.
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