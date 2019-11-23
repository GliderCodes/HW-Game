// Create a mongoose module 
const bcrypt = require('bcrypt');
const mongoose = require("mongoose");
const Player = require('./playerSchema')


function User() {};
User.prototype = {

    // Function for finding user
    find: function (user = null, idornot, callback) {
        // If the user variable is defined
        if (user) {

            // If the field is an id
            if (idornot)
                Player.findById(user, function (err, player) {
                    if (err) throw err;
                    if (!player) return callback(null);
                    // return user if found 
                    callback(player);
                })

            else {
                Player.findOne({
                    username: user
                }, function (err, player) {
                    if (err) throw err;
                    if (!player) return callback(null)

                    // return user if found 
                    callback(player);
                })
            }
        }
    },


    // Function for creating user
    create: function (body, callback) {
        var pwd = body.password

        // Encrypt password
        body.password = bcrypt.hashSync(pwd, 10);
        this.find(body.username, false, function (result) {
            if (result) callback(null);
            else {
                //Creating objects for a user
                
                const player = new Player({
                    _id: new mongoose.Types.ObjectId(),
                    username: body.username,
                    password: body.password,
                    x: 10,
                    y: 20,
                    health: 10,
                    score: 0,
                    kills: 0
                });
                player.save().then(result => {
                    callback(result._id)
                }).catch(err => console.log(err));
            }
        })

    },

    // Function for creating login
    login: function (username, password, callback) {
        // Finding the user by his username
        this.find(username, false, function (user) {

            // If there is a user with this particular username
            if (user) {
                
                // then check the password
                if (bcrypt.compareSync(password, user.password)) {

                    // and finally return that data.
                    callback(user);
                    return;
                }
            }
            // If the username/password is wrong then return null.
            callback(null);
        });
    }ad
}

module.exports = User;