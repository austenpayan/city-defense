const w = window;
const requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
const turrets = [];
const meteorDelay = 50;
const gravity = 0.001;
const meteorDelayCounter = 0;
const meteors = [];
const meteorVelocity = 3;
const bullets = [];
const bulletVelocity = 5;
const explosions = [];
const keysDown = {};

let leftTurret;
let rightTurret;
let mouseX;
let mouseY;

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

document.onmousemove = handleMouseMove;

function handleMouseMove(event) {
    let eventDoc, doc, body;

    event = event || window.event; // IE-ism

    // If pageX/Y aren't available and clientX/Y are,
    // calculate pageX/Y - logic taken from jQuery.
    // (This is to support old IE)
    if (event.pageX == null && event.clientX != null) {
        eventDoc = (event.target && event.target.ownerDocument) || document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;

        event.pageX = event.clientX +
          (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
          (doc && doc.clientLeft || body && body.clientLeft || 0);
        event.pageY = event.clientY +
          (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
          (doc && doc.clientTop  || body && body.clientTop  || 0 );
    }

    // Use event.pageX / event.pageY here
    mouseX = event.pageX;
    mouseY = event.pageY;
}

canvas.width = w.innerWidth;
canvas.height = w.innerHeight;

document.body.appendChild(canvas);
class Meteor {
	constructor(xcoord, ycoord) {
		this.x = xcoord;
		this.y = ycoord;
		this.width = 8;
		this.height = 8;
		this.draw();
	}

	update() {
		this.y = this.y + meteorVelocity;
		this.draw();
	}

	draw() {
		ctx.fillStyle = "#FF0000";
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
}

class Bullet {
	constructor(startX, startY, destinationX, destinationY) {
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

	calculateTrajectory() {
		const localC = bulletVelocity;

		let globalA;
		let globalB;
		let globalC;
		let ratio;

		if (this.startX < this.destinationX) {
			globalA = this.destinationX - this.startX;
			globalB = this.destinationY - this.startY;
			globalC = Math.sqrt(Math.pow(globalA, 2) + Math.pow(globalB, 2));
			ratio = localC / globalC;

			this.x = this.x + (globalA * ratio);
			this.y = this.y + (globalB * ratio) + (gravity * this.frames);
		} else if (this.startX > this.destinationX) {
			globalA = this.startX - this.destinationX;
			globalB = this.destinationY - this.startY;
			globalC = Math.sqrt(Math.pow(globalA, 2) + Math.pow(globalB, 2));
			ratio = localC / globalC;

			this.x = this.x - (globalA * ratio);
			this.y = this.y + (globalB * ratio) + (gravity * this.frames);
		}
	}

	update() {
		this.calculateTrajectory();
		this.draw();
		this.frames++;
	}

	draw() {
		ctx.fillStyle = "#FFF700";
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
}

class Turret {
	constructor(side) {
		this.width = 10;
		this.height = 10;
		this.side = side;

		if (side === 'left') {
			this.x = 0;
			this.y = canvas.height - this.height;
		} else {
			this.x = canvas.width - this.width;
			this.y = canvas.height - this.height;
		}

		this.draw();
	}

	fire(destinationX, destinationY) {
		const startY = this.y;
		let startX;

		if (this.side === 'left') {
			startX = this.x + this.width;
		} else {
			startX = this.x;
		}

		const bullet = new Bullet(startX, startY, destinationX, destinationY);

		bullets.push(bullet);
	}

	update() {
		this.draw();
	}

	draw() {
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
}
class Explosion {
	constructor(x, y) {
		this.width = 1;
		this.height = 1;
		this.x = x - (this.width / 2);
		this.y = y - (this.height / 2);

		this.frame = 1;

		this.draw();
	}

	update() {
		this.width = 1 * this.frame;
		this.height = 1 * this.frame;
		this.x = this.x;
		this.y = this.y;

		this.draw();
		this.frame++;
	}

	draw() {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.width, 0, 2 * Math.PI, false);
		ctx.fillStyle = "#FF9420";
		ctx.fill();
	}
}

function updateMeteors() {
	for(let i = 0; i < meteors.length; i++) {
		meteors[i].update();
	}
}

function updateTurrets() {
	leftTurret.update();
	rightTurret.update();
}

function updateBullets() {
	for(let i = 0; i < bullets.length; i++) {
		bullets[i].update();
	}
}

function updateExplosions() {
	for(let i = 0; i < explosions.length; i++) {
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
	for(let i = 0; i < bullets.length; i++) {
		for(let e = 0; e < meteors.length; e++) {
			if (collides(bullets[i], meteors[e])) {
				explosions.push(new Explosion(bullets[i].x, bullets[i].y));
				bullets.splice(i, 1);
				meteors.splice(e, 1);
			}
		}
	}
}

function checkForBounds() {
	for(let i = 0; i < bullets.length; i++) {
		if (bullets[i].x > canvas.width || bullets[i].x <= 0 || bullets[i].y <= 0 || bullets[i].y >= canvas.height) {
			bullets.splice(i, 1);
		}
	}

	for(let e = 0; e < meteors.length; e++) {
		if (meteors[e].y + meteors[e].height >= canvas.height) {
			explosions.push(new Explosion(meteors[e].x, meteors[e].y));
			meteors.splice(e, 1);
		}
	}
}

function generateMeteors() {
	meteorDelayCounter++;

	if (meteorDelayCounter > meteorDelay) {
		const randomX = Math.random() * (canvas.width - 20) + 0;
		const newMeteor = new Meteor(randomX, 0);

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
	leftTurret = new Turret('left');
	rightTurret = new Turret('right');
}

function render() {
	start();
	requestAnimationFrame(update);
}

render();