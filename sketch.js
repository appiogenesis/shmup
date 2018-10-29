'use strict';

const CANVAS_WIDTH = 600,
	  CANVAS_HEIGHT = 800;

const KEY_LEFT = 37,
      KEY_RIGHT = 39,
	  KEY_UP = 38,
	  KEY_DOWN = 40,
	  KEY_SPACE = 32;

let player;
let score = 0;
let wave;
let projectiles = [];
let pickups = [];
let particles = [];
let delta = 0;
let lastMs = 0;

function setup()
{
	createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
	frameRate(60);

	player = new Player(width / 2, height - 32, 32, 32);
	wave = new Wave().make();

	for (let i = 0; i < 200; i++)
	{
		particles.push(new Particle());
	}

	angleMode(DEGREES);
	rectMode(CENTER);
	stroke(255);
}

function draw()
{
	delta = millis() - lastMs;
	lastMs = millis();

	background(0);


	stroke(255);

	for (let i = 0; i < particles.length; i++)
	{
		particles[i].update().draw();
	}

	player.drawTimer().drawHealth().draw().update();
	wave.draw().update();

	for (let i = projectiles.length-1; i >= 0; i--)
	{
		let projectile = projectiles[i];
		projectile.draw().update();

		if (projectile.isOutOfBounds())
		{
			projectiles.splice(i, 1);
		}
	}

	for (let i = pickups.length-1; i >= 0; i--)
	{
		let pickup = pickups[i];
		pickup.draw().update();

		if (pickup.isOutOfBounds())
		{
			pickups.splice(i, 1);
		}
	}

	//score++;

	textAlign(CENTER);
	textSize(32);
	stroke(255);

	text(score, width/2, height-32);
}

class GameEntity
{
	constructor(spawnX, spawnY, spawnW, spawnH, spawnDir)
	{
		this.pos = createVector(spawnX || 0, spawnY || 0, 0);
		this.dim = createVector(spawnW || 16, spawnH || 16, 0);
		this.dir = spawnDir || 0;
	}

	drawHitBox()
	{
		noFill();
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

	collidesWith(other)
	{
		return !( this.pos.x + this.dim.x/2 < other.pos.x - other.dim.x/2 ||
		          this.pos.x - this.dim.x/2 > other.pos.x + other.dim.x/2 ||
		          this.pos.y + this.dim.y/2 < other.pos.y - other.dim.y/2 ||
		          this.pos.y - this.dim.y/2 > other.pos.y + other.dim.y/2 );
	}
}

class Player extends GameEntity
{
	constructor(x, y, w, h, d)
	{
		super(x, y, w, h, d);
		this.interval = 12;
		this.timer = 1000;
		this.health = this.maxHealth = 100;
	}

	shoot()
	{
		let p = [new PlayerProjectile(this.pos.x - 24, this.pos.y), new PlayerProjectile(this.pos.x + 24, this.pos.y)];
		projectiles.push(p[0], p[1]);
		return p;
	}

	drawTimer() {
		noFill();
		rect(this.pos.x, this.pos.y, this.timer/1000*this.dim.x, this.timer/1000*this.dim.y);
		return this;
	}

	drawHealth() {
		noFill();
		stroke(64, 255, 32);
		rect(width/2, height-8, (width-8)/this.maxHealth*this.health, 4);
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

		for (let i = pickups.length-1; i >=0; i--)
		{
			if (this.collidesWith(pickups[i]))
			{
				this.health += 10;
				pickups.splice(i, 1);
			}
		}

		for (let i = wave.entities.length-1; i >=0; i--)
		{
			if (this.collidesWith(wave.entities[i]))
			{
				this.health -= 10;
			}
		}

		if (this.health > this.maxHealth)
		{
			score += this.health - this.maxHealth;
			this.health = this.maxHealth;
		}
		if (this.health < 0)
		{
			this.health = 0;
		}

		return this;
	}

	draw()
	{
		noFill();

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
		noFill();
		rect(this.pos.x, this.pos.y, this.dim.x * 0.75, this.dim.y * 0.75);
		stroke(255, 128, 0);
		rect(this.pos.x + random(-4, 4), this.pos.y + 18, this.dim.x * 0.5, this.dim.y * 0.5);
		stroke(255, 255, 128);
		rect(this.pos.x + random(-4, 4), this.pos.y + 32, this.dim.x * 0.25, this.dim.y * 0.25);
		return this;
	}
}

class Pickupable extends GameEntity
{
	constructor(x, y, w, h, d)
	{
		super(x, y, w, h, d);
	}

	draw()
	{
		stroke(0, 255, 0);
		rect(this.pos.x, this.pos.y, this.dim.x, this.dim.y);
		rect(this.pos.x, this.pos.y, this.dim.x * 0.6, this.dim.y * 0.2);
		rect(this.pos.x, this.pos.y, this.dim.x * 0.2, this.dim.y * 0.6);
		return this;
	}

	update()
	{
		this.pos.y += 4;
	}
}

class Enemy extends GameEntity
{
	constructor(x, y, w, h, d)
	{
		super(x, y, w, h, d);
		this.speed = 10;
		this.dead = false;
		this.worth = 10;
	}

	update()
	{
		this.pos.y += this.speed;

		if (this.pos.y > height)
		{
			this.dead = true;

		}

		for (let i = projectiles.length-1; i >=0; i--)
		{
			if (this.collidesWith(projectiles[i]))
			{
				score += this.worth;
				this.dead = true;
				pickups.push(new Pickupable(this.pos.x, this.pos.y));
			}
		}
		return this;
	}

	draw()
	{
		push();
		translate(this.pos.x, this.pos.y);
		rotate(this.dir);
		noFill();

		// hull
		stroke(255, 64, 64);
		rect(0, 0, this.dim.x * 0.35, this.dim.y);

		// wings
		rect(0, 0, this.dim.x * 0.8, this.dim.y * 0.2);
		rect(0, this.dim.y * 0.15, this.dim.x * 1.2, this.dim.y * 0.1);

		// engines
		stroke(255, 128, 64);
		rect(-this.dim.x * 0.6, this.dim.y * 0.25, this.dim.x * 0.1, this.dim.y);
		rect(this.dim.x * 0.6, this.dim.y * 0.25, this.dim.x * 0.1, this.dim.y);

		// cockpit
		stroke(255);
		rect(0, -this.dim.y * 0.35, this.dim.x * 0.2, this.dim.y * 0.2);

		pop();

		return this;
	}
}

class Wave
{
	constructor()
	{
		this.entities = [];
		this.interval = 150;
		this.timer = 1000;
	}

	make()
	{
		let amount = floor(random(1, 7)), spaces = amount * 2;

		for (let i = 1; i < spaces; i+=2)
		{
			this.entities.push(new Enemy(width/spaces*i, -32, 32, 32, 180));
		}

		return this;
	}

	update()
	{
		if (this.timer > 0)
		{
			this.timer -= 1000/this.interval;
		}
		else
		{
			this.make();
			this.timer = 1000;
			this.interval = random(100, 400);
		}

		for (let i = this.entities.length-1; i >= 0; i--)
		{
			if (this.entities[i].dead)
				this.entities.splice(i, 1);
			else
				this.entities[i].update().pos.add(createVector(0, 4, 0));
		}
		return this;
	}

	draw()
	{
		for (let i = 0; i < this.entities.length; i++)
		{
			this.entities[i].draw();
		}
		return this;
	}

	drawHitBoxes()
	{
		for (let i = 0; i < this.entities.length; i++)
		{
			this.entities[i].drawHitBox();
		}
		return this;
	}

	clean()
	{
		this.entities = [];
		return this();
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