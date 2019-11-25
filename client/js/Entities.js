<<<<<<< HEAD
<<<<<<< HEAD

var player;

//Common object that holds attributes for player, bullets etc.
Entity = function(type,id,x,y,width,height,img){
	var self = {
		type:type,
		id:id,
		x:x,
		y:y,
		width:width,
		height:height,
		img:img,
	};


	self.update = function(){
		self.updatePosition();
		self.draw();
	}


	// Draws the canvas for player models
	self.draw = function(){
		ctx.save();
		var x = self.x - player.x;
		var y = self.y - player.y;
		
		x += WIDTH/2;
		y += HEIGHT/2;
		
		x -= self.width/2;
		y -= self.height/2;
		
		ctx.drawImage(self.img,
			0,0,self.img.width,self.img.height,
			x,y,self.width,self.height
		);
		
		ctx.restore();
	}
	self.getDistance = function(entity2){	//return distance (number)
		var vx = self.x - entity2.x;
		var vy = self.y - entity2.y;
		return Math.sqrt(vx*vx+vy*vy);
	}

	self.testCollision = function(entity2){	//return if colliding (true/false)
		var rect1 = {
			x:self.x-self.width/2,
			y:self.y-self.height/2,
			width:self.width,
			height:self.height,
		}
		var rect2 = {
			x:entity2.x-entity2.width/2,
			y:entity2.y-entity2.height/2,
			width:entity2.width,
			height:entity2.height,
		}
		return testCollisionRectRect(rect1,rect2);
		
	}
	self.updatePosition = function(){}
	
	return self;
}

//Player object created
Player = function(socket){
	console.log(socket)
	var self = Actor('player','myId',50,40,50*1.5,70*1.5,Img.player,10,1);
	self.maxMoveSpd = 10;
	self.score = 0;
	self.pressingMouseLeft = false;
	self.pressingMouseRight = false;
	
	// Special attacks of player on mouse clicks
	var super_update = self.update;
	self.update = function(newScore){
		super_update();
		if(self.pressingRight || self.pressingLeft || self.pressingDown || self.pressingUp)
			self.spriteAnimCounter += 0.2;
		if(self.pressingMouseLeft)
			self.performAttack();
		if(self.pressingMouseRight)
			self.performSpecialAttack();
		if(newScore > self.score) {
			console.log(newScore)
			self.score = newScore
		}
			
	}	
	
	//When player dies
	self.onDeath = function(){
		var timeSurvived = Date.now() - timeWhenGameStarted;
		console.log("You lost! You survived for " + timeSurvived + " ms.");	
		socket.emit('onDeath', self.score);	
		console.log("our score" + self.score)
		
		startNewGame();
		
	}

	return self;
	
}

