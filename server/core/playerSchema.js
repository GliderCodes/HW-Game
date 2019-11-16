const mongoose = require("mongoose");

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

module.exports = mongoose.model('Player', playerSchema);