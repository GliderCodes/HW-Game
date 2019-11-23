const bcrypt = require('bcrypt');
const mongoose = require("mongoose");

const Player = require('./playerSchema')

function User() {};

User.prototype = {

    find: function (user = null, idornot, callback) {

        // if the user variable is defind
        if (user) {
            // if field is an id
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

    create: function (body, callback) {
        var pwd = body.password
        // encrypt password
        body.password = bcrypt.hashSync(pwd, 10);
        this.find(body.username, false, function (result) {
            if (result) callback(null);
            else {
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
        // Player.findOne({
        //     username: body.username
        // }, function (err, player) {
        //     if (err) throw err;
        //     if (player) throw "username already exists";
        //     if (!player) {
        //         const player = new Player({
        //             _id: new mongoose.Types.ObjectId(),
        //             username: body.username,
        //             password: body.password,
        //             x: 10,
        //             y: 20,
        //             health: 10,
        //             score: 0,
        //             kills: 0
        //         });
        //         player.save().then(result => {
        //             callback(result._id)
        //         }).catch(err => console.log(err));
        //     }
        // })
    },

    login: function (username, password, callback) {
        // find the user data by his username.
        this.find(username, false, function (user) {
            // if there is a user by this username.
            if (user) {
                // now we check his password.
                if (bcrypt.compareSync(password, user.password)) {
                    // return his data.
                    callback(user);
                    return;
                }
            }
            // if the username/password is wrong then return null.
            callback(null);
        });
    }
}

module.exports = User;