// Hero Object creation
Actor = function(type,id,x,y,width,height,img,hp,atkSpd){
	var self = Entity(type,id,x,y,width,height,img);
	
	self.hp = hp;
	self.hpMax = hp;
	self.atkSpd = atkSpd;
	self.attackCounter = 0;
	self.aimAngle = 0;
	
	self.spriteAnimCounter = 0;
	
	self.pressingDown = false;
	self.pressingUp = false;
	self.pressingLeft = false;
	self.pressingRight = false;
	self.maxMoveSpd = 3;
	

	//Drawing Player with scrollable camera angle attributes
	self.draw = function(){
		ctx.save();
		var x = self.x - player.x;
		var y = self.y - player.y;
		
		x += WIDTH/2;
		y += HEIGHT/2;
		
		x -= self.width/2;
		y -= self.height/2;
		
		var frameWidth = self.img.width/3;
		var frameHeight = self.img.height/4;
		
		var aimAngle = self.aimAngle;
		if(aimAngle < 0)
			aimAngle = 360 + aimAngle;
		
		var directionMod = 3;	//draw right
		if(aimAngle >= 45 && aimAngle < 135)	//down
			directionMod = 2;
		else if(aimAngle >= 135 && aimAngle < 225)	//left
			directionMod = 1;
		else if(aimAngle >= 225 && aimAngle < 315)	//up
			directionMod = 0;
		
		var walkingMod = Math.floor(self.spriteAnimCounter) % 3;//1,2
		
		ctx.drawImage(self.img,
			walkingMod*frameWidth,directionMod*frameHeight,frameWidth,frameHeight,
			x,y,self.width,self.height
		);
		
		ctx.restore();
	}
	

	//Changes position of player on movement keys and adding bump on edge or immovable game objects
	self.updatePosition = function(){
		var leftBumper = {x:self.x - 40,y:self.y};
		var rightBumper = {x:self.x + 40,y:self.y};
		var upBumper = {x:self.x,y:self.y - 16};
		var downBumper = {x:self.x,y:self.y + 64};
		
		if(Maps.current.isPositionWall(rightBumper)){
			self.x -= 5;
		} else {
			if(self.pressingRight)
				self.x += self.maxMoveSpd;			
		}
		
		if(Maps.current.isPositionWall(leftBumper)){
			self.x += 5;
		} else {
			if(self.pressingLeft)
				self.x -= self.maxMoveSpd;
		}
		if(Maps.current.isPositionWall(downBumper)){
			self.y -= 5;
		} else {
			if(self.pressingDown)
				self.y += self.maxMoveSpd;
		}
		if(Maps.current.isPositionWall(upBumper)){
			self.y += 5;
		} else {
			if(self.pressingUp)
				self.y -= self.maxMoveSpd;
		}
		
		// Is the position valid
		if(self.x < self.width/2)
			self.x = self.width/2;
		if(self.x > Maps.current.width-self.width/2)
			self.x = Maps.current.width - self.width/2;
		if(self.y < self.height/2)
			self.y = self.height/2;
		if(self.y > Maps.current.height - self.height/2)
			self.y = Maps.current.height - self.height/2;

	}
	
	var super_update = self.update;
	self.update = function(){
		super_update();
		self.attackCounter += self.atkSpd;
		if(self.hp <= 0)
			self.onDeath();
	}
	// self.onDeath = function(){};
	
	//Object for normal attack
	self.performAttack = function(){
		if(self.attackCounter > 25){	//every 1 sec
			self.attackCounter = 0;
			Bullet.generate(self);
		}
	}
	
	//Object for special attack
	self.performSpecialAttack = function(){
		if(self.attackCounter > 50){	//every 1 sec
			self.attackCounter = 0;
			Bullet.generate(self,self.aimAngle - 5);
			Bullet.generate(self,self.aimAngle);
			Bullet.generate(self,self.aimAngle + 5);
		}
	}

	
	return self;
}

//#####


//NPCS Object creation
Enemy = function(id,x,y,width,height,img,hp,atkSpd){
	var self = Actor('enemy',id,x,y,width,height,img,hp,atkSpd);
	Enemy.list[id] = self;
	
	self.toRemove = false;
	
	var super_update = self.update; 
	self.update = function(){
		super_update();
		self.spriteAnimCounter += 0.2;
		self.updateAim();
		self.updateKeyPress();
		self.performAttack();
	}

	//Aim towards player angle
	self.updateAim = function(){
		var diffX = player.x - self.x;
		var diffY = player.y - self.y;
		
		self.aimAngle = Math.atan2(diffY,diffX) / Math.PI * 180
	}

	//Move according to actor movement.
	self.updateKeyPress = function(){
		var diffX = player.x - self.x;
		var diffY = player.y - self.y;

		self.pressingRight = diffX > 3;
		self.pressingLeft = diffX < -3;
		self.pressingDown = diffY > 3;
		self.pressingUp = diffY < -3;
	}
	
	
	var super_draw = self.draw; 
	self.draw = function(){
		super_draw();
		var x = self.x - player.x + WIDTH/2;
		var y = self.y - player.y + HEIGHT/2 - self.height/2 - 20;
		
		ctx.save();
		ctx.fillStyle = 'red';
		var width = 100*self.hp/self.hpMax;
		if(width < 0)
			width = 0;
		ctx.fillRect(x-50,y,width,10);
		
		ctx.strokeStyle = 'black';
		ctx.strokeRect(x-50,y,100,10);
		
		ctx.restore();
	
	}
	
	self.onDeath = function(){
		self.toRemove = true;
	}
	
}

