'use strict';

var Visibility = require('./visibility');

var LightContainer = module.exports = function() {
	PIXI.DisplayObjectContainer.call(this);
	this.graphics = new PIXI.Graphics();
	this.visibility = new Visibility();
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

LightContainer.prototype.loadMap = function(walls) {
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
	this.visibility.loadMap(30, -2000, [], walls);
};
