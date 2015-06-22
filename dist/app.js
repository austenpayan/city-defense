"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var w = window;
var requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");

var turrets = [];
var meteorDelay = 50;
var gravity = 0.001;
var meteorDelayCounter = 0;
var meteors = [];
var meteorVelocity = 3;
var leftTurret;
var rightTurret;
var bullets = [];
var bulletVelocity = 5;
var explosions = [];

var keysDown = {};
var mouseX;
var mouseY;

addEventListener("keydown", function (e) {

	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

document.onmousemove = handleMouseMove;

function handleMouseMove(event) {

	var dot, eventDoc, doc, body, pageX, pageY;

	event = event || window.event; // IE-ism

	// If pageX/Y aren't available and clientX/Y are,
	// calculate pageX/Y - logic taken from jQuery.
	// (This is to support old IE)
	if (event.pageX == null && event.clientX != null) {
		eventDoc = event.target && event.target.ownerDocument || document;
		doc = eventDoc.documentElement;
		body = eventDoc.body;

		event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
		event.pageY = event.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
	}

	// Use event.pageX / event.pageY here
	mouseX = event.pageX;
	mouseY = event.pageY;
}

canvas.width = w.innerWidth;
canvas.height = w.innerHeight;

document.body.appendChild(canvas);

var Meteor = (function () {
	function Meteor(xcoord, ycoord) {
		_classCallCheck(this, Meteor);

		this.x = xcoord;
		this.y = ycoord;
		this.width = 8;
		this.height = 8;

		this.draw();
	}

	_createClass(Meteor, [{
		key: "update",
		value: function update() {

			this.y = this.y + meteorVelocity;
			this.draw();
		}
	}, {
		key: "draw",
		value: function draw() {

			ctx.fillStyle = "#FF0000";
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}
	}]);

	return Meteor;
})();

var Bullet = (function () {
	function Bullet(startX, startY, destinationX, destinationY) {
		_classCallCheck(this, Bullet);

		this.startX = startX;
		this.startY = startY;
		this.destinationX = destinationX;
		this.destinationY = destinationY;
		this.x = startX;
		this.y = startY;
		this.width = 5;
		this.height = 5;
		this.frames = 1;

		this.draw();
	}

	_createClass(Bullet, [{
		key: "calculateTrajectory",
		value: function calculateTrajectory() {

			var globalA;
			var globalB;
			var globalC;
			var localA;
			var localb;
			var localC = bulletVelocity;
			var ratio;

			if (this.startX < this.destinationX) {

				globalA = this.destinationX - this.startX;
				globalB = this.destinationY - this.startY;
				globalC = Math.sqrt(Math.pow(globalA, 2) + Math.pow(globalB, 2));
				ratio = localC / globalC;

				this.x = this.x + globalA * ratio;
				this.y = this.y + globalB * ratio + gravity * this.frames;
			} else if (this.startX > this.destinationX) {

				globalA = this.startX - this.destinationX;
				globalB = this.destinationY - this.startY;
				globalC = Math.sqrt(Math.pow(globalA, 2) + Math.pow(globalB, 2));
				ratio = localC / globalC;

				this.x = this.x - globalA * ratio;
				this.y = this.y + globalB * ratio + gravity * this.frames;
			}
		}
	}, {
		key: "update",
		value: function update() {

			this.calculateTrajectory();
			this.draw();
			this.frames++;
		}
	}, {
		key: "draw",
		value: function draw() {

			ctx.fillStyle = "#FFF700";
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}
	}]);

	return Bullet;
})();

var Turret = (function () {
	function Turret(side) {
		_classCallCheck(this, Turret);

		this.width = 10;
		this.height = 10;
		this.side = side;

		if (side === "left") {

			this.x = 0;
			this.y = canvas.height - this.height;
		} else {

			this.x = canvas.width - this.width;
			this.y = canvas.height - this.height;
		}

		this.draw();
	}

	_createClass(Turret, [{
		key: "fire",
		value: function fire(destinationX, destinationY) {

			var startX;
			var startY = this.y;

			if (this.side === "left") {

				startX = this.x + this.width;
			} else {

				startX = this.x;
			}

			var bullet = new Bullet(startX, startY, destinationX, destinationY);

			bullets.push(bullet);
		}
	}, {
		key: "update",
		value: function update() {

			this.draw();
		}
	}, {
		key: "draw",
		value: function draw() {

			ctx.fillStyle = "#ffffff";
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}
	}]);

	return Turret;
})();

var Explosion = (function () {
	function Explosion(x, y) {
		_classCallCheck(this, Explosion);

		this.width = 1;
		this.height = 1;
		this.x = x - this.width / 2;
		this.y = y - this.height / 2;

		this.frame = 1;

		this.draw();
	}

	_createClass(Explosion, [{
		key: "update",
		value: function update() {

			this.width = 1 * this.frame;
			this.height = 1 * this.frame;
			this.x = this.x;
			this.y = this.y;

			this.draw();
			this.frame++;
		}
	}, {
		key: "draw",
		value: function draw() {

			ctx.beginPath();
			ctx.arc(this.x, this.y, this.width, 0, 2 * Math.PI, false);
			ctx.fillStyle = "#FF9420";
			ctx.fill();
		}
	}]);

	return Explosion;
})();

function updateMeteors() {

	for (var i = 0; i < meteors.length; i++) {

		meteors[i].update();
	}
}

function updateTurrets() {

	leftTurret.update();
	rightTurret.update();
}

function updateBullets() {

	for (var i = 0; i < bullets.length; i++) {

		bullets[i].update();
	}
}

function updateExplosions() {

	for (var i = 0; i < explosions.length; i++) {

		if (explosions[i].frame > 40) {

			explosions.splice(i, 1);
			i--;
		} else {

			explosions[i].update();
		}
	}
}

function checkForBulletFire() {

	if (32 in keysDown) {

		if (mouseX > canvas.width / 2) {

			rightTurret.fire(mouseX, mouseY);
		} else {

			leftTurret.fire(mouseX, mouseY);
		}
	}

	if (65 in keysDown) {

		leftTurret.fire(mouseX, mouseY);
	}

	if (68 in keysDown) {

		rightTurret.fire(mouseX, mouseY);
	}
}

function collides(a, b) {

	return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function checkForCollisions() {

	for (var i = 0; i < bullets.length; i++) {

		for (var e = 0; e < meteors.length; e++) {

			if (collides(bullets[i], meteors[e])) {

				explosions.push(new Explosion(bullets[i].x, bullets[i].y));

				bullets.splice(i, 1);
				meteors.splice(e, 1);
			}
		}
	}
}

function checkForBounds() {

	for (var i = 0; i < bullets.length; i++) {

		if (bullets[i].x > canvas.width || bullets[i].x <= 0 || bullets[i].y <= 0 || bullets[i].y >= canvas.height) {

			bullets.splice(i, 1);
		}
	}

	for (var e = 0; e < meteors.length; e++) {

		if (meteors[e].y + meteors[e].height >= canvas.height) {

			explosions.push(new Explosion(meteors[e].x, meteors[e].y));

			meteors.splice(e, 1);
		}
	}
}

function generateMeteors() {

	meteorDelayCounter++;

	if (meteorDelayCounter > meteorDelay) {

		var randomX = Math.random() * (canvas.width - 20) + 0;
		// var randomY = Math.random() * (canvas.height - 0) + 0;

		var newMeteor = new Meteor(randomX, 0);

		meteors.push(newMeteor);

		meteorDelayCounter = 0;
	}
}

function update() {

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	generateMeteors();
	updateMeteors();
	updateTurrets();
	updateBullets();
	updateExplosions();
	checkForBulletFire();
	checkForCollisions();
	checkForBounds();

	requestAnimationFrame(update);
}

function start() {

	leftTurret = new Turret("left");
	rightTurret = new Turret("right");
}

function render() {

	start();

	requestAnimationFrame(update);
}

render();
//# sourceMappingURL=app.js.map
