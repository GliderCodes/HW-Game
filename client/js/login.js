const mongoose = require("mongoose");
const Player = require("../../server/core/playerSchema");

function validate() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    Player.findOne({
        name: username,
        password: password
    }, function (err, player) {
        if (err) {
            alert("Login unsuccessful.")
        } else if (!player) {
            alert("Login unsuccessful.")
        } else {
            alert("Login successfull");
            window.location = "main.html"; // Redirecting to other page.
            return false;
        }
    })
}

function signUp() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    Player.findOne({
        name: username
    }, function (err, player) {
        if (err) {
            alert("SignUp unsuccessful.")
        } else if (!player) {
            const player = new Player({
                _id: new mongoose.Types.ObjectId(),
                name: username,
                password: password,
                x: 10,
                y: 20,
                health: 100,
                score: 0,
                kills: 1
            });
            player.save().then(result => {
                console.log(result)
            }).catch(err => console.log(err));
        } else {
            console.log("Hello" + player)
            alert("Username already exists.");
        }
    })
    const player = new Player({
        _id: new mongoose.Types.ObjectId(),
        name: "lawdawdal",
        password: "NBawdadadRdwawdadHH",
        x: 10,
        y: 20,
        health: 100,
        score: 1000,
        kills: 1
    });
    player.save().then(result => {
        console.log(result)
    }).catch(err => console.log(err));

}