(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./demo.src.js":[function(require,module,exports){
'use strict';

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

var walls = mazeWalls.map(function(wall) {
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

var visibility = new Visibility();

visibility.loadMap(400, -20000, [], walls);


var cx = 200,
	cy = 200;

visibility.setLightLocation(cx, cy);
visibility.sweep();



var c = new PIXI.Graphics();
stage.addChild(c);

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


if (visibility.open.toArray) {
	console.log("open", visibility.open.toArray());
}
console.log("open", visibility.open);
console.log("out", visibility.output);
console.log("end", visibility.endpoints);
console.log("segments", visibility.segments);


requestAnimFrame(animate);
function animate() {
	requestAnimFrame(animate);

	stats.begin();
	c.clear();

	for (var i = 0, l = mazeLights.length; i < l; i++) {
		var p = mazeLights[i];
		c.beginFill(p[2], 0.15);
		drawLight(c, visibility, p[0], p[1]);
		c.endFill();

		c.beginFill(0xffcc00);
		c.drawCircle(p[0], p[1], 3);
		c.endFill();
	}

	c.beginFill(0xffcc00, 0.3);
	drawLight(c, visibility, cx, cy);
	c.endFill();

	c.beginFill(0xffcc00);
	c.drawCircle(visibility.center.x, visibility.center.y, 8);
	c.endFill();

	drawSegments(c, visibility);

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

},{}]},{},["./demo.src.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZW1vLnNyYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBzdGF0cyA9IG5ldyBTdGF0cygpO1xuXG5zdGF0cy5zZXRNb2RlKDApO1xuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG5zdGF0cy5kb21FbGVtZW50LnN0eWxlLnJpZ2h0ID0gJzBweCc7XG5zdGF0cy5kb21FbGVtZW50LnN0eWxlLnRvcCA9ICcwcHgnO1xuXG5cbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc3RhdHMuZG9tRWxlbWVudCk7XG5cbnZhciBzdGFnZSA9IG5ldyBQSVhJLlN0YWdlKCAvKjB4NjZGRjk5Ki8gKTtcbnZhciByZW5kZXJlciA9IFBJWEkuYXV0b0RldGVjdFJlbmRlcmVyKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQsIHtcblx0Ly8gdmlldzogLi4uLFxuXHR0cmFuc3BhcmVudDogZmFsc2UsXG5cdGFudGlhbGlhczogdHJ1ZSxcblx0cHJlc2VydmVkRHJhd2luZ0J1ZmZlcjogZmFsc2UsXG5cdHJlc29sdXRpb246IDEsXG59KTtcbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQocmVuZGVyZXIudmlldyk7XG5cblxudmFyIG1hemVXYWxscyA9IFtcblx0Ly8gSG9yaXpvbnRhbCB3YWxsc1xuXHRbMjAsIDYwLCA2MCwgNjBdLCBbNjAsIDYwLCAxMDAsIDYwXSwgWzEwMCwgNjAsIDE0MCwgNjBdLCBbMTQwLCA2MCwgMTgwLCA2MF0sXG5cdFs2MCwgMTAwLCAxMDAsIDEwMF0sIFsxMDAsIDEwMCwgMTQwLCAxMDBdLFxuXHRbMjYwLCAxMDAsIDMwMCwgMTAwXSwgWzMwMCwgMTAwLCAzNDAsIDEwMF0sXG5cdFsxNDAsIDE0MCwgMTgwLCAxNDBdLCBbMTgwLCAxNDAsIDIyMCwgMTQwXSxcblx0WzMwMCwgMTQwLCAzNDAsIDE0MF0sIFszNDAsIDE0MCwgMzgwLCAxNDBdLFxuXHRbMTQwLCAyNjAsIDE4MCwgMjYwXSwgWzE4MCwgMjYwLCAyMjAsIDI2MF0sXG5cdFsyMTUsIDI0MCwgMjI1LCAyNDBdLCBbMjYwLCAyMjAsIDI3NSwgMjIwXSxcblx0Ly8gVmVydGljYWwgd2FsbHNcblx0WzMwMCwgMjAsIDMwMCwgNjBdLFxuXHRbMTgwLCA2MCwgMTgwLCAxMDBdLCBbMTgwLCAxMDAsIDE4MCwgMTQwXSxcblx0WzI2MCwgNjAsIDI2MCwgMTAwXSwgWzM0MCwgNjAsIDM0MCwgMTAwXSxcblx0WzE4MCwgMTQwLCAxODAsIDE4MF0sIFsxODAsIDE4MCwgMTgwLCAyMjBdLFxuXHRbMjYwLCAxNDAsIDI2MCwgMTgwXSwgWzI2MCwgMTgwLCAyNjAsIDIyMF0sXG5cdFsxNDAsIDIyMCwgMTQwLCAyNjBdLCBbMTQwLCAyNjAsIDE0MCwgMzAwXSwgWzE0MCwgMzAwLCAxNDAsIDM0MF0sXG5cdFsyMjAsIDI0MCwgMjIwLCAyNjBdLCBbMjIwLCAzNDAsIDIyMCwgMzgwXSxcblx0Ly8gV2FsbCB3aXRoIGhvbGVzXG5cdFsyMjAsIDI2MCwgMjIwLCAyNjhdLCBbMjIwLCAyNzAsIDIyMCwgMjc4XSwgWzIyMCwgMjgwLCAyMjAsIDI4OF0sXG5cdFsyMjAsIDI5MCwgMjIwLCAyOThdLCBbMjIwLCAzMDAsIDIyMCwgMzA4XSwgWzIyMCwgMzEwLCAyMjAsIDMxOF0sXG5cdFsyMjAsIDMyMCwgMjIwLCAzMjhdLCBbMjIwLCAzMzAsIDIyMCwgMzM4XSxcblx0Ly8gUGlsbGFyc1xuXHRbMjEwLCA3MCwgMjMwLCA3MF0sIFsyMzAsIDcwLCAyMzAsIDkwXSwgWzIzMCwgOTAsIDIyMiwgOTBdLCBbMjE4LCA5MCwgMjEwLCA5MF0sIFsyMTAsIDkwLCAyMTAsIDcwXSxcblx0WzUxLCAyNDAsIDYwLCAyMzFdLCBbNjAsIDIzMSwgNjksIDI0MF0sIFs2OSwgMjQwLCA2MCwgMjQ5XSwgWzYwLCAyNDksIDUxLCAyNDBdLFxuXHQvLyBDdXJ2ZXNcblx0WzIwLCAxNDAsIDUwLCAxNDBdLCBbNTAsIDE0MCwgODAsIDE1MF0sIFs4MCwgMTUwLCA5NSwgMTgwXSwgWzk1LCAxODAsIDEwMCwgMjIwXSxcblx0WzEwMCwgMjIwLCAxMDAsIDI2MF0sIFsxMDAsIDI2MCwgOTUsIDMwMF0sIFs5NSwgMzAwLCA4MCwgMzMwXSxcblx0WzMwMCwgMTgwLCAzMjAsIDIyMF0sIFszMjAsIDIyMCwgMzIwLCAyNDBdLCBbMzIwLCAyNDAsIDMxMCwgMjYwXSxcblx0WzMxMCwgMjYwLCAzMDUsIDI3NV0sIFszMDUsIDI3NSwgMzAwLCAzMDBdLCBbMzAwLCAzMDAsIDMwMCwgMzEwXSxcblx0WzMwMCwgMzEwLCAzMDUsIDMzMF0sIFszMDUsIDMzMCwgMzMwLCAzNTBdLCBbMzMwLCAzNTAsIDM2MCwgMzYwXSxcbl07XG5cbnZhciBtYXplTGlnaHRzID0gW1xuXHQvLyB0b3AgaGFsbHdheVxuXHRbNDAsIDU5XSwgWzgwLCAyMV0sIFsxMjAsIDU5XSwgWzE2MCwgMjFdLFxuXHRbMjk3LCAyM10sIFszMDMsIDIzXSwgWzM3NywgMjNdLFxuXHRbMjYzLCA5N10sIFszMzcsIDk3XSxcblx0Ly8gdXBwZXIgbGVmdCByb29tXG5cdFsyMywgNjNdLCBbMTc3LCA2M10sIFsyMywgMTM3XSwgWzE3NywgMTM3XSxcblx0Ly8gcm91bmQgcm9vbSBvbiBsZWZ0XG5cdFs0NSwgMjM1XSwgWzQ1LCAyNDBdLCBbNDUsIDI0NV0sXG5cdC8vIHVwcGVyIHBpbGxhclxuXHRbMjIwLCA4MF0sXG5cdC8vIGhhbGx3YXkgb24gbGVmdFxuXHRbMTIwLCAyODBdLFxuXHQvLyBuZXh0IHRvIHdhbGwgbm90Y2hcblx0WzIxNywgMjQzXSxcblx0Ly8gaW5zaWRlIHJvb20gd2l0aCBob2xlc1xuXHRbMTgwLCAyOTBdLCBbMTgwLCAzMjBdLCBbMTgwLCAzNTBdLFxuXHQvLyByaWdodCBjdXJ2ZWQgcm9vbVxuXHRbMzIwLCAzMjBdLFxuXHQvLyByaWdodCBoYWxsd2F5XG5cdFsyNzAsIDE3MF0sXG5dO1xuXG5mb3IgKHZhciBpID0gMCwgbCA9IG1hemVMaWdodHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdHZhciBjb2xvciA9IE1hdGgucmFuZG9tKCkgKiAweGZmZmZmZjtcblx0bWF6ZUxpZ2h0c1tpXS5wdXNoKGNvbG9yIHwgMCk7XG59XG5cbnZhciB3YWxscyA9IG1hemVXYWxscy5tYXAoZnVuY3Rpb24od2FsbCkge1xuXHRyZXR1cm4ge1xuXHRcdHAxOiB7XG5cdFx0XHR4OiB3YWxsWzBdLFxuXHRcdFx0eTogd2FsbFsxXVxuXHRcdH0sXG5cdFx0cDI6IHtcblx0XHRcdHg6IHdhbGxbMl0sXG5cdFx0XHR5OiB3YWxsWzNdXG5cdFx0fVxuXHR9O1xufSk7XG5cbnZhciB2aXNpYmlsaXR5ID0gbmV3IFZpc2liaWxpdHkoKTtcblxudmlzaWJpbGl0eS5sb2FkTWFwKDQwMCwgLTIwMDAwLCBbXSwgd2FsbHMpO1xuXG5cbnZhciBjeCA9IDIwMCxcblx0Y3kgPSAyMDA7XG5cbnZpc2liaWxpdHkuc2V0TGlnaHRMb2NhdGlvbihjeCwgY3kpO1xudmlzaWJpbGl0eS5zd2VlcCgpO1xuXG5cblxudmFyIGMgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuc3RhZ2UuYWRkQ2hpbGQoYyk7XG5cbnJlbmRlcmVyLnZpZXcuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0Y3ggPSBldmVudC5jbGllbnRYO1xuXHRjeSA9IGV2ZW50LmNsaWVudFk7XG59KTtcblxuLypcbiAgIFVzYWdlOlxuICAgICAgbmV3IFZpc2liaWxpdHkoKVxuICAgV2hlbmV2ZXIgbWFwIGRhdGEgY2hhbmdlczpcbiAgICAgIGxvYWRNYXBcbiAgIFdoZW5ldmVyIGxpZ2h0IHNvdXJjZSBjaGFuZ2VzOlxuICAgICAgc2V0TGlnaHRMb2NhdGlvblxuICAgVG8gY2FsY3VsYXRlIHRoZSBhcmVhOlxuICAgICAgc3dlZXBcblx0ICAqL1xuXG5cbmlmICh2aXNpYmlsaXR5Lm9wZW4udG9BcnJheSkge1xuXHRjb25zb2xlLmxvZyhcIm9wZW5cIiwgdmlzaWJpbGl0eS5vcGVuLnRvQXJyYXkoKSk7XG59XG5jb25zb2xlLmxvZyhcIm9wZW5cIiwgdmlzaWJpbGl0eS5vcGVuKTtcbmNvbnNvbGUubG9nKFwib3V0XCIsIHZpc2liaWxpdHkub3V0cHV0KTtcbmNvbnNvbGUubG9nKFwiZW5kXCIsIHZpc2liaWxpdHkuZW5kcG9pbnRzKTtcbmNvbnNvbGUubG9nKFwic2VnbWVudHNcIiwgdmlzaWJpbGl0eS5zZWdtZW50cyk7XG5cblxucmVxdWVzdEFuaW1GcmFtZShhbmltYXRlKTtcbmZ1bmN0aW9uIGFuaW1hdGUoKSB7XG5cdHJlcXVlc3RBbmltRnJhbWUoYW5pbWF0ZSk7XG5cblx0c3RhdHMuYmVnaW4oKTtcblx0Yy5jbGVhcigpO1xuXG5cdGZvciAodmFyIGkgPSAwLCBsID0gbWF6ZUxpZ2h0cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0XHR2YXIgcCA9IG1hemVMaWdodHNbaV07XG5cdFx0Yy5iZWdpbkZpbGwocFsyXSwgMC4xNSk7XG5cdFx0ZHJhd0xpZ2h0KGMsIHZpc2liaWxpdHksIHBbMF0sIHBbMV0pO1xuXHRcdGMuZW5kRmlsbCgpO1xuXG5cdFx0Yy5iZWdpbkZpbGwoMHhmZmNjMDApO1xuXHRcdGMuZHJhd0NpcmNsZShwWzBdLCBwWzFdLCAzKTtcblx0XHRjLmVuZEZpbGwoKTtcblx0fVxuXG5cdGMuYmVnaW5GaWxsKDB4ZmZjYzAwLCAwLjMpO1xuXHRkcmF3TGlnaHQoYywgdmlzaWJpbGl0eSwgY3gsIGN5KTtcblx0Yy5lbmRGaWxsKCk7XG5cblx0Yy5iZWdpbkZpbGwoMHhmZmNjMDApO1xuXHRjLmRyYXdDaXJjbGUodmlzaWJpbGl0eS5jZW50ZXIueCwgdmlzaWJpbGl0eS5jZW50ZXIueSwgOCk7XG5cdGMuZW5kRmlsbCgpO1xuXG5cdGRyYXdTZWdtZW50cyhjLCB2aXNpYmlsaXR5KTtcblxuXHRyZW5kZXJlci5yZW5kZXIoc3RhZ2UpO1xuXHRzdGF0cy5lbmQoKTtcbn1cblxuZnVuY3Rpb24gZHJhd0xpZ2h0KGMsIHZpc2liaWxpdHksIGN4LCBjeSwgYTEsIGEyKSB7XG5cdHZpc2liaWxpdHkuc2V0TGlnaHRMb2NhdGlvbihjeCwgY3kpO1xuXHR2aXNpYmlsaXR5LnN3ZWVwKCk7XG5cblx0Zm9yICh2YXIgaSA9IDAsIGwgPSB2aXNpYmlsaXR5Lm91dHB1dC5sZW5ndGg7IGkgPCBsOyBpICs9IDIpIHtcblx0XHR2YXIgcDEgPSB2aXNpYmlsaXR5Lm91dHB1dFtpXTtcblx0XHR2YXIgcDIgPSB2aXNpYmlsaXR5Lm91dHB1dFtpICsgMV07XG5cblx0XHRjLm1vdmVUbyhwMS54LCBwMS55KVxuXHRcdGMubGluZVRvKHAyLngsIHAyLnkpXG5cdFx0Yy5saW5lVG8odmlzaWJpbGl0eS5jZW50ZXIueCwgdmlzaWJpbGl0eS5jZW50ZXIueSlcblx0XHRjLmxpbmVUbyhwMS54LCBwMS55KVxuXHR9XG59XG5cblxuZnVuY3Rpb24gZHJhd1NlZ21lbnRzKGcsIHZpc2liaWxpdHkpIHtcblx0dmFyIG1heEFuZ2xlID0gTWF0aC5QSTtcblxuXHRnLmxpbmVTdHlsZSgzLCAweGNjMDAwMCwgMS4wKTtcblxuXHRmb3IgKHZhciBpID0gMCwgbCA9IHZpc2liaWxpdHkub3Blbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0XHR2YXIgc2VnbWVudCA9IHZpc2liaWxpdHkub3BlbltpXTtcblx0XHRnLm1vdmVUbyhzZWdtZW50LnAxLngsIHNlZ21lbnQucDEueSk7XG5cdFx0Zy5saW5lVG8oc2VnbWVudC5wMi54LCBzZWdtZW50LnAyLnkpO1xuXHR9XG5cblx0Zy5saW5lU3R5bGUoMiwgMHgwMDAwMDAsIDEuMCk7XG5cdGZvciAodmFyIGkgPSAwLCBsID0gdmlzaWJpbGl0eS5zZWdtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0XHR2YXIgc2VnbWVudCA9IHZpc2liaWxpdHkuc2VnbWVudHNbaV07XG5cdFx0Zy5tb3ZlVG8oc2VnbWVudC5wMS54LCBzZWdtZW50LnAxLnkpO1xuXHRcdGcubGluZVRvKHNlZ21lbnQucDIueCwgc2VnbWVudC5wMi55KTtcblx0fVxuXG5cdGcubGluZVN0eWxlKDAsIDB4MDAwMDAwLCAxLjApO1xufVxuIl19
