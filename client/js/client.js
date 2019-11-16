// const Player = require("../../server/core/playerSchema");
// const User = require('../../server/core/user');
// var io = require('socket.io')
var sock = io();


console.log("hello")


sock.emit('message');
// const onFormSubmitted = (e) => {
//     e.preventDefault();

//     const signDiv = document.getElementById("signDiv");
//     const btnSignin = document.getElementById("btnsignIn");
//     const btnSignup = document.getElementById("btnsignUp");

//     btnSignin.onclick = function(){
// 		sock.emit('signIn',{username:username.value,password:password.value});
//     }
//     btnSignup.onclick = function() {
//         sock.emit('signUp', {username:username.value,password:password.value});
//     }


// }
// document.querySelector('#signin-form').addEventListener('submit', onFormSubmitted);

console.log(user)