
var initPack = {player:[],bullet:[]};
var removePack = {player:[],bullet:[]};

Entity = function(param){
	var self = {
		x:250,
		y:250,
		spdX:0,
        spdY:0,
        width:5,
		height:5,
		id:"",
        map:'forest',
        img: ''
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
        if(param.spdX)
            self.spdX = param.spdX;
        if(param.spdY)
            self.spdY = param.spdY;	
        if(param.img)
            self.img = param.img;
        if(param.height)
            self.height = param.height;
        if(param.width) 
            self.width = param.width;
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

Actor = function(param) {
    var self = Entity(param)
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
	self.onDeath = function(){};
	
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
Player = function(socket, param){
	var self = Actor(param);
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
        if(self.pressingRight || self.pressingLeft || self.pressingDown || self.pressingUp)
			self.spriteAnimCounter += 0.2;
		if(self.pressingAttack){
            socket.on('mouseAngle', function(angle) {
                self.mouseAngle = angle
            })
            self.performAttack();
        }
			
	}
	// self.shootBullet = function(angle){
	// 	Bullet({
	// 		parent:self.id,
	// 		angle:angle,
	// 		x:self.x,
	// 		y:self.y,
	// 		map:self.map,
	// 	});
	// }
	
	// self.updateSpd = function(){
	// 	if(self.pressingRight)
	// 		self.spdX = self.maxSpd;
	// 	else if(self.pressingLeft)
	// 		self.spdX = -self.maxSpd;
	// 	else
	// 		self.spdX = 0;
		
	// 	if(self.pressingUp)
	// 		self.spdY = -self.maxSpd;
	// 	else if(self.pressingDown)
	// 		self.spdY = self.maxSpd;
	// 	else
	// 		self.spdY = 0;		
	// }
	
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
	var map = 'field';
	var player = Player(socket, {
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
		items:player.inventory.items,
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
}