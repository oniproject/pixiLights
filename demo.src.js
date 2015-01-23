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
stage.addChild(container);
stage.addChild(container.graphics);

container.loadMap(mazeWalls);
/*
var visibility = new Visibility();

visibility.loadMap(400, -20000, [], walls);
*/


var cx = 200,
	cy = 200;
/*
var c = new PIXI.Graphics();
stage.addChild(c);
*/
var visibility = container.visibility;
var c = container.graphics;

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

	for (var i = 0, l = mazeLights.length; i < l; i++) {
		var p = mazeLights[i];
		container.drawLight(p[0], p[1], p[2], 0.15)

		c.beginFill(0xffcc00);
		c.drawCircle(p[0], p[1], 3);
		c.endFill();
	}

	container.drawLight(cx, cy, 0xffcc00, 0.3)

	c.beginFill(0xffcc00);
	c.drawCircle(visibility.center.x, visibility.center.y, 8);
	c.endFill();

	drawSegments(c, container.visibility);

	renderer.render(stage);
	stats.end();
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