Enemy.list = {};


Enemy.update = function(){
	if(frameCount % 100 === 0)	//every 4 sec
		Enemy.randomlyGenerate();
	for(var key in Enemy.list){
		Enemy.list[key].update();
	}
	for(var key in Enemy.list){
		if(Enemy.list[key].toRemove)
			delete Enemy.list[key];
	}
}

//Randomly generates enemy at different positions in map
Enemy.randomlyGenerate = function(){
	//Math.random() returns a number between 0 and 1
	var x = Math.random()*Maps.current.width;
	var y = Math.random()*Maps.current.height;
	var height = 64*1.5;
	var width = 64*1.5;
	var id = Math.random();
	if(Math.random() < 0.5)
		Enemy(id,x,y,width,height,Img.bat,2,1);
	else
		Enemy(id,x,y,width,height,Img.bee,1,3);
}

//#####
Upgrade = function (id,x,y,width,height,category,img){
	var self = Entity('upgrade',id,x,y,width,height,img);
	
	self.category = category;
	Upgrade.list[id] = self;
}

Upgrade.list = {};

//Each time score updates as game run/
Upgrade.update = function(){
	if(frameCount % 75 === 0)	//every 3 sec
		Upgrade.randomlyGenerate();
	for(var key in Upgrade.list){
		Upgrade.list[key].update();
		var isColliding = player.testCollision(Upgrade.list[key]);
		if(isColliding){
			if(Upgrade.list[key].category === 'score')
				score += 1000;
			if(Upgrade.list[key].category === 'atkSpd')
				player.atkSpd += 3;
			delete Upgrade.list[key];
		}
	}
}	

//Function for generation of random objects throughout map
Upgrade.randomlyGenerate = function(){
	//Math.random() returns a number between 0 and 1
	var x = Math.random()*Maps.current.width;
	var y = Math.random()*Maps.current.height;
	var height = 32;
	var width = 32;
	var id = Math.random();
	
	if(Math.random()<0.5){
		var category = 'score';
		var img = Img.upgrade1;
	} else {
		var category = 'atkSpd';
		var img = Img.upgrade2;
	}
	
	Upgrade(id,x,y,width,height,category,img);
}

//#####

//Object creation for bullets(attacks).
Bullet = function (id,x,y,spdX,spdY,width,height,combatType){
	var self = Entity('bullet',id,x,y,width,height,Img.bullet);
	
	self.timer = 0;
	self.combatType = combatType;
	self.spdX = spdX;
	self.spdY = spdY
	self.toRemove = false;
	
	var super_update = self.update;
	self.update = function(){
		super_update();
		var toRemove = false;
		self.timer++;
		if(self.timer > 75)
			self.toRemove = true;
		
		
		if(self.combatType === 'player'){	//bullet was shot by player
			for(var key2 in Enemy.list){
				if(self.testCollision(Enemy.list[key2])){  //If hits enemy
					self.toRemove = true;
					Enemy.list[key2].hp -= 1;  // Enemy loses 1 hp
				}				
			}
		} else if(self.combatType === 'enemy'){  //bullet was shot by enemy
			if(self.testCollision(player)){  //If hits player
				self.toRemove = true;
				player.hp -= 1;  //Player loses 1 hp
			}
		}	
		if(Maps.current.isPositionWall(self)){
			self.toRemove = true;
		}
		
	}
	
	self.updatePosition = function(){
		self.x += self.spdX;
		self.y += self.spdY;
				
		if(self.x < 0 || self.x > Maps.current.width){
			self.spdX = -self.spdX;
		}
		if(self.y < 0 || self.y > Maps.current.height){
			self.spdY = -self.spdY;
		}
	}
	
	
	Bullet.list[id] = self;
=======
// Loading necessary modules with Node.js
const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const morgan = require('morgan');
const cons = require('consolidate');
const pageRouter = require('./router/pages')
const RedisStore = require("connect-redis")(session);



// Constant variables important for assignments
const config = require('./config.json');
const client = path.resolve("../client")
const port = config.port;
const debug = config.debug;

// Mongoose database configuration
const mongoose = require("mongoose");
const Player = require('./core/playerSchema')

// Mongoose database connection
mongoose.connect('mongodb://localhost/my_database', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

// Setting morgan to load information about the requests for development/configuration uses.
app.use(morgan('dev'));

// Initialize bodyParser to parse the incoming parameter requests to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Initialize cookieParser to allow us to access the cookies stored in the browser.
app.use(cookieParser());
app.use(express.static(path.resolve(client)));

var sessionMiddleware =
    session({
        secret: 'user_sid',
        resave: true,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 10 * 60 * 1000
        }
    })
io.use(function (socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

// Using session
app.use(sessionMiddleware)

// Setting the express static and files for client
app.engine('html', cons.swig)
app.set('views', path.resolve("../client/views"))
app.set('view engine', 'html');

// Using routers 
app.use('/', pageRouter)

// Errors => page not found 404
app.use((req, res, next) => {
    var err = new Error('Page not found');
    err.status = 404;
    next(err);
})

// Handling errors (send them to the client)
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send(err.message);
});


// server events and listening
server.on("error", (err) => {
    console.log('Server Error: ' + err);
});

// listening to the port
server.listen(port, () => {
    console.log(`Listening at port ${port}...`);
});

function valueExists(jsObj, value, cb){
    for (var key in jsObj){
        if (jsObj[key].username == value) 
        return cb(key, true);
    }
    return cb(key, false);
>>>>>>> 0c7c0bacd45b2e7b1a7d3f437e7b1e31fc8527b2
=======

var initPack = {player:[],bullet:[]};
var removePack = {player:[],bullet:[]};



Entity = function(param){
	var self = {
		x:250,
		y:250,
		spdX:0,
		spdY:0,
		id:"",
		map:'forest',
	}
	if(param){
		if(param.x)
			self.x = param.x;
		if(param.y)
			self.y = param.y;
		if(param.map)
			self.map = param.map;
		if(param.id)
			self.id = param.id;
	}

	self.update = function(){
		self.updatePosition();
	}
	self.updatePosition = function(){
		self.x += self.spdX;
		self.y += self.spdY;
	}
	self.getDistance = function(pt){
		return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2));
	}
	return self;
}
Entity.getFrameUpdateData = function(){
	var pack = {
		initPack:{
			player:initPack.player,
			bullet:initPack.bullet,
		},
		removePack:{
			player:removePack.player,
			bullet:removePack.bullet,
		},
		updatePack:{
			player:Player.update(),
			bullet:Bullet.update(),
		}
	};
	initPack.player = [];
	initPack.bullet = [];
	removePack.player = [];
	removePack.bullet = [];
	return pack;
}


Player = function(param){
	var self = Entity(param);
	self.number = "" + Math.floor(10 * Math.random());
	self.username = param.username;
	self.pressingRight = false;
	self.pressingLeft = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.pressingAttack = false;
	self.mouseAngle = 0;
	self.maxSpd = 10;
	self.hp = 10;
	self.hpMax = 10;
	self.score = 0;

	var super_update = self.update;
	self.update = function(){
		self.updateSpd();

		super_update();

		if(self.pressingAttack){
			self.shootBullet(self.mouseAngle);
		}
	}
	self.shootBullet = function(angle){
		Bullet({
			parent:self.id,
			angle:angle,
			x:self.x,
			y:self.y,
			map:self.map,
		});
	}

	self.updateSpd = function(){
		if(self.pressingRight)
			self.spdX = self.maxSpd;
		else if(self.pressingLeft)
			self.spdX = -self.maxSpd;
		else
			self.spdX = 0;

		if(self.pressingUp)
			self.spdY = -self.maxSpd;
		else if(self.pressingDown)
			self.spdY = self.maxSpd;
		else
			self.spdY = 0;
	}

	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			number:self.number,
			hp:self.hp,
			hpMax:self.hpMax,
			score:self.score,
			map:self.map,
		};
	}
	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			hp:self.hp,
			score:self.score,
			map:self.map,
		}
	}

	Player.list[self.id] = self;

	initPack.player.push(self.getInitPack());
	return self;
}
Player.list = {};
Player.onConnect = function(socket,username,progress){
	var map = 'forest';
	if(Math.random() < 0.5)
		map = 'field';
	var player = Player({
		username:username,
		id:socket.id,
		map:map,
		socket:socket,
		progress:progress,
	});

	socket.on('keyPress',function(data){
		if(data.inputId === 'left')
			player.pressingLeft = data.state;
		else if(data.inputId === 'right')
			player.pressingRight = data.state;
		else if(data.inputId === 'up')
			player.pressingUp = data.state;
		else if(data.inputId === 'down')
			player.pressingDown = data.state;
		else if(data.inputId === 'attack')
			player.pressingAttack = data.state;
		else if(data.inputId === 'mouseAngle')
			player.mouseAngle = data.state;
	});

	socket.on('changeMap',function(data){
		if(player.map === 'field')
			player.map = 'forest';
		else
			player.map = 'field';
	});

	socket.on('sendMsgToServer',function(data){
		for(var i in SOCKET_LIST){
			SOCKET_LIST[i].emit('addToChat',player.username + ': ' + data);
		}
	});
	socket.on('sendPmToServer',function(data){ //data:{username,message}
		var recipientSocket = null;
		for(var i in Player.list)
			if(Player.list[i].username === data.username)
				recipientSocket = SOCKET_LIST[i];
		if(recipientSocket === null){
			socket.emit('addToChat','The player ' + data.username + ' is not online.');
		} else {
			recipientSocket.emit('addToChat','From ' + player.username + ':' + data.message);
			socket.emit('addToChat','To ' + data.username + ':' + data.message);
		}
	});

	socket.emit('init',{
		selfId:socket.id,
		player:Player.getAllInitPack(),
		bullet:Bullet.getAllInitPack(),
	})
}
Player.getAllInitPack = function(){
	var players = [];
	for(var i in Player.list)
		players.push(Player.list[i].getInitPack());
	return players;
}

Player.onDisconnect = function(socket){
	let player = Player.list[socket.id];
	if(!player)
		return;
	Database.savePlayerProgress({
		username:player.username,
	});
	delete Player.list[socket.id];
	removePack.player.push(socket.id);
}
Player.update = function(){
	var pack = [];
	for(var i in Player.list){
		var player = Player.list[i];
		player.update();
		pack.push(player.getUpdatePack());
	}
	return pack;
}


Bullet = function(param){
	var self = Entity(param);
	self.id = Math.random();
	self.angle = param.angle;
	self.spdX = Math.cos(param.angle/180*Math.PI) * 10;
	self.spdY = Math.sin(param.angle/180*Math.PI) * 10;
	self.parent = param.parent;

	self.timer = 0;
	self.toRemove = false;
	var super_update = self.update;
	self.update = function(){
		if(self.timer++ > 100)
			self.toRemove = true;
		super_update();

		for(var i in Player.list){
			var p = Player.list[i];
			if(self.map === p.map && self.getDistance(p) < 32 && self.parent !== p.id){
				p.hp -= 1;

				if(p.hp <= 0){
					var shooter = Player.list[self.parent];
					if(shooter)
						shooter.score += 1;
					p.hp = p.hpMax;
					p.x = Math.random() * 500;
					p.y = Math.random() * 500;
				}
				self.toRemove = true;
			}
		}
	}
	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			map:self.map,
		};
	}
	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
		};
	}

	Bullet.list[self.id] = self;
	initPack.bullet.push(self.getInitPack());
	return self;
}
Bullet.list = {};

Bullet.update = function(){
	var pack = [];
	for(var i in Bullet.list){
		var bullet = Bullet.list[i];
		bullet.update();
		if(bullet.toRemove){
			delete Bullet.list[i];
			removePack.bullet.push(bullet.id);
		} else
			pack.push(bullet.getUpdatePack());
	}
	return pack;
}

Bullet.getAllInitPack = function(){
	var bullets = [];
	for(var i in Bullet.list)
		bullets.push(Bullet.list[i].getInitPack());
	return bullets;
>>>>>>> bdf8717d4978f110572ecf7c67e82000b602a660
}
