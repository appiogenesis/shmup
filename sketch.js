'use strict';

const CANVAS_WIDTH = 600,
	  CANVAS_HEIGHT = 800;
	  
const KEY_LEFT = 37,
      KEY_RIGHT = 39,
	  KEY_UP = 38,
	  KEY_DOWN = 40,
	  KEY_SPACE = 32;

let player;
let projectiles = [];
let particles = [];
let delta = 0;
let lastMs = 0;

function setup()
{
	createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
	frameRate(30);

	player = new Player(width / 2, height - 32, 32, 32);

	for (let i = 0; i < 200; i++)
	{
		particles.push(new Particle());
	}

	rectMode(CENTER);
	noFill();
	stroke(255);
}

function draw()
{
	delta = millis() - lastMs;
	lastMs = millis();

	background(0);

	for (let i = 0; i < particles.length; i++)
	{
		particles[i].update().draw();
	}

	player.update().drawTimer().draw();

	for (let i = projectiles.length-1; i >= 0; i--)
	{
		let projectile = projectiles[i];
		projectile.update().draw();

		if (projectile.isOutOfBounds())
		{
			projectiles.splice(i, 1);
		}
	}	
	

	//text(millis(), 12, 16);
	//Stext(delta, 12, 28);
}

class GameEntity
{
	constructor(spawnX, spawnY, spawnW, spawnH, spawnDir)
	{
		this.pos = createVector(spawnX || 0, spawnY || 0, 0);	
		this.dim = createVector(spawnW || 8, spawnH || 8, 0);
		this.dir = spawnDir || 0;
	}

	drawHitBox()
	{
		rect(this.pos.x, this.pos.y, this.dim.x, this.dim.y);
		return this;
	}

	update()
	{
		return this;
	}

	isOutOfBounds()
	{
		return ( this.pos.x < 0 - this.dim.x/2 || 
		         this.pos.x > width + this.dim.x/2 ||
		         this.pos.y < 0 - this.dim.y/2 ||
		         this.pos.y > height + this.dim.y/2 );
	}
}

class Player extends GameEntity
{
	constructor(x, y, w, h, d)
	{
		super(x, y, w, h, d);
		this.interval = 12;
		this.timer = 1000;
	}

	shoot()
	{
		let p = [new PlayerProjectile(this.pos.x - 24, this.pos.y), new PlayerProjectile(this.pos.x + 24, this.pos.y)];
		projectiles.push(p[0], p[1]);
		return p;
	}

	drawTimer() {
		rect(this.pos.x, this.pos.y, this.timer/1000*this.dim.x, this.timer/1000*this.dim.y);
		return this;
	}

	update()
	{
		if (this.timer > 0)
		{
			this.timer -= 1000/this.interval;
		}
		else if (keyIsDown(KEY_SPACE))
		{
			this.shoot();
			this.timer = 1000;
		}
		else
		{
			this.timer = 0;
		}

		if (keyIsDown(KEY_LEFT))
		{
			this.pos.x -= 12;
		}

		if (keyIsDown(KEY_RIGHT))
		{
			this.pos.x += 12;
		}

		if (keyIsDown(KEY_UP) && this.pos.y > height/2)
		{
			this.pos.y -= 12;
		}

		if (keyIsDown(KEY_DOWN) && this.pos.y < height-this.dim.y)
		{
			this.pos.y += 12;
		}
		
		if (this.pos.x < -this.dim.x/2)
		{
			this.pos.x = width + this.dim.x/2;
		}

		if (this.pos.x > width + this.dim.x/2)
		{
			this.pos.x = -this.dim.x/2;
		}

		return this;
	}

	draw()
	{
		
		// hull
		stroke(128, 128, 255);
		rect(this.pos.x, this.pos.y, this.dim.x * 0.35, this.dim.y);

		// wings
		rect(this.pos.x, this.pos.y, this.dim.x * 0.8, this.dim.y * 0.2);
		rect(this.pos.x, this.pos.y + this.dim.y * 0.15, this.dim.x * 1.2, this.dim.y * 0.1);
		
		// engines
		stroke(255, 128, 64);
		rect(this.pos.x - this.dim.x * 0.6, this.pos.y + this.dim.y * 0.25, this.dim.x * 0.1, this.dim.y);
		rect(this.pos.x + this.dim.x * 0.6, this.pos.y + this.dim.y * 0.25, this.dim.x * 0.1, this.dim.y);
		
		// cockpit
		stroke(255);
		rect(this.pos.x, this.pos.y - this.dim.y * 0.35, this.dim.x * 0.2, this.dim.y * 0.2);

		return this;
	}
}

class PlayerProjectile extends GameEntity
{
	update()
	{
		this.pos.y -= 24;
		return this;
	}

	draw()
	{
		stroke(255, 0, 0);
		rect(this.pos.x, this.pos.y, this.dim.x * 0.75, this.dim.y * 0.75);
		stroke(255, 128, 0);
		rect(this.pos.x, this.pos.y + 12, this.dim.x * 0.5, this.dim.y * 0.5);
		stroke(255, 255, 0);
		rect(this.pos.x, this.pos.y + 24, this.dim.x * 0.25, this.dim.y * 0.25);
		return this;
	}
}

class Particle
{
	constructor()
	{
		this.x = random(width);
		this.y = random(height);
	}

	update()
	{
		this.y += 12;
		this.x %= width;
		if (this.y > height)
		{
			this.x = random(width);
			this.y = 0;
		}
		return this;
	}

	draw()
	{
		point(this.x, this.y);
	}
}