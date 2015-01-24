'use strict';

var LightContainer = require('.');

var stats = new Stats();

stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.right = '0px';
stats.domElement.style.top = '0px';


document.body.appendChild(stats.domElement);

var stage = new PIXI.Stage( /*0x66FF99*/ );
var renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {
	// view: ...,
	transparent: false,
	antialias: true,
	preservedDrawingBuffer: false,
	resolution: 1,
});
document.body.appendChild(renderer.view);


var mazeWalls = [
	// Horizontal walls
	[20, 60, 60, 60], [60, 60, 100, 60], [100, 60, 140, 60], [140, 60, 180, 60],
	[60, 100, 100, 100], [100, 100, 140, 100],
	[260, 100, 300, 100], [300, 100, 340, 100],
	[140, 140, 180, 140], [180, 140, 220, 140],
	[300, 140, 340, 140], [340, 140, 380, 140],
	[140, 260, 180, 260], [180, 260, 220, 260],
	[215, 240, 225, 240], [260, 220, 275, 220],
	// Vertical walls
	[300, 20, 300, 60],
	[180, 60, 180, 100], [180, 100, 180, 140],
	[260, 60, 260, 100], [340, 60, 340, 100],
	[180, 140, 180, 180], [180, 180, 180, 220],
	[260, 140, 260, 180], [260, 180, 260, 220],
	[140, 220, 140, 260], [140, 260, 140, 300], [140, 300, 140, 340],
	[220, 240, 220, 260], [220, 340, 220, 380],
	// Wall with holes
	[220, 260, 220, 268], [220, 270, 220, 278], [220, 280, 220, 288],
	[220, 290, 220, 298], [220, 300, 220, 308], [220, 310, 220, 318],
	[220, 320, 220, 328], [220, 330, 220, 338],
	// Pillars
	[210, 70, 230, 70], [230, 70, 230, 90], [230, 90, 222, 90], [218, 90, 210, 90], [210, 90, 210, 70],
	[51, 240, 60, 231], [60, 231, 69, 240], [69, 240, 60, 249], [60, 249, 51, 240],
	// Curves
	[20, 140, 50, 140], [50, 140, 80, 150], [80, 150, 95, 180], [95, 180, 100, 220],
	[100, 220, 100, 260], [100, 260, 95, 300], [95, 300, 80, 330],
	[300, 180, 320, 220], [320, 220, 320, 240], [320, 240, 310, 260],
	[310, 260, 305, 275], [305, 275, 300, 300], [300, 300, 300, 310],
	[300, 310, 305, 330], [305, 330, 330, 350], [330, 350, 360, 360],
];

var mazeLights = [
	// top hallway
	[40, 59], [80, 21], [120, 59], [160, 21],
	[297, 23], [303, 23], [377, 23],
	[263, 97], [337, 97],
	// upper left room
	[23, 63], [177, 63], [23, 137], [177, 137],
	// round room on left
	[45, 235], [45, 240], [45, 245],
	// upper pillar
	[220, 80],
	// hallway on left
	[120, 280],
	// next to wall notch
	[217, 243],
	// inside room with holes
	[180, 290], [180, 320], [180, 350],
	// right curved room
	[320, 320],
	// right hallway
	[270, 170],
];

for (var i = 0, l = mazeLights.length; i < l; i++) {
	var color = Math.random() * 0xffffff;
	mazeLights[i].push(color | 0);
}

var container = new LightContainer();
stage.addChild(container.graphics);
stage.addChild(container.norm);
stage.addChild(container.diff);
stage.addChild(container);

container.loadMap(mazeWalls);

var assetsToLoader = ['presentColours.json', 'presentNormals.json', 'couch.jpg', 'counch_norm.jpg'];
var loader = new PIXI.AssetLoader(assetsToLoader);
loader.onComplete = onAssetsLoaded;
loader.load();

function onAssetsLoaded() {
	var diff = 'box_diff02.png';
	var norm = 'box_norm02.png';

	var sprite = PIXI.Sprite.fromImage(diff);
	sprite.x = 560;
	sprite.y = 160;
	sprite.anchor.x = sprite.anchor.y = 0.5;
	sprite.scale.x = sprite.scale.y = 1; //0.5;
	sprite.normalMap = PIXI.Texture.fromImage(norm);

	console.log(sprite.texture.crop, sprite.texture.trim);

	container.addChild(sprite);


	var cx = 200,
		cy = 200,
		visibility = container.visibility,
		c = container.graphics;

	renderer.view.addEventListener('mousemove', function(event) {
		cx = event.clientX;
		cy = event.clientY;
	});

	/*
	   Usage:
	      new Visibility()
	   Whenever map data changes:
	      loadMap
	   Whenever light source changes:
	      setLightLocation
	   To calculate the area:
	      sweep
		  */


	requestAnimFrame(animate);
	function animate() {
		requestAnimFrame(animate);

		stats.begin();
		c.clear();

		sprite.rotation += 0.01;

		container.loadMap(mazeWalls.concat(bounds(sprite, 15)), [])

		for (var i = 0, l = mazeLights.length; i < l; i++) {
			var p = mazeLights[i];
			container.drawLight(i + 1, p[0], p[1], p[2], 0.15)

			c.beginFill(0xffcc00);
			c.drawCircle(p[0], p[1], 3);
			c.endFill();
		}

		container.drawLight(0, cx, cy, 0xcc0000, 0.3)

		c.beginFill(0xffcc00);
		c.drawCircle(visibility.center.x, visibility.center.y, 8);
		c.endFill();

		drawSegments(c, container.visibility);


		renderer.render(stage);
		stats.end();
	}
}

function drawLight(c, visibility, cx, cy, a1, a2) {
	visibility.setLightLocation(cx, cy);
	visibility.sweep();

	for (var i = 0, l = visibility.output.length; i < l; i += 2) {
		var p1 = visibility.output[i];
		var p2 = visibility.output[i + 1];

		c.moveTo(p1.x, p1.y)
		c.lineTo(p2.x, p2.y)
		c.lineTo(visibility.center.x, visibility.center.y)
		c.lineTo(p1.x, p1.y)
	}
}


function drawSegments(g, visibility) {
	var maxAngle = Math.PI;

	g.lineStyle(3, 0xcc0000, 1.0);

	for (var i = 0, l = visibility.open.length; i < l; i++) {
		var segment = visibility.open[i];
		g.moveTo(segment.p1.x, segment.p1.y);
		g.lineTo(segment.p2.x, segment.p2.y);
	}

	g.lineStyle(2, 0x000000, 1.0);
	for (var i = 0, l = visibility.segments.length; i < l; i++) {
		var segment = visibility.segments[i];
		g.moveTo(segment.p1.x, segment.p1.y);
		g.lineTo(segment.p2.x, segment.p2.y);
	}

	g.lineStyle(0, 0x000000, 1.0);
}

function bounds(obj, n) {
	var w = obj.width - n;
	var h = obj.height - n;
	var crop = obj.texture.crop;
	if (crop) {
		w = crop.width - n;
		h = crop.height - n;
	}
	var x = w * obj.anchor.x,
		y = h * obj.anchor.y;

	var p1 = obj.toGlobal({
		x: x,
		y: y
	});
	var p2 = obj.toGlobal({
		x: x - w,
		y: y
	});
	var p3 = obj.toGlobal({
		x: x,
		y: y - h
	});
	var p4 = obj.toGlobal({
		x: x - w,
		y: y - h
	});

	return [
		[p1.x, p1.y, p2.x, p2.y],
		[p1.x, p1.y, p3.x, p3.y],
		[p4.x, p4.y, p2.x, p2.y],
		[p4.x, p4.y, p3.x, p3.y],
	];
}
