// Create a mongoose module 
const mongoose = require("mongoose");

//Creating a player scheme object storing all database objects
const playerSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: String,
    password: String,
    x: Number,
    y: Number,
    health: Number,
    score: Number,
    kills: Number
})

// Calling exports function with the player object and id as arguments.
module.exports = mongoose.model('Player', playerSchema);