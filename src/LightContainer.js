'use strict';

var Visibility = require('./visibility');
var NormalMapFilter = require('./NormalMapFilter');
var LightSpriteBatch = require('./LightSpriteBatch');

var LightContainer = module.exports = function() {
	PIXI.DisplayObjectContainer.call(this);
	this.graphics = new PIXI.Graphics();
	this.visibility = new Visibility();



	this.size = {
		width: 1024,
		height: 768
	};

	this.diffuseTexture = new PIXI.RenderTexture(this.size.width, this.size.height);
	this.normalTexture = new PIXI.RenderTexture(this.size.width, this.size.height);

	this.spritebatch = new LightSpriteBatch(this.diffuseTexture.textureBuffer, this.normalTexture.textureBuffer);

	this.diff = new PIXI.Sprite(this.diffuseTexture);
	this.norm = new PIXI.Sprite(this.normalTexture);
	this.norm.x = 2505;
}

LightContainer.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
LightContainer.prototype.constructor = LightContainer;

LightContainer.prototype.drawLight = function(cx, cy, color, alpha) {
	if (color == null) {
		color = 0x000000;
	}
	if (alpha == null) {
		alpha = 1.0;
	}

	var visibility = this.visibility;
	var c = this.graphics;

	visibility.setLightLocation(cx, cy);
	visibility.sweep();

	c.beginFill(color, alpha);
	for (var i = 0, l = visibility.output.length; i < l; i += 2) {
		var p1 = visibility.output[i];
		var p2 = visibility.output[i + 1];
		c.moveTo(p1.x, p1.y)
		c.lineTo(p2.x, p2.y)
		c.lineTo(cx, cy)
		c.lineTo(p1.x, p1.y)
	}
	c.endFill();
};

LightContainer.prototype.loadMap = function(walls, blocks) {
	if (walls == null) {
		walls = [];
	}
	if (blocks == null) {
		blocks = [];
	}
	/*
	blocks = blocks.map(function(block) {
		return {
			p1: {
				x: block[0],
				y: block[1]
			},
			p2: {
				x: wall[2],
				y: wall[3]
			}
		};
	});*/
	walls = walls.map(function(wall) {
		return {
			p1: {
				x: wall[0],
				y: wall[1]
			},
			p2: {
				x: wall[2],
				y: wall[3]
			}
		};
	});
	this.visibility.loadMap(30, -2000, blocks, walls);
};

////

LightContainer.prototype._renderWebGL = function(renderSession) {
	if (!this.spritebatch.gl) {
		this.spritebatch.setContext(renderSession.gl);
		this.diff.shader = new NormalMapFilter(this.normalTexture);
	}
	renderSession.shaderManager.setShader(renderSession.shaderManager.defaultShader);

	renderSession.spriteBatch.stop();

	var i = [];
	this.collectSprites(this, i);

	this.spritebatch.begin(renderSession);
	for (var r = 0; r < i.length; r++) {
		this.spritebatch.render(i[r]);
	}
	this.spritebatch.end();

	renderSession.spriteBatch.start();
};

LightContainer.prototype.collectSprites = function(obj, collection) {
	obj.anchor && collection.push(obj);
	for (var i = 0; i < obj.children.length; i++) {
		this.collectSprites(obj.children[i], collection);
	}
};

LightContainer.prototype.resize = function(w, h) {
	this.size.width = w;
	this.size.height = h;
	this.diffuseTexture.resize(w, h);
	this.normalTexture.resize(w, h);
	this.occludersFBO.resize(w, h);
};
