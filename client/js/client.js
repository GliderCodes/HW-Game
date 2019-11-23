// socket connect established
var socket = io();

// ------- keys for movements -------
var playerMovement = {
    up: false,
    down: false,
    left: false,
    right: false
}

// when key is pressed
document.addEventListener('keydown', function (event) {
    switch (event.keyCode) {
        case 65: // A
        playerMovement.left = true;
            break;
        case 87: // W
        playerMovement.up = true;
            break;
        case 68: // D
        playerMovement.right = true;
            break;
        case 83: // S
        playerMovement.down = true;
            break;
    }
});
// when key is not pressed
document.addEventListener('keyup', function (event) {
    switch (event.keyCode) {
        case 65: // A
        playerMovement.left = false;
            break;
        case 87: // W
        playerMovement.up = false;
            break;
        case 68: // D
        playerMovement.right = false;
            break;
        case 83: // S
        playerMovement.down = false;
            break;
    }
});

// imgs for each stuff
var Img = {};
	Img.player = new Image();
	Img.player.src = '../img/game/player.png';
	Img.bullet = new Image();
    Img.bullet.src = '../img/game/bullet.png';
    

setInterval(() => {
    socket.emit('movement', playerMovement);
  }, 1000 / 60);


var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var context = canvas.getContext('2d');
socket.on('state', function(players) {
  context.clearRect(0, 0, 800, 600);
  context.fillStyle = 'green';
  for (var id in players) {
    var player = players[id];
    context.beginPath();
    context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
    context.fill();
  }
});
// socket.on('message', function (data) {
//     console.log(data);
// });