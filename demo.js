(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./demo.src.js":[function(require,module,exports){
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

},{".":"/home/lain/gocode/src/oniproject/pixiLights/index.js"}],"/home/lain/gocode/src/oniproject/pixiLights/index.js":[function(require,module,exports){
'use strict';

module.exports = require('./src/LightContainer');

},{"./src/LightContainer":"/home/lain/gocode/src/oniproject/pixiLights/src/LightContainer.js"}],"/home/lain/gocode/src/oniproject/pixiLights/src/LightContainer.js":[function(require,module,exports){
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

},{"./visibility":"/home/lain/gocode/src/oniproject/pixiLights/src/visibility.js"}],"/home/lain/gocode/src/oniproject/pixiLights/src/visibility.js":[function(require,module,exports){
'use strict';

var Block = function() {
	/** @member {Float} */
	this.x = 0.0;
	/** @member {Float} */
	this.y = 0.0;
	/** @member {Float} */
	this.r = 0.0;
}

var Point = function(x, y) {
	/** @member {Float} */
	this.x = x;
	/** @member {Float} */
	this.y = y;
}

var EndPoint = function(x, y) {
	/** @member {Float} */
	this.x = x;
	/** @member {Float} */
	this.y = y;
	/** @member {Bool} */
	this.begin = false;
	/** @member {Segment} */
	this.segment = null;
	/** @member {Float} */
	this.angle = 0.0;
	/** @member {Bool} */
	this.visualize = false;
}

var Segment = function() {
	/** @member {EndPoint} */
	this.p1 = new EndPoint(0, 0);
	/** @member {EndPoint} */
	this.p2 = new EndPoint(0, 0);
	/** @member {Float} */
	this.d = 0.0;
}

/** @constructor */
var Visibility = module.exports = function() {
	// These represent the map and the light location:
	/** @member {Array} - Array of Segment */
	this.segments = [];
	/** @member {Array} - Array of EndPoint */
	this.endpoints = [];
	/** @member {Point} */
	this.center = new Point(0, 0);

	// These are currently 'open' line segments, sorted so that the nearest
	// segment is first. It's used only during the sweep algorithm, and exposed
	// as a public field here so that the demo can display it.
	/** @member {Array} - Array of Segment*/
	this.open = new de_polygonal_ds_DLL();

	// The output is a series of points that forms a visible area polygon
	/** @member {Array} - Array of Point*/
	this.output = [];

	// For the demo, keep track of wall intersections
	/** @member {Array} - Array of Array of Point*/
	this.demo_intersectionsDetected = [];
};

/**
 * Helper: comparison function for sorting points by angle
 * @param {EndPoint} a
 * @param {EndPoint} b
 * @return {Int}
 * @static
 * @private
 */
Visibility._endpoint_compare = function(a, b) {
	// Traverse in angle order
	if (a.angle > b.angle) return 1;
	if (a.angle < b.angle) return -1;
	// But for ties (common), we want Begin nodes before End nodes
	if (!a.begin && b.begin) return 1;
	if (a.begin && !b.begin) return -1;
	return 0;
};

/**
 * Helper: leftOf(segment, point) returns true if point is "left"
 * of segment treated as a vector. Note that this assumes a 2D
 * coordinate system in which the Y axis grows downwards, which
 * matches common 2D graphics libraries, but is the opposite of
 * the usual convention from mathematics and in 3D graphics
 * libraries.
 * @param {Segment} s
 * @param {Point} p
 * @return {Bool}
 * @static
 * @private
 */
Visibility.leftOf = function(s, p) {
	// This is based on a 3d cross product, but we don't need to
	// use z coordinate inputs (they're 0), and we only need the
	// sign. If you're annoyed that cross product is only defined
	// in 3d, see "outer product" in Geometric Algebra.
	// <http://en.wikipedia.org/wiki/Geometric_algebra>
	var cross = (s.p2.x - s.p1.x) * (p.y - s.p1.y) - (s.p2.y - s.p1.y) * (p.x - s.p1.x);
	return cross < 0;
	// Also note that this is the naive version of the test and
	// isn't numerically robust. See
	// <https://github.com/mikolalysenko/robust-arithmetic> for a
	// demo of how this fails when a point is very close to the
	// line.
};

/**
 * Return p*(1-f) + q*f
 * @param {Point} p
 * @param {Point} q
 * @param {Float} f
 * @return {Point}
 * @private
 * @static
 */
Visibility.interpolate = function(p, q, f) {
	return new Point(p.x * (1 - f) + q.x * f, p.y * (1 - f) + q.y * f);
};

Visibility.prototype = {
	/**
	 * Helper function to construct segments along the outside perimeter
	 * @param {Int} size
	 * @param {Int} margin
	 * @private
	 */
	loadEdgeOfMap: function(size, margin) {
		this.addSegment(margin, margin, margin, size - margin);
		this.addSegment(margin, size - margin, size - margin, size - margin);
		this.addSegment(size - margin, size - margin, size - margin, margin);
		this.addSegment(size - margin, margin, margin, margin);
		// NOTE: if using the simpler distance function (a.d < b.d)
		// then we need segments to be similarly sized, so the edge of
		// the map needs to be broken up into smaller segments.
	},


	/**
	 * Load a set of square blocks, plus any other line segments
	 * @param size
	 * @param margin
	 * @param {Array} blocks - Array of Block
	 * @param {Array} walls - Array of Segment
	 * @public
	 */
	loadMap: function(size, margin, blocks, walls) {
		this.segments = [];
		this.endpoints = [];
		this.loadEdgeOfMap(size, margin);

		for (var i = 0, l = blocks.length; i < l; i++) {
			var block = blocks[i];
			var x = block.x;
			var y = block.y;
			var r = block.r;
			this.addSegment(x - r, y - r, x - r, y + r);
			this.addSegment(x - r, y + r, x + r, y + r);
			this.addSegment(x + r, y + r, x + r, y - r);
			this.addSegment(x + r, y - r, x - r, y - r);
		}

		for (var i = 0, l = walls.length; i < l; i++) {
			var wall = walls[i];
			this.addSegment(wall.p1.x, wall.p1.y, wall.p2.x, wall.p2.y);
		}
	},

	/**
	 * Add a segment, where the first point shows up in the
	 * visualization but the second one does not. (Every endpoint is
	 * part of two segments, but we want to only show them once.)
	 * @param {Float} x1
	 * @param {Float} y1
	 * @param {Float} x2
	 * @param {Float} y2
	 * @private
	 */
	addSegment: function(x1, y1, x2, y2) {
		var segment = new Segment();

		var p1 = new EndPoint(0.0, 0.0);
		p1.segment = segment;
		p1.visualize = true;

		var p2 = new EndPoint(0.0, 0.0);
		p2.segment = segment;
		p2.visualize = false;

		p1.x = x1;
		p1.y = y1;
		p2.x = x2;
		p2.y = y2;

		segment.p1 = p1;
		segment.p2 = p2;
		segment.d = 0.0;

		this.segments.push(segment);
		this.endpoints.push(p1);
		this.endpoints.push(p2);
	},

	/**
	 * Set the light location. Segment and EndPoint data can't be
	 * processed until the light location is known.
	 * @param {Float} x
	 * @param {Float} y
	 * @public
	 */
	setLightLocation: function(x, y) {
		this.center.x = x;
		this.center.y = y;

		for (var i = 0, l = this.segments.length; i < l; i++) {
			var segment = this.segments[i];

			var dx = 0.5 * (segment.p1.x + segment.p2.x) - x;
			var dy = 0.5 * (segment.p1.y + segment.p2.y) - y;
			// NOTE: we only use this for comparison so we can use
			// distance squared instead of distance. However in
			// practice the sqrt is plenty fast and this doesn't
			// really help in this situation.
			segment.d = dx * dx + dy * dy;

			// NOTE: future optimization: we could record the quadrant
			// and the y/x or x/y ratio, and sort by (quadrant,
			// ratio), instead of calling atan2. See
			// <https://github.com/mikolalysenko/compare-slope> for a
			// library that does this. Alternatively, calculate the
			// angles and use bucket sort to get an O(N) sort.
			segment.p1.angle = Math.atan2(segment.p1.y - y, segment.p1.x - x);
			segment.p2.angle = Math.atan2(segment.p2.y - y, segment.p2.x - x);

			var dAngle = segment.p2.angle - segment.p1.angle;
			if (dAngle <= -Math.PI) {
				dAngle += 2 * Math.PI;
			}
			if (dAngle > Math.PI) {
				dAngle -= 2 * Math.PI;
			}
			segment.p1.begin = (dAngle > 0.0);
			segment.p2.begin = !segment.p1.begin;
		}
	},






	/**
	 * Run the algorithm, sweeping over all or part of the circle to find
	 * the visible area, represented as a set of triangles
	 * @public
	 * @param {Float} maxAngle
	 */
	sweep: function(maxAngle) {
		if (maxAngle == null) {
			maxAngle = 999.0;
		}
		this.output = [];
		this.demo_intersectionsDetected = [];
		this.endpoints.sort(Visibility._endpoint_compare, true);
		this.open.clear();
		var beginAngle = 0.0;

		//var open = this.open.toArray();
		//var open = this.open = [];


		// At the beginning of the sweep we want to know which
		// segments are active. The simplest way to do this is to make
		// a pass collecting the segments, and make another pass to
		// both collect and process them. However it would be more
		// efficient to go through all the segments, figure out which
		// ones intersect the initial sweep line, and then sort them.
		for (var pass = 0; pass < 2; pass++) {
			for (var i = 0, l = this.endpoints.length; i < l; i++) {
				var p = this.endpoints[i];

				// Early exit for the visualization to show the sweep process
				if (pass == 1 && p.angle > maxAngle) break;

				var current_old = null;
				if (this.open._size !== 0) {
					current_old = this.open.head.val;
				}

				if (p.begin) {
					// Insert into the right place in the list
					var node = this.open.head;
					//var node = open[0];

					for (; node != null; node = node.next) {
						if (!this._segment_in_front_of(p.segment, node.val, this.center)) {
							break;
						}
					}

					if (!node) {
						this.open.append(p.segment);
					//open.push(p.segment);
					} else {
						this.open.insertBefore(node, p.segment);
						//open.splice(open.indexOf(node), 0, p.segment);
					}
				} else {
					this.open.remove(p.segment);
					//open.splice(open.indexOf(p.segment), 1);
				}

				var current_new = null;
				if (this.open._size !== 0) {
					current_new = this.open.head.val;
				}

				if (current_old != current_new) {
					if (pass == 1) {
						this.addTriangle(beginAngle, p.angle, current_old);
					}
					beginAngle = p.angle;
				}
			}
		}
	},


	/**
	 * Helper: do we know that segment a is in front of b?
	 * Implementation not anti-symmetric (that is to say,
	 * _segment_in_front_of(a, b) != (!_segment_in_front_of(b, a)).
	 * Also note that it only has to work in a restricted set of cases
	 * in the visibility algorithm; I don't think it handles all
	 * cases. See http://www.redblobgames.com/articles/visibility/segment-sorting.html
	 * @param {Segment} a
	 * @param {Segment} b
	 * @param {Point} relativeTo
	 * @return {Bool}
	 * @private
	 */
	_segment_in_front_of: function(a, b, relativeTo) {
		var leftOf = Visibility.leftOf;
		var interpolate = Visibility.interpolate;

		// NOTE: we slightly shorten the segments so that
		// intersections of the endpoints (common) don't count as
		// intersections in this algorithm
		var A1 = leftOf(a, interpolate(b.p1, b.p2, 0.01));
		var A2 = leftOf(a, interpolate(b.p2, b.p1, 0.01));
		var A3 = leftOf(a, relativeTo);
		var B1 = leftOf(b, interpolate(a.p1, a.p2, 0.01));
		var B2 = leftOf(b, interpolate(a.p2, a.p1, 0.01));
		var B3 = leftOf(b, relativeTo);

		// NOTE: this algorithm is probably worthy of a short article
		// but for now, draw it on paper to see how it works. Consider
		// the line A1-A2. If both B1 and B2 are on one side and
		// relativeTo is on the other side, then A is in between the
		// viewer and B. We can do the same with B1-B2: if A1 and A2
		// are on one side, and relativeTo is on the other side, then
		// B is in between the viewer and A.
		if (B1 == B2 && B2 != B3) return true;
		if (A1 == A2 && A2 == A3) return true;
		if (A1 == A2 && A2 != A3) return false;
		if (B1 == B2 && B2 == B3) return false;

		// If A1 != A2 and B1 != B2 then we have an intersection.
		// Expose it for the GUI to show a message. A more robust
		// implementation would split segments at intersections so
		// that part of the segment is in front and part is behind.
		this.demo_intersectionsDetected.push([a.p1, a.p2, b.p1, b.p2]);
		return false;

		// NOTE: previous implementation was a.d < b.d. That's simpler
		// but trouble when the segments are of dissimilar sizes. If
		// you're on a grid and the segments are similarly sized, then
		// using distance will be a simpler and faster implementation.
	},


	/**
	 * @private
	 * @param {Float} angle1
	 * @param {Float} angle2
	 * @param {Segment} segment
	 */
	addTriangle: function(angle1, angle2, segment) {
		var center = this.center;

		var p1 = center;
		var p2 = new Point(center.x + Math.cos(angle1), center.y + Math.sin(angle1));
		var p3 = new Point(0.0, 0.0);
		var p4 = new Point(0.0, 0.0);

		if (segment != null) {
			// Stop the triangle at the intersecting segment
			p3.x = segment.p1.x;
			p3.y = segment.p1.y;
			p4.x = segment.p2.x;
			p4.y = segment.p2.y;
		} else {
			// Stop the triangle at a fixed distance; this probably is
			// not what we want, but it never gets used in the demo
			p3.x = center.x + Math.cos(angle1) * 500;
			p3.y = center.y + Math.sin(angle1) * 500;
			p4.x = center.x + Math.cos(angle2) * 500;
			p4.y = center.y + Math.sin(angle2) * 500;
		}

		var pBegin = this.lineIntersection(p3, p4, p1, p2);

		p2.x = center.x + Math.cos(angle2);
		p2.y = center.y + Math.sin(angle2);
		var pEnd = this.lineIntersection(p3, p4, p1, p2);

		this.output.push(pBegin);
		this.output.push(pEnd);
	},


	/**
	 * @public
	 * @param {Point} p1
	 * @param {Point} p2
	 * @param {Point} p3
	 * @param {Point} p4
	 * @return {Point}
	 */
	lineIntersection: function(p1, p2, p3, p4) {
		// From http://paulbourke.net/geometry/lineline2d/
		var s = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / ((p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y));
		return new Point(p1.x + s * (p2.x - p1.x), p1.y + s * (p2.y - p1.y));
	},

};













var de_polygonal_ds_DLL = function(reservedSize, maxSize) {
	if (maxSize == null) {
		maxSize = -1;
	}
	if (reservedSize == null) {
		reservedSize = 0;
	}
	this.maxSize = -1;
	this._reservedSize = reservedSize;
	this._size = 0;
	this._poolSize = 0;
	this._circular = false;
	this._iterator = null;
	if (reservedSize > 0) {
		this._headPool = this._tailPool = new de_polygonal_ds_DLLNode(null, this);
	}
	this.head = this.tail = null;
	this.key = de_polygonal_ds_HashKey._counter++;
	this.reuseIterator = false;
};
de_polygonal_ds_DLL.prototype = {
	append: function(x) {
		var node = this._getNode(x);
		if (this.tail != null) {
			this.tail.next = node;
			node.prev = this.tail;
		} else {
			this.head = node;
		}
		this.tail = node;
		if (this._circular) {
			this.tail.next = this.head;
			this.head.prev = this.tail;
		}
		this._size++;
		return node;
	},
	insertBefore: function(node, x) {
		var t = this._getNode(x);
		node._insertBefore(t);
		if (node == this.head) {
			this.head = t;
			if (this._circular) {
				this.head.prev = this.tail;
			}
		}
		this._size++;
		return t;
	},
	unlink: function(node) {
		var hook = node.next;
		if (node == this.head) {
			this.head = this.head.next;
			if (this._circular) {
				if (this.head == this.tail) {
					this.head = null;
				} else {
					this.tail.next = this.head;
				}
			}
			if (this.head == null) {
				this.tail = null;
			}
		} else if (node == this.tail) {
			this.tail = this.tail.prev;
			if (this._circular) {
				this.head.prev = this.tail;
			}
			if (this.tail == null) {
				this.head = null;
			}
		}
		node._unlink();
		this._putNode(node);
		this._size--;
		return hook;
	},
	sort: function(compare, useInsertionSort) {
		if (useInsertionSort == null) {
			useInsertionSort = false;
		}
		if (this._size > 1) {
			if (this._circular) {
				this.tail.next = null;
				this.head.prev = null;
			}
			if (compare == null)
				if (useInsertionSort) {
					this.head = this._insertionSortComparable(this.head);
				} else {
					this.head = this._mergeSortComparable(this.head);
			}else if (useInsertionSort) {
				this.head = this._insertionSort(this.head, compare);
			} else {
				this.head = this._mergeSort(this.head, compare);
			}
			if (this._circular) {
				this.tail.next = this.head;
				this.head.prev = this.tail;
			}
		}
	},
	remove: function(x) {
		var s = this._size;
		if (s == 0) return false;
		var node = this.head;
		while (node != null)
		if (node.val == x) {
				node = this.unlink(node);
			} else {
				node = node.next;
		}
		return this._size < s;
	},
	clear: function(purge) {
		if (purge == null) {
			purge = false;
		}
		if (purge || this._reservedSize > 0) {
			var node = this.head;
			var _g1 = 0;
			var _g = this._size;
			while (_g1 < _g) {
				var i = _g1++;
				var next = node.next;
				node.prev = null;
				node.next = null;
				this._putNode(node);
				node = next;
			}
		}
		this.head = this.tail = null;
		this._size = 0;
	},
	iterator: function() {
		if (this.reuseIterator) {
			if (this._iterator == null) {
				if (this._circular) return new de_polygonal_ds_CircularDLLIterator(this); else return new de_polygonal_ds_DLLIterator(this);
			} else {
				this._iterator.reset();
			}
			return this._iterator;
		} else if (this._circular) return new de_polygonal_ds_CircularDLLIterator(this); else return new de_polygonal_ds_DLLIterator(this);
	},
	toArray: function() {
		var a = new Array(this._size);
		var node = this.head;
		var _g1 = 0;
		var _g = this._size;
		while (_g1 < _g) {
			var i = _g1++;
			a[i] = node.val;
			node = node.next;
		}
		return a;
	},
	_mergeSort: function(node, cmp) {
		var h = node;
		var p;
		var q;
		var e;
		var tail = null;
		var insize = 1;
		var nmerges;
		var psize;
		var qsize;
		var i;
		while (true) {
			p = h;
			h = tail = null;
			nmerges = 0;
			while (p != null) {
				nmerges++;
				psize = 0;
				q = p;
				var _g = 0;
				while (_g < insize) {
					var i1 = _g++;
					psize++;
					q = q.next;
					if (q == null) break;
				}
				qsize = insize;
				while (psize > 0 || qsize > 0 && q != null) {
					if (psize == 0) {
						e = q;
						q = q.next;
						qsize--;
					} else if (qsize == 0 || q == null) {
						e = p;
						p = p.next;
						psize--;
					} else if (cmp(q.val, p.val) >= 0) {
						e = p;
						p = p.next;
						psize--;
					} else {
						e = q;
						q = q.next;
						qsize--;
					}
					if (tail != null) {
						tail.next = e;
					} else {
						h = e;
					}
					e.prev = tail;
					tail = e;
				}
				p = q;
			}
			tail.next = null;
			if (nmerges <= 1) break;
			insize <<= 1;
		}
		h.prev = null;
		this.tail = tail;
		return h;
	},
	_insertionSort: function(node, cmp) {
		var h = node;
		var n = h.next;
		while (n != null) {
			var m = n.next;
			var p = n.prev;
			var v = n.val;
			if (cmp(v, p.val) < 0) {
				var i = p;
				while (i.prev != null)
				if (cmp(v, i.prev.val) < 0) {
						i = i.prev;
					} else break;
				if (m != null) {
					p.next = m;
					m.prev = p;
				} else {
					p.next = null;
					this.tail = p;
				}
				if (i == h) {
					n.prev = null;
					n.next = i;
					i.prev = n;
					h = n;
				} else {
					n.prev = i.prev;
					i.prev.next = n;
					n.next = i;
					i.prev = n;
				}
			}
			n = m;
		}
		return h;
	},
	_getNode: function(x) {
		if (this._reservedSize == 0 || this._poolSize == 0) return new de_polygonal_ds_DLLNode(x, this); else {
			var n = this._headPool;
			this._headPool = this._headPool.next;
			this._poolSize--;
			n.next = null;
			n.val = x;
			return n;
		}
	},
	_putNode: function(x) {
		var val = x.val;
		if (this._reservedSize > 0 && this._poolSize < this._reservedSize) {
			this._tailPool = this._tailPool.next = x;
			x.val = null;
			this._poolSize++;
		} else {
			x._list = null;
		}
		return val;
	},
	__class__: de_polygonal_ds_DLL
};

var de_polygonal_ds_DLLIterator = function(f) {
	this._f = f;{
	this._walker = this._f.head;
	this._hook = null;
	this;
	}
};
de_polygonal_ds_DLLIterator.prototype = {
	reset: function() {
		this._walker = this._f.head;
		this._hook = null;
		return this;
	},
	hasNext: function() {
		return this._walker != null;
	},
	next: function() {
		var x = this._walker.val;
		this._hook = this._walker;
		this._walker = this._walker.next;
		return x;
	},
	__class__: de_polygonal_ds_DLLIterator
};

var de_polygonal_ds_CircularDLLIterator = function(f) {
	this._f = f;{
	this._walker = this._f.head;
	this._s = this._f._size;
	this._i = 0;
	this._hook = null;
	this;
	}
};
de_polygonal_ds_CircularDLLIterator.prototype = {
	reset: function() {
		this._walker = this._f.head;
		this._s = this._f._size;
		this._i = 0;
		this._hook = null;
		return this;
	},
	hasNext: function() {
		return this._i < this._s;
	},
	next: function() {
		var x = this._walker.val;
		this._hook = this._walker;
		this._walker = this._walker.next;
		this._i++;
		return x;
	},
	__class__: de_polygonal_ds_CircularDLLIterator
};

var de_polygonal_ds_DLLNode = function(x, list) {
	this.val = x;
	this._list = list;
};
de_polygonal_ds_DLLNode.prototype = {
	_unlink: function() {
		var t = this.next;
		if (this.prev != null) {
			this.prev.next = this.next;
		}
		if (this.next != null) {
			this.next.prev = this.prev;
		}
		this.next = this.prev = null;
		return t;
	},
	_insertAfter: function(node) {
		node.next = this.next;
		node.prev = this;
		if (this.next != null) {
			this.next.prev = node;
		}
		this.next = node;
	},
	_insertBefore: function(node) {
		node.next = this;
		node.prev = this.prev;
		if (this.prev != null) {
			this.prev.next = node;
		}
		this.prev = node;
	},
	__class__: de_polygonal_ds_DLLNode
};


var de_polygonal_ds_HashKey = function() {};
de_polygonal_ds_HashKey._counter = 0;

},{}]},{},["./demo.src.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZW1vLnNyYy5qcyIsImluZGV4LmpzIiwic3JjL0xpZ2h0Q29udGFpbmVyLmpzIiwic3JjL3Zpc2liaWxpdHkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNMQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIExpZ2h0Q29udGFpbmVyID0gcmVxdWlyZSgnLicpO1xuXG52YXIgc3RhdHMgPSBuZXcgU3RhdHMoKTtcblxuc3RhdHMuc2V0TW9kZSgwKTtcbnN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5yaWdodCA9ICcwcHgnO1xuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4JztcblxuXG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHN0YXRzLmRvbUVsZW1lbnQpO1xuXG52YXIgc3RhZ2UgPSBuZXcgUElYSS5TdGFnZSggLyoweDY2RkY5OSovICk7XG52YXIgcmVuZGVyZXIgPSBQSVhJLmF1dG9EZXRlY3RSZW5kZXJlcih3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0LCB7XG5cdC8vIHZpZXc6IC4uLixcblx0dHJhbnNwYXJlbnQ6IGZhbHNlLFxuXHRhbnRpYWxpYXM6IHRydWUsXG5cdHByZXNlcnZlZERyYXdpbmdCdWZmZXI6IGZhbHNlLFxuXHRyZXNvbHV0aW9uOiAxLFxufSk7XG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHJlbmRlcmVyLnZpZXcpO1xuXG5cbnZhciBtYXplV2FsbHMgPSBbXG5cdC8vIEhvcml6b250YWwgd2FsbHNcblx0WzIwLCA2MCwgNjAsIDYwXSwgWzYwLCA2MCwgMTAwLCA2MF0sIFsxMDAsIDYwLCAxNDAsIDYwXSwgWzE0MCwgNjAsIDE4MCwgNjBdLFxuXHRbNjAsIDEwMCwgMTAwLCAxMDBdLCBbMTAwLCAxMDAsIDE0MCwgMTAwXSxcblx0WzI2MCwgMTAwLCAzMDAsIDEwMF0sIFszMDAsIDEwMCwgMzQwLCAxMDBdLFxuXHRbMTQwLCAxNDAsIDE4MCwgMTQwXSwgWzE4MCwgMTQwLCAyMjAsIDE0MF0sXG5cdFszMDAsIDE0MCwgMzQwLCAxNDBdLCBbMzQwLCAxNDAsIDM4MCwgMTQwXSxcblx0WzE0MCwgMjYwLCAxODAsIDI2MF0sIFsxODAsIDI2MCwgMjIwLCAyNjBdLFxuXHRbMjE1LCAyNDAsIDIyNSwgMjQwXSwgWzI2MCwgMjIwLCAyNzUsIDIyMF0sXG5cdC8vIFZlcnRpY2FsIHdhbGxzXG5cdFszMDAsIDIwLCAzMDAsIDYwXSxcblx0WzE4MCwgNjAsIDE4MCwgMTAwXSwgWzE4MCwgMTAwLCAxODAsIDE0MF0sXG5cdFsyNjAsIDYwLCAyNjAsIDEwMF0sIFszNDAsIDYwLCAzNDAsIDEwMF0sXG5cdFsxODAsIDE0MCwgMTgwLCAxODBdLCBbMTgwLCAxODAsIDE4MCwgMjIwXSxcblx0WzI2MCwgMTQwLCAyNjAsIDE4MF0sIFsyNjAsIDE4MCwgMjYwLCAyMjBdLFxuXHRbMTQwLCAyMjAsIDE0MCwgMjYwXSwgWzE0MCwgMjYwLCAxNDAsIDMwMF0sIFsxNDAsIDMwMCwgMTQwLCAzNDBdLFxuXHRbMjIwLCAyNDAsIDIyMCwgMjYwXSwgWzIyMCwgMzQwLCAyMjAsIDM4MF0sXG5cdC8vIFdhbGwgd2l0aCBob2xlc1xuXHRbMjIwLCAyNjAsIDIyMCwgMjY4XSwgWzIyMCwgMjcwLCAyMjAsIDI3OF0sIFsyMjAsIDI4MCwgMjIwLCAyODhdLFxuXHRbMjIwLCAyOTAsIDIyMCwgMjk4XSwgWzIyMCwgMzAwLCAyMjAsIDMwOF0sIFsyMjAsIDMxMCwgMjIwLCAzMThdLFxuXHRbMjIwLCAzMjAsIDIyMCwgMzI4XSwgWzIyMCwgMzMwLCAyMjAsIDMzOF0sXG5cdC8vIFBpbGxhcnNcblx0WzIxMCwgNzAsIDIzMCwgNzBdLCBbMjMwLCA3MCwgMjMwLCA5MF0sIFsyMzAsIDkwLCAyMjIsIDkwXSwgWzIxOCwgOTAsIDIxMCwgOTBdLCBbMjEwLCA5MCwgMjEwLCA3MF0sXG5cdFs1MSwgMjQwLCA2MCwgMjMxXSwgWzYwLCAyMzEsIDY5LCAyNDBdLCBbNjksIDI0MCwgNjAsIDI0OV0sIFs2MCwgMjQ5LCA1MSwgMjQwXSxcblx0Ly8gQ3VydmVzXG5cdFsyMCwgMTQwLCA1MCwgMTQwXSwgWzUwLCAxNDAsIDgwLCAxNTBdLCBbODAsIDE1MCwgOTUsIDE4MF0sIFs5NSwgMTgwLCAxMDAsIDIyMF0sXG5cdFsxMDAsIDIyMCwgMTAwLCAyNjBdLCBbMTAwLCAyNjAsIDk1LCAzMDBdLCBbOTUsIDMwMCwgODAsIDMzMF0sXG5cdFszMDAsIDE4MCwgMzIwLCAyMjBdLCBbMzIwLCAyMjAsIDMyMCwgMjQwXSwgWzMyMCwgMjQwLCAzMTAsIDI2MF0sXG5cdFszMTAsIDI2MCwgMzA1LCAyNzVdLCBbMzA1LCAyNzUsIDMwMCwgMzAwXSwgWzMwMCwgMzAwLCAzMDAsIDMxMF0sXG5cdFszMDAsIDMxMCwgMzA1LCAzMzBdLCBbMzA1LCAzMzAsIDMzMCwgMzUwXSwgWzMzMCwgMzUwLCAzNjAsIDM2MF0sXG5dO1xuXG52YXIgbWF6ZUxpZ2h0cyA9IFtcblx0Ly8gdG9wIGhhbGx3YXlcblx0WzQwLCA1OV0sIFs4MCwgMjFdLCBbMTIwLCA1OV0sIFsxNjAsIDIxXSxcblx0WzI5NywgMjNdLCBbMzAzLCAyM10sIFszNzcsIDIzXSxcblx0WzI2MywgOTddLCBbMzM3LCA5N10sXG5cdC8vIHVwcGVyIGxlZnQgcm9vbVxuXHRbMjMsIDYzXSwgWzE3NywgNjNdLCBbMjMsIDEzN10sIFsxNzcsIDEzN10sXG5cdC8vIHJvdW5kIHJvb20gb24gbGVmdFxuXHRbNDUsIDIzNV0sIFs0NSwgMjQwXSwgWzQ1LCAyNDVdLFxuXHQvLyB1cHBlciBwaWxsYXJcblx0WzIyMCwgODBdLFxuXHQvLyBoYWxsd2F5IG9uIGxlZnRcblx0WzEyMCwgMjgwXSxcblx0Ly8gbmV4dCB0byB3YWxsIG5vdGNoXG5cdFsyMTcsIDI0M10sXG5cdC8vIGluc2lkZSByb29tIHdpdGggaG9sZXNcblx0WzE4MCwgMjkwXSwgWzE4MCwgMzIwXSwgWzE4MCwgMzUwXSxcblx0Ly8gcmlnaHQgY3VydmVkIHJvb21cblx0WzMyMCwgMzIwXSxcblx0Ly8gcmlnaHQgaGFsbHdheVxuXHRbMjcwLCAxNzBdLFxuXTtcblxuZm9yICh2YXIgaSA9IDAsIGwgPSBtYXplTGlnaHRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuXHR2YXIgY29sb3IgPSBNYXRoLnJhbmRvbSgpICogMHhmZmZmZmY7XG5cdG1hemVMaWdodHNbaV0ucHVzaChjb2xvciB8IDApO1xufVxuXG52YXIgY29udGFpbmVyID0gbmV3IExpZ2h0Q29udGFpbmVyKCk7XG5zdGFnZS5hZGRDaGlsZChjb250YWluZXIpO1xuc3RhZ2UuYWRkQ2hpbGQoY29udGFpbmVyLmdyYXBoaWNzKTtcblxuY29udGFpbmVyLmxvYWRNYXAobWF6ZVdhbGxzKTtcbi8qXG52YXIgdmlzaWJpbGl0eSA9IG5ldyBWaXNpYmlsaXR5KCk7XG5cbnZpc2liaWxpdHkubG9hZE1hcCg0MDAsIC0yMDAwMCwgW10sIHdhbGxzKTtcbiovXG5cblxudmFyIGN4ID0gMjAwLFxuXHRjeSA9IDIwMDtcbi8qXG52YXIgYyA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG5zdGFnZS5hZGRDaGlsZChjKTtcbiovXG52YXIgdmlzaWJpbGl0eSA9IGNvbnRhaW5lci52aXNpYmlsaXR5O1xudmFyIGMgPSBjb250YWluZXIuZ3JhcGhpY3M7XG5cbnJlbmRlcmVyLnZpZXcuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0Y3ggPSBldmVudC5jbGllbnRYO1xuXHRjeSA9IGV2ZW50LmNsaWVudFk7XG59KTtcblxuLypcbiAgIFVzYWdlOlxuICAgICAgbmV3IFZpc2liaWxpdHkoKVxuICAgV2hlbmV2ZXIgbWFwIGRhdGEgY2hhbmdlczpcbiAgICAgIGxvYWRNYXBcbiAgIFdoZW5ldmVyIGxpZ2h0IHNvdXJjZSBjaGFuZ2VzOlxuICAgICAgc2V0TGlnaHRMb2NhdGlvblxuICAgVG8gY2FsY3VsYXRlIHRoZSBhcmVhOlxuICAgICAgc3dlZXBcblx0ICAqL1xuXG5cbnJlcXVlc3RBbmltRnJhbWUoYW5pbWF0ZSk7XG5mdW5jdGlvbiBhbmltYXRlKCkge1xuXHRyZXF1ZXN0QW5pbUZyYW1lKGFuaW1hdGUpO1xuXG5cdHN0YXRzLmJlZ2luKCk7XG5cdGMuY2xlYXIoKTtcblxuXHRmb3IgKHZhciBpID0gMCwgbCA9IG1hemVMaWdodHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdFx0dmFyIHAgPSBtYXplTGlnaHRzW2ldO1xuXHRcdGNvbnRhaW5lci5kcmF3TGlnaHQocFswXSwgcFsxXSwgcFsyXSwgMC4xNSlcblxuXHRcdGMuYmVnaW5GaWxsKDB4ZmZjYzAwKTtcblx0XHRjLmRyYXdDaXJjbGUocFswXSwgcFsxXSwgMyk7XG5cdFx0Yy5lbmRGaWxsKCk7XG5cdH1cblxuXHRjb250YWluZXIuZHJhd0xpZ2h0KGN4LCBjeSwgMHhmZmNjMDAsIDAuMylcblxuXHRjLmJlZ2luRmlsbCgweGZmY2MwMCk7XG5cdGMuZHJhd0NpcmNsZSh2aXNpYmlsaXR5LmNlbnRlci54LCB2aXNpYmlsaXR5LmNlbnRlci55LCA4KTtcblx0Yy5lbmRGaWxsKCk7XG5cblx0ZHJhd1NlZ21lbnRzKGMsIGNvbnRhaW5lci52aXNpYmlsaXR5KTtcblxuXHRyZW5kZXJlci5yZW5kZXIoc3RhZ2UpO1xuXHRzdGF0cy5lbmQoKTtcbn1cblxuZnVuY3Rpb24gZHJhd0xpZ2h0KGMsIHZpc2liaWxpdHksIGN4LCBjeSwgYTEsIGEyKSB7XG5cdHZpc2liaWxpdHkuc2V0TGlnaHRMb2NhdGlvbihjeCwgY3kpO1xuXHR2aXNpYmlsaXR5LnN3ZWVwKCk7XG5cblx0Zm9yICh2YXIgaSA9IDAsIGwgPSB2aXNpYmlsaXR5Lm91dHB1dC5sZW5ndGg7IGkgPCBsOyBpICs9IDIpIHtcblx0XHR2YXIgcDEgPSB2aXNpYmlsaXR5Lm91dHB1dFtpXTtcblx0XHR2YXIgcDIgPSB2aXNpYmlsaXR5Lm91dHB1dFtpICsgMV07XG5cblx0XHRjLm1vdmVUbyhwMS54LCBwMS55KVxuXHRcdGMubGluZVRvKHAyLngsIHAyLnkpXG5cdFx0Yy5saW5lVG8odmlzaWJpbGl0eS5jZW50ZXIueCwgdmlzaWJpbGl0eS5jZW50ZXIueSlcblx0XHRjLmxpbmVUbyhwMS54LCBwMS55KVxuXHR9XG59XG5cblxuZnVuY3Rpb24gZHJhd1NlZ21lbnRzKGcsIHZpc2liaWxpdHkpIHtcblx0dmFyIG1heEFuZ2xlID0gTWF0aC5QSTtcblxuXHRnLmxpbmVTdHlsZSgzLCAweGNjMDAwMCwgMS4wKTtcblxuXHRmb3IgKHZhciBpID0gMCwgbCA9IHZpc2liaWxpdHkub3Blbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0XHR2YXIgc2VnbWVudCA9IHZpc2liaWxpdHkub3BlbltpXTtcblx0XHRnLm1vdmVUbyhzZWdtZW50LnAxLngsIHNlZ21lbnQucDEueSk7XG5cdFx0Zy5saW5lVG8oc2VnbWVudC5wMi54LCBzZWdtZW50LnAyLnkpO1xuXHR9XG5cblx0Zy5saW5lU3R5bGUoMiwgMHgwMDAwMDAsIDEuMCk7XG5cdGZvciAodmFyIGkgPSAwLCBsID0gdmlzaWJpbGl0eS5zZWdtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0XHR2YXIgc2VnbWVudCA9IHZpc2liaWxpdHkuc2VnbWVudHNbaV07XG5cdFx0Zy5tb3ZlVG8oc2VnbWVudC5wMS54LCBzZWdtZW50LnAxLnkpO1xuXHRcdGcubGluZVRvKHNlZ21lbnQucDIueCwgc2VnbWVudC5wMi55KTtcblx0fVxuXG5cdGcubGluZVN0eWxlKDAsIDB4MDAwMDAwLCAxLjApO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vc3JjL0xpZ2h0Q29udGFpbmVyJyk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBWaXNpYmlsaXR5ID0gcmVxdWlyZSgnLi92aXNpYmlsaXR5Jyk7XG5cbnZhciBMaWdodENvbnRhaW5lciA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG5cdFBJWEkuRGlzcGxheU9iamVjdENvbnRhaW5lci5jYWxsKHRoaXMpO1xuXHR0aGlzLmdyYXBoaWNzID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcblx0dGhpcy52aXNpYmlsaXR5ID0gbmV3IFZpc2liaWxpdHkoKTtcbn1cblxuTGlnaHRDb250YWluZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQSVhJLkRpc3BsYXlPYmplY3RDb250YWluZXIucHJvdG90eXBlKTtcbkxpZ2h0Q29udGFpbmVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExpZ2h0Q29udGFpbmVyO1xuXG5MaWdodENvbnRhaW5lci5wcm90b3R5cGUuZHJhd0xpZ2h0ID0gZnVuY3Rpb24oY3gsIGN5LCBjb2xvciwgYWxwaGEpIHtcblx0aWYgKGNvbG9yID09IG51bGwpIHtcblx0XHRjb2xvciA9IDB4MDAwMDAwO1xuXHR9XG5cdGlmIChhbHBoYSA9PSBudWxsKSB7XG5cdFx0YWxwaGEgPSAxLjA7XG5cdH1cblxuXHR2YXIgdmlzaWJpbGl0eSA9IHRoaXMudmlzaWJpbGl0eTtcblx0dmFyIGMgPSB0aGlzLmdyYXBoaWNzO1xuXG5cdHZpc2liaWxpdHkuc2V0TGlnaHRMb2NhdGlvbihjeCwgY3kpO1xuXHR2aXNpYmlsaXR5LnN3ZWVwKCk7XG5cblx0Yy5iZWdpbkZpbGwoY29sb3IsIGFscGhhKTtcblx0Zm9yICh2YXIgaSA9IDAsIGwgPSB2aXNpYmlsaXR5Lm91dHB1dC5sZW5ndGg7IGkgPCBsOyBpICs9IDIpIHtcblx0XHR2YXIgcDEgPSB2aXNpYmlsaXR5Lm91dHB1dFtpXTtcblx0XHR2YXIgcDIgPSB2aXNpYmlsaXR5Lm91dHB1dFtpICsgMV07XG5cdFx0Yy5tb3ZlVG8ocDEueCwgcDEueSlcblx0XHRjLmxpbmVUbyhwMi54LCBwMi55KVxuXHRcdGMubGluZVRvKGN4LCBjeSlcblx0XHRjLmxpbmVUbyhwMS54LCBwMS55KVxuXHR9XG5cdGMuZW5kRmlsbCgpO1xufTtcblxuTGlnaHRDb250YWluZXIucHJvdG90eXBlLmxvYWRNYXAgPSBmdW5jdGlvbih3YWxscykge1xuXHR3YWxscyA9IHdhbGxzLm1hcChmdW5jdGlvbih3YWxsKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHAxOiB7XG5cdFx0XHRcdHg6IHdhbGxbMF0sXG5cdFx0XHRcdHk6IHdhbGxbMV1cblx0XHRcdH0sXG5cdFx0XHRwMjoge1xuXHRcdFx0XHR4OiB3YWxsWzJdLFxuXHRcdFx0XHR5OiB3YWxsWzNdXG5cdFx0XHR9XG5cdFx0fTtcblx0fSk7XG5cdHRoaXMudmlzaWJpbGl0eS5sb2FkTWFwKDMwLCAtMjAwMCwgW10sIHdhbGxzKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBCbG9jayA9IGZ1bmN0aW9uKCkge1xuXHQvKiogQG1lbWJlciB7RmxvYXR9ICovXG5cdHRoaXMueCA9IDAuMDtcblx0LyoqIEBtZW1iZXIge0Zsb2F0fSAqL1xuXHR0aGlzLnkgPSAwLjA7XG5cdC8qKiBAbWVtYmVyIHtGbG9hdH0gKi9cblx0dGhpcy5yID0gMC4wO1xufVxuXG52YXIgUG9pbnQgPSBmdW5jdGlvbih4LCB5KSB7XG5cdC8qKiBAbWVtYmVyIHtGbG9hdH0gKi9cblx0dGhpcy54ID0geDtcblx0LyoqIEBtZW1iZXIge0Zsb2F0fSAqL1xuXHR0aGlzLnkgPSB5O1xufVxuXG52YXIgRW5kUG9pbnQgPSBmdW5jdGlvbih4LCB5KSB7XG5cdC8qKiBAbWVtYmVyIHtGbG9hdH0gKi9cblx0dGhpcy54ID0geDtcblx0LyoqIEBtZW1iZXIge0Zsb2F0fSAqL1xuXHR0aGlzLnkgPSB5O1xuXHQvKiogQG1lbWJlciB7Qm9vbH0gKi9cblx0dGhpcy5iZWdpbiA9IGZhbHNlO1xuXHQvKiogQG1lbWJlciB7U2VnbWVudH0gKi9cblx0dGhpcy5zZWdtZW50ID0gbnVsbDtcblx0LyoqIEBtZW1iZXIge0Zsb2F0fSAqL1xuXHR0aGlzLmFuZ2xlID0gMC4wO1xuXHQvKiogQG1lbWJlciB7Qm9vbH0gKi9cblx0dGhpcy52aXN1YWxpemUgPSBmYWxzZTtcbn1cblxudmFyIFNlZ21lbnQgPSBmdW5jdGlvbigpIHtcblx0LyoqIEBtZW1iZXIge0VuZFBvaW50fSAqL1xuXHR0aGlzLnAxID0gbmV3IEVuZFBvaW50KDAsIDApO1xuXHQvKiogQG1lbWJlciB7RW5kUG9pbnR9ICovXG5cdHRoaXMucDIgPSBuZXcgRW5kUG9pbnQoMCwgMCk7XG5cdC8qKiBAbWVtYmVyIHtGbG9hdH0gKi9cblx0dGhpcy5kID0gMC4wO1xufVxuXG4vKiogQGNvbnN0cnVjdG9yICovXG52YXIgVmlzaWJpbGl0eSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG5cdC8vIFRoZXNlIHJlcHJlc2VudCB0aGUgbWFwIGFuZCB0aGUgbGlnaHQgbG9jYXRpb246XG5cdC8qKiBAbWVtYmVyIHtBcnJheX0gLSBBcnJheSBvZiBTZWdtZW50ICovXG5cdHRoaXMuc2VnbWVudHMgPSBbXTtcblx0LyoqIEBtZW1iZXIge0FycmF5fSAtIEFycmF5IG9mIEVuZFBvaW50ICovXG5cdHRoaXMuZW5kcG9pbnRzID0gW107XG5cdC8qKiBAbWVtYmVyIHtQb2ludH0gKi9cblx0dGhpcy5jZW50ZXIgPSBuZXcgUG9pbnQoMCwgMCk7XG5cblx0Ly8gVGhlc2UgYXJlIGN1cnJlbnRseSAnb3BlbicgbGluZSBzZWdtZW50cywgc29ydGVkIHNvIHRoYXQgdGhlIG5lYXJlc3Rcblx0Ly8gc2VnbWVudCBpcyBmaXJzdC4gSXQncyB1c2VkIG9ubHkgZHVyaW5nIHRoZSBzd2VlcCBhbGdvcml0aG0sIGFuZCBleHBvc2VkXG5cdC8vIGFzIGEgcHVibGljIGZpZWxkIGhlcmUgc28gdGhhdCB0aGUgZGVtbyBjYW4gZGlzcGxheSBpdC5cblx0LyoqIEBtZW1iZXIge0FycmF5fSAtIEFycmF5IG9mIFNlZ21lbnQqL1xuXHR0aGlzLm9wZW4gPSBuZXcgZGVfcG9seWdvbmFsX2RzX0RMTCgpO1xuXG5cdC8vIFRoZSBvdXRwdXQgaXMgYSBzZXJpZXMgb2YgcG9pbnRzIHRoYXQgZm9ybXMgYSB2aXNpYmxlIGFyZWEgcG9seWdvblxuXHQvKiogQG1lbWJlciB7QXJyYXl9IC0gQXJyYXkgb2YgUG9pbnQqL1xuXHR0aGlzLm91dHB1dCA9IFtdO1xuXG5cdC8vIEZvciB0aGUgZGVtbywga2VlcCB0cmFjayBvZiB3YWxsIGludGVyc2VjdGlvbnNcblx0LyoqIEBtZW1iZXIge0FycmF5fSAtIEFycmF5IG9mIEFycmF5IG9mIFBvaW50Ki9cblx0dGhpcy5kZW1vX2ludGVyc2VjdGlvbnNEZXRlY3RlZCA9IFtdO1xufTtcblxuLyoqXG4gKiBIZWxwZXI6IGNvbXBhcmlzb24gZnVuY3Rpb24gZm9yIHNvcnRpbmcgcG9pbnRzIGJ5IGFuZ2xlXG4gKiBAcGFyYW0ge0VuZFBvaW50fSBhXG4gKiBAcGFyYW0ge0VuZFBvaW50fSBiXG4gKiBAcmV0dXJuIHtJbnR9XG4gKiBAc3RhdGljXG4gKiBAcHJpdmF0ZVxuICovXG5WaXNpYmlsaXR5Ll9lbmRwb2ludF9jb21wYXJlID0gZnVuY3Rpb24oYSwgYikge1xuXHQvLyBUcmF2ZXJzZSBpbiBhbmdsZSBvcmRlclxuXHRpZiAoYS5hbmdsZSA+IGIuYW5nbGUpIHJldHVybiAxO1xuXHRpZiAoYS5hbmdsZSA8IGIuYW5nbGUpIHJldHVybiAtMTtcblx0Ly8gQnV0IGZvciB0aWVzIChjb21tb24pLCB3ZSB3YW50IEJlZ2luIG5vZGVzIGJlZm9yZSBFbmQgbm9kZXNcblx0aWYgKCFhLmJlZ2luICYmIGIuYmVnaW4pIHJldHVybiAxO1xuXHRpZiAoYS5iZWdpbiAmJiAhYi5iZWdpbikgcmV0dXJuIC0xO1xuXHRyZXR1cm4gMDtcbn07XG5cbi8qKlxuICogSGVscGVyOiBsZWZ0T2Yoc2VnbWVudCwgcG9pbnQpIHJldHVybnMgdHJ1ZSBpZiBwb2ludCBpcyBcImxlZnRcIlxuICogb2Ygc2VnbWVudCB0cmVhdGVkIGFzIGEgdmVjdG9yLiBOb3RlIHRoYXQgdGhpcyBhc3N1bWVzIGEgMkRcbiAqIGNvb3JkaW5hdGUgc3lzdGVtIGluIHdoaWNoIHRoZSBZIGF4aXMgZ3Jvd3MgZG93bndhcmRzLCB3aGljaFxuICogbWF0Y2hlcyBjb21tb24gMkQgZ3JhcGhpY3MgbGlicmFyaWVzLCBidXQgaXMgdGhlIG9wcG9zaXRlIG9mXG4gKiB0aGUgdXN1YWwgY29udmVudGlvbiBmcm9tIG1hdGhlbWF0aWNzIGFuZCBpbiAzRCBncmFwaGljc1xuICogbGlicmFyaWVzLlxuICogQHBhcmFtIHtTZWdtZW50fSBzXG4gKiBAcGFyYW0ge1BvaW50fSBwXG4gKiBAcmV0dXJuIHtCb29sfVxuICogQHN0YXRpY1xuICogQHByaXZhdGVcbiAqL1xuVmlzaWJpbGl0eS5sZWZ0T2YgPSBmdW5jdGlvbihzLCBwKSB7XG5cdC8vIFRoaXMgaXMgYmFzZWQgb24gYSAzZCBjcm9zcyBwcm9kdWN0LCBidXQgd2UgZG9uJ3QgbmVlZCB0b1xuXHQvLyB1c2UgeiBjb29yZGluYXRlIGlucHV0cyAodGhleSdyZSAwKSwgYW5kIHdlIG9ubHkgbmVlZCB0aGVcblx0Ly8gc2lnbi4gSWYgeW91J3JlIGFubm95ZWQgdGhhdCBjcm9zcyBwcm9kdWN0IGlzIG9ubHkgZGVmaW5lZFxuXHQvLyBpbiAzZCwgc2VlIFwib3V0ZXIgcHJvZHVjdFwiIGluIEdlb21ldHJpYyBBbGdlYnJhLlxuXHQvLyA8aHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9HZW9tZXRyaWNfYWxnZWJyYT5cblx0dmFyIGNyb3NzID0gKHMucDIueCAtIHMucDEueCkgKiAocC55IC0gcy5wMS55KSAtIChzLnAyLnkgLSBzLnAxLnkpICogKHAueCAtIHMucDEueCk7XG5cdHJldHVybiBjcm9zcyA8IDA7XG5cdC8vIEFsc28gbm90ZSB0aGF0IHRoaXMgaXMgdGhlIG5haXZlIHZlcnNpb24gb2YgdGhlIHRlc3QgYW5kXG5cdC8vIGlzbid0IG51bWVyaWNhbGx5IHJvYnVzdC4gU2VlXG5cdC8vIDxodHRwczovL2dpdGh1Yi5jb20vbWlrb2xhbHlzZW5rby9yb2J1c3QtYXJpdGhtZXRpYz4gZm9yIGFcblx0Ly8gZGVtbyBvZiBob3cgdGhpcyBmYWlscyB3aGVuIGEgcG9pbnQgaXMgdmVyeSBjbG9zZSB0byB0aGVcblx0Ly8gbGluZS5cbn07XG5cbi8qKlxuICogUmV0dXJuIHAqKDEtZikgKyBxKmZcbiAqIEBwYXJhbSB7UG9pbnR9IHBcbiAqIEBwYXJhbSB7UG9pbnR9IHFcbiAqIEBwYXJhbSB7RmxvYXR9IGZcbiAqIEByZXR1cm4ge1BvaW50fVxuICogQHByaXZhdGVcbiAqIEBzdGF0aWNcbiAqL1xuVmlzaWJpbGl0eS5pbnRlcnBvbGF0ZSA9IGZ1bmN0aW9uKHAsIHEsIGYpIHtcblx0cmV0dXJuIG5ldyBQb2ludChwLnggKiAoMSAtIGYpICsgcS54ICogZiwgcC55ICogKDEgLSBmKSArIHEueSAqIGYpO1xufTtcblxuVmlzaWJpbGl0eS5wcm90b3R5cGUgPSB7XG5cdC8qKlxuXHQgKiBIZWxwZXIgZnVuY3Rpb24gdG8gY29uc3RydWN0IHNlZ21lbnRzIGFsb25nIHRoZSBvdXRzaWRlIHBlcmltZXRlclxuXHQgKiBAcGFyYW0ge0ludH0gc2l6ZVxuXHQgKiBAcGFyYW0ge0ludH0gbWFyZ2luXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRsb2FkRWRnZU9mTWFwOiBmdW5jdGlvbihzaXplLCBtYXJnaW4pIHtcblx0XHR0aGlzLmFkZFNlZ21lbnQobWFyZ2luLCBtYXJnaW4sIG1hcmdpbiwgc2l6ZSAtIG1hcmdpbik7XG5cdFx0dGhpcy5hZGRTZWdtZW50KG1hcmdpbiwgc2l6ZSAtIG1hcmdpbiwgc2l6ZSAtIG1hcmdpbiwgc2l6ZSAtIG1hcmdpbik7XG5cdFx0dGhpcy5hZGRTZWdtZW50KHNpemUgLSBtYXJnaW4sIHNpemUgLSBtYXJnaW4sIHNpemUgLSBtYXJnaW4sIG1hcmdpbik7XG5cdFx0dGhpcy5hZGRTZWdtZW50KHNpemUgLSBtYXJnaW4sIG1hcmdpbiwgbWFyZ2luLCBtYXJnaW4pO1xuXHRcdC8vIE5PVEU6IGlmIHVzaW5nIHRoZSBzaW1wbGVyIGRpc3RhbmNlIGZ1bmN0aW9uIChhLmQgPCBiLmQpXG5cdFx0Ly8gdGhlbiB3ZSBuZWVkIHNlZ21lbnRzIHRvIGJlIHNpbWlsYXJseSBzaXplZCwgc28gdGhlIGVkZ2Ugb2Zcblx0XHQvLyB0aGUgbWFwIG5lZWRzIHRvIGJlIGJyb2tlbiB1cCBpbnRvIHNtYWxsZXIgc2VnbWVudHMuXG5cdH0sXG5cblxuXHQvKipcblx0ICogTG9hZCBhIHNldCBvZiBzcXVhcmUgYmxvY2tzLCBwbHVzIGFueSBvdGhlciBsaW5lIHNlZ21lbnRzXG5cdCAqIEBwYXJhbSBzaXplXG5cdCAqIEBwYXJhbSBtYXJnaW5cblx0ICogQHBhcmFtIHtBcnJheX0gYmxvY2tzIC0gQXJyYXkgb2YgQmxvY2tcblx0ICogQHBhcmFtIHtBcnJheX0gd2FsbHMgLSBBcnJheSBvZiBTZWdtZW50XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGxvYWRNYXA6IGZ1bmN0aW9uKHNpemUsIG1hcmdpbiwgYmxvY2tzLCB3YWxscykge1xuXHRcdHRoaXMuc2VnbWVudHMgPSBbXTtcblx0XHR0aGlzLmVuZHBvaW50cyA9IFtdO1xuXHRcdHRoaXMubG9hZEVkZ2VPZk1hcChzaXplLCBtYXJnaW4pO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDAsIGwgPSBibG9ja3MubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdFx0XHR2YXIgYmxvY2sgPSBibG9ja3NbaV07XG5cdFx0XHR2YXIgeCA9IGJsb2NrLng7XG5cdFx0XHR2YXIgeSA9IGJsb2NrLnk7XG5cdFx0XHR2YXIgciA9IGJsb2NrLnI7XG5cdFx0XHR0aGlzLmFkZFNlZ21lbnQoeCAtIHIsIHkgLSByLCB4IC0gciwgeSArIHIpO1xuXHRcdFx0dGhpcy5hZGRTZWdtZW50KHggLSByLCB5ICsgciwgeCArIHIsIHkgKyByKTtcblx0XHRcdHRoaXMuYWRkU2VnbWVudCh4ICsgciwgeSArIHIsIHggKyByLCB5IC0gcik7XG5cdFx0XHR0aGlzLmFkZFNlZ21lbnQoeCArIHIsIHkgLSByLCB4IC0gciwgeSAtIHIpO1xuXHRcdH1cblxuXHRcdGZvciAodmFyIGkgPSAwLCBsID0gd2FsbHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdFx0XHR2YXIgd2FsbCA9IHdhbGxzW2ldO1xuXHRcdFx0dGhpcy5hZGRTZWdtZW50KHdhbGwucDEueCwgd2FsbC5wMS55LCB3YWxsLnAyLngsIHdhbGwucDIueSk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBBZGQgYSBzZWdtZW50LCB3aGVyZSB0aGUgZmlyc3QgcG9pbnQgc2hvd3MgdXAgaW4gdGhlXG5cdCAqIHZpc3VhbGl6YXRpb24gYnV0IHRoZSBzZWNvbmQgb25lIGRvZXMgbm90LiAoRXZlcnkgZW5kcG9pbnQgaXNcblx0ICogcGFydCBvZiB0d28gc2VnbWVudHMsIGJ1dCB3ZSB3YW50IHRvIG9ubHkgc2hvdyB0aGVtIG9uY2UuKVxuXHQgKiBAcGFyYW0ge0Zsb2F0fSB4MVxuXHQgKiBAcGFyYW0ge0Zsb2F0fSB5MVxuXHQgKiBAcGFyYW0ge0Zsb2F0fSB4MlxuXHQgKiBAcGFyYW0ge0Zsb2F0fSB5MlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0YWRkU2VnbWVudDogZnVuY3Rpb24oeDEsIHkxLCB4MiwgeTIpIHtcblx0XHR2YXIgc2VnbWVudCA9IG5ldyBTZWdtZW50KCk7XG5cblx0XHR2YXIgcDEgPSBuZXcgRW5kUG9pbnQoMC4wLCAwLjApO1xuXHRcdHAxLnNlZ21lbnQgPSBzZWdtZW50O1xuXHRcdHAxLnZpc3VhbGl6ZSA9IHRydWU7XG5cblx0XHR2YXIgcDIgPSBuZXcgRW5kUG9pbnQoMC4wLCAwLjApO1xuXHRcdHAyLnNlZ21lbnQgPSBzZWdtZW50O1xuXHRcdHAyLnZpc3VhbGl6ZSA9IGZhbHNlO1xuXG5cdFx0cDEueCA9IHgxO1xuXHRcdHAxLnkgPSB5MTtcblx0XHRwMi54ID0geDI7XG5cdFx0cDIueSA9IHkyO1xuXG5cdFx0c2VnbWVudC5wMSA9IHAxO1xuXHRcdHNlZ21lbnQucDIgPSBwMjtcblx0XHRzZWdtZW50LmQgPSAwLjA7XG5cblx0XHR0aGlzLnNlZ21lbnRzLnB1c2goc2VnbWVudCk7XG5cdFx0dGhpcy5lbmRwb2ludHMucHVzaChwMSk7XG5cdFx0dGhpcy5lbmRwb2ludHMucHVzaChwMik7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFNldCB0aGUgbGlnaHQgbG9jYXRpb24uIFNlZ21lbnQgYW5kIEVuZFBvaW50IGRhdGEgY2FuJ3QgYmVcblx0ICogcHJvY2Vzc2VkIHVudGlsIHRoZSBsaWdodCBsb2NhdGlvbiBpcyBrbm93bi5cblx0ICogQHBhcmFtIHtGbG9hdH0geFxuXHQgKiBAcGFyYW0ge0Zsb2F0fSB5XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHNldExpZ2h0TG9jYXRpb246IGZ1bmN0aW9uKHgsIHkpIHtcblx0XHR0aGlzLmNlbnRlci54ID0geDtcblx0XHR0aGlzLmNlbnRlci55ID0geTtcblxuXHRcdGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5zZWdtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0XHRcdHZhciBzZWdtZW50ID0gdGhpcy5zZWdtZW50c1tpXTtcblxuXHRcdFx0dmFyIGR4ID0gMC41ICogKHNlZ21lbnQucDEueCArIHNlZ21lbnQucDIueCkgLSB4O1xuXHRcdFx0dmFyIGR5ID0gMC41ICogKHNlZ21lbnQucDEueSArIHNlZ21lbnQucDIueSkgLSB5O1xuXHRcdFx0Ly8gTk9URTogd2Ugb25seSB1c2UgdGhpcyBmb3IgY29tcGFyaXNvbiBzbyB3ZSBjYW4gdXNlXG5cdFx0XHQvLyBkaXN0YW5jZSBzcXVhcmVkIGluc3RlYWQgb2YgZGlzdGFuY2UuIEhvd2V2ZXIgaW5cblx0XHRcdC8vIHByYWN0aWNlIHRoZSBzcXJ0IGlzIHBsZW50eSBmYXN0IGFuZCB0aGlzIGRvZXNuJ3Rcblx0XHRcdC8vIHJlYWxseSBoZWxwIGluIHRoaXMgc2l0dWF0aW9uLlxuXHRcdFx0c2VnbWVudC5kID0gZHggKiBkeCArIGR5ICogZHk7XG5cblx0XHRcdC8vIE5PVEU6IGZ1dHVyZSBvcHRpbWl6YXRpb246IHdlIGNvdWxkIHJlY29yZCB0aGUgcXVhZHJhbnRcblx0XHRcdC8vIGFuZCB0aGUgeS94IG9yIHgveSByYXRpbywgYW5kIHNvcnQgYnkgKHF1YWRyYW50LFxuXHRcdFx0Ly8gcmF0aW8pLCBpbnN0ZWFkIG9mIGNhbGxpbmcgYXRhbjIuIFNlZVxuXHRcdFx0Ly8gPGh0dHBzOi8vZ2l0aHViLmNvbS9taWtvbGFseXNlbmtvL2NvbXBhcmUtc2xvcGU+IGZvciBhXG5cdFx0XHQvLyBsaWJyYXJ5IHRoYXQgZG9lcyB0aGlzLiBBbHRlcm5hdGl2ZWx5LCBjYWxjdWxhdGUgdGhlXG5cdFx0XHQvLyBhbmdsZXMgYW5kIHVzZSBidWNrZXQgc29ydCB0byBnZXQgYW4gTyhOKSBzb3J0LlxuXHRcdFx0c2VnbWVudC5wMS5hbmdsZSA9IE1hdGguYXRhbjIoc2VnbWVudC5wMS55IC0geSwgc2VnbWVudC5wMS54IC0geCk7XG5cdFx0XHRzZWdtZW50LnAyLmFuZ2xlID0gTWF0aC5hdGFuMihzZWdtZW50LnAyLnkgLSB5LCBzZWdtZW50LnAyLnggLSB4KTtcblxuXHRcdFx0dmFyIGRBbmdsZSA9IHNlZ21lbnQucDIuYW5nbGUgLSBzZWdtZW50LnAxLmFuZ2xlO1xuXHRcdFx0aWYgKGRBbmdsZSA8PSAtTWF0aC5QSSkge1xuXHRcdFx0XHRkQW5nbGUgKz0gMiAqIE1hdGguUEk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoZEFuZ2xlID4gTWF0aC5QSSkge1xuXHRcdFx0XHRkQW5nbGUgLT0gMiAqIE1hdGguUEk7XG5cdFx0XHR9XG5cdFx0XHRzZWdtZW50LnAxLmJlZ2luID0gKGRBbmdsZSA+IDAuMCk7XG5cdFx0XHRzZWdtZW50LnAyLmJlZ2luID0gIXNlZ21lbnQucDEuYmVnaW47XG5cdFx0fVxuXHR9LFxuXG5cblxuXG5cblxuXHQvKipcblx0ICogUnVuIHRoZSBhbGdvcml0aG0sIHN3ZWVwaW5nIG92ZXIgYWxsIG9yIHBhcnQgb2YgdGhlIGNpcmNsZSB0byBmaW5kXG5cdCAqIHRoZSB2aXNpYmxlIGFyZWEsIHJlcHJlc2VudGVkIGFzIGEgc2V0IG9mIHRyaWFuZ2xlc1xuXHQgKiBAcHVibGljXG5cdCAqIEBwYXJhbSB7RmxvYXR9IG1heEFuZ2xlXG5cdCAqL1xuXHRzd2VlcDogZnVuY3Rpb24obWF4QW5nbGUpIHtcblx0XHRpZiAobWF4QW5nbGUgPT0gbnVsbCkge1xuXHRcdFx0bWF4QW5nbGUgPSA5OTkuMDtcblx0XHR9XG5cdFx0dGhpcy5vdXRwdXQgPSBbXTtcblx0XHR0aGlzLmRlbW9faW50ZXJzZWN0aW9uc0RldGVjdGVkID0gW107XG5cdFx0dGhpcy5lbmRwb2ludHMuc29ydChWaXNpYmlsaXR5Ll9lbmRwb2ludF9jb21wYXJlLCB0cnVlKTtcblx0XHR0aGlzLm9wZW4uY2xlYXIoKTtcblx0XHR2YXIgYmVnaW5BbmdsZSA9IDAuMDtcblxuXHRcdC8vdmFyIG9wZW4gPSB0aGlzLm9wZW4udG9BcnJheSgpO1xuXHRcdC8vdmFyIG9wZW4gPSB0aGlzLm9wZW4gPSBbXTtcblxuXG5cdFx0Ly8gQXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgc3dlZXAgd2Ugd2FudCB0byBrbm93IHdoaWNoXG5cdFx0Ly8gc2VnbWVudHMgYXJlIGFjdGl2ZS4gVGhlIHNpbXBsZXN0IHdheSB0byBkbyB0aGlzIGlzIHRvIG1ha2Vcblx0XHQvLyBhIHBhc3MgY29sbGVjdGluZyB0aGUgc2VnbWVudHMsIGFuZCBtYWtlIGFub3RoZXIgcGFzcyB0b1xuXHRcdC8vIGJvdGggY29sbGVjdCBhbmQgcHJvY2VzcyB0aGVtLiBIb3dldmVyIGl0IHdvdWxkIGJlIG1vcmVcblx0XHQvLyBlZmZpY2llbnQgdG8gZ28gdGhyb3VnaCBhbGwgdGhlIHNlZ21lbnRzLCBmaWd1cmUgb3V0IHdoaWNoXG5cdFx0Ly8gb25lcyBpbnRlcnNlY3QgdGhlIGluaXRpYWwgc3dlZXAgbGluZSwgYW5kIHRoZW4gc29ydCB0aGVtLlxuXHRcdGZvciAodmFyIHBhc3MgPSAwOyBwYXNzIDwgMjsgcGFzcysrKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMuZW5kcG9pbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuXHRcdFx0XHR2YXIgcCA9IHRoaXMuZW5kcG9pbnRzW2ldO1xuXG5cdFx0XHRcdC8vIEVhcmx5IGV4aXQgZm9yIHRoZSB2aXN1YWxpemF0aW9uIHRvIHNob3cgdGhlIHN3ZWVwIHByb2Nlc3Ncblx0XHRcdFx0aWYgKHBhc3MgPT0gMSAmJiBwLmFuZ2xlID4gbWF4QW5nbGUpIGJyZWFrO1xuXG5cdFx0XHRcdHZhciBjdXJyZW50X29sZCA9IG51bGw7XG5cdFx0XHRcdGlmICh0aGlzLm9wZW4uX3NpemUgIT09IDApIHtcblx0XHRcdFx0XHRjdXJyZW50X29sZCA9IHRoaXMub3Blbi5oZWFkLnZhbDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChwLmJlZ2luKSB7XG5cdFx0XHRcdFx0Ly8gSW5zZXJ0IGludG8gdGhlIHJpZ2h0IHBsYWNlIGluIHRoZSBsaXN0XG5cdFx0XHRcdFx0dmFyIG5vZGUgPSB0aGlzLm9wZW4uaGVhZDtcblx0XHRcdFx0XHQvL3ZhciBub2RlID0gb3BlblswXTtcblxuXHRcdFx0XHRcdGZvciAoOyBub2RlICE9IG51bGw7IG5vZGUgPSBub2RlLm5leHQpIHtcblx0XHRcdFx0XHRcdGlmICghdGhpcy5fc2VnbWVudF9pbl9mcm9udF9vZihwLnNlZ21lbnQsIG5vZGUudmFsLCB0aGlzLmNlbnRlcikpIHtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCFub2RlKSB7XG5cdFx0XHRcdFx0XHR0aGlzLm9wZW4uYXBwZW5kKHAuc2VnbWVudCk7XG5cdFx0XHRcdFx0Ly9vcGVuLnB1c2gocC5zZWdtZW50KTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhpcy5vcGVuLmluc2VydEJlZm9yZShub2RlLCBwLnNlZ21lbnQpO1xuXHRcdFx0XHRcdFx0Ly9vcGVuLnNwbGljZShvcGVuLmluZGV4T2Yobm9kZSksIDAsIHAuc2VnbWVudCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMub3Blbi5yZW1vdmUocC5zZWdtZW50KTtcblx0XHRcdFx0XHQvL29wZW4uc3BsaWNlKG9wZW4uaW5kZXhPZihwLnNlZ21lbnQpLCAxKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHZhciBjdXJyZW50X25ldyA9IG51bGw7XG5cdFx0XHRcdGlmICh0aGlzLm9wZW4uX3NpemUgIT09IDApIHtcblx0XHRcdFx0XHRjdXJyZW50X25ldyA9IHRoaXMub3Blbi5oZWFkLnZhbDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChjdXJyZW50X29sZCAhPSBjdXJyZW50X25ldykge1xuXHRcdFx0XHRcdGlmIChwYXNzID09IDEpIHtcblx0XHRcdFx0XHRcdHRoaXMuYWRkVHJpYW5nbGUoYmVnaW5BbmdsZSwgcC5hbmdsZSwgY3VycmVudF9vbGQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRiZWdpbkFuZ2xlID0gcC5hbmdsZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXG5cdC8qKlxuXHQgKiBIZWxwZXI6IGRvIHdlIGtub3cgdGhhdCBzZWdtZW50IGEgaXMgaW4gZnJvbnQgb2YgYj9cblx0ICogSW1wbGVtZW50YXRpb24gbm90IGFudGktc3ltbWV0cmljICh0aGF0IGlzIHRvIHNheSxcblx0ICogX3NlZ21lbnRfaW5fZnJvbnRfb2YoYSwgYikgIT0gKCFfc2VnbWVudF9pbl9mcm9udF9vZihiLCBhKSkuXG5cdCAqIEFsc28gbm90ZSB0aGF0IGl0IG9ubHkgaGFzIHRvIHdvcmsgaW4gYSByZXN0cmljdGVkIHNldCBvZiBjYXNlc1xuXHQgKiBpbiB0aGUgdmlzaWJpbGl0eSBhbGdvcml0aG07IEkgZG9uJ3QgdGhpbmsgaXQgaGFuZGxlcyBhbGxcblx0ICogY2FzZXMuIFNlZSBodHRwOi8vd3d3LnJlZGJsb2JnYW1lcy5jb20vYXJ0aWNsZXMvdmlzaWJpbGl0eS9zZWdtZW50LXNvcnRpbmcuaHRtbFxuXHQgKiBAcGFyYW0ge1NlZ21lbnR9IGFcblx0ICogQHBhcmFtIHtTZWdtZW50fSBiXG5cdCAqIEBwYXJhbSB7UG9pbnR9IHJlbGF0aXZlVG9cblx0ICogQHJldHVybiB7Qm9vbH1cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9zZWdtZW50X2luX2Zyb250X29mOiBmdW5jdGlvbihhLCBiLCByZWxhdGl2ZVRvKSB7XG5cdFx0dmFyIGxlZnRPZiA9IFZpc2liaWxpdHkubGVmdE9mO1xuXHRcdHZhciBpbnRlcnBvbGF0ZSA9IFZpc2liaWxpdHkuaW50ZXJwb2xhdGU7XG5cblx0XHQvLyBOT1RFOiB3ZSBzbGlnaHRseSBzaG9ydGVuIHRoZSBzZWdtZW50cyBzbyB0aGF0XG5cdFx0Ly8gaW50ZXJzZWN0aW9ucyBvZiB0aGUgZW5kcG9pbnRzIChjb21tb24pIGRvbid0IGNvdW50IGFzXG5cdFx0Ly8gaW50ZXJzZWN0aW9ucyBpbiB0aGlzIGFsZ29yaXRobVxuXHRcdHZhciBBMSA9IGxlZnRPZihhLCBpbnRlcnBvbGF0ZShiLnAxLCBiLnAyLCAwLjAxKSk7XG5cdFx0dmFyIEEyID0gbGVmdE9mKGEsIGludGVycG9sYXRlKGIucDIsIGIucDEsIDAuMDEpKTtcblx0XHR2YXIgQTMgPSBsZWZ0T2YoYSwgcmVsYXRpdmVUbyk7XG5cdFx0dmFyIEIxID0gbGVmdE9mKGIsIGludGVycG9sYXRlKGEucDEsIGEucDIsIDAuMDEpKTtcblx0XHR2YXIgQjIgPSBsZWZ0T2YoYiwgaW50ZXJwb2xhdGUoYS5wMiwgYS5wMSwgMC4wMSkpO1xuXHRcdHZhciBCMyA9IGxlZnRPZihiLCByZWxhdGl2ZVRvKTtcblxuXHRcdC8vIE5PVEU6IHRoaXMgYWxnb3JpdGhtIGlzIHByb2JhYmx5IHdvcnRoeSBvZiBhIHNob3J0IGFydGljbGVcblx0XHQvLyBidXQgZm9yIG5vdywgZHJhdyBpdCBvbiBwYXBlciB0byBzZWUgaG93IGl0IHdvcmtzLiBDb25zaWRlclxuXHRcdC8vIHRoZSBsaW5lIEExLUEyLiBJZiBib3RoIEIxIGFuZCBCMiBhcmUgb24gb25lIHNpZGUgYW5kXG5cdFx0Ly8gcmVsYXRpdmVUbyBpcyBvbiB0aGUgb3RoZXIgc2lkZSwgdGhlbiBBIGlzIGluIGJldHdlZW4gdGhlXG5cdFx0Ly8gdmlld2VyIGFuZCBCLiBXZSBjYW4gZG8gdGhlIHNhbWUgd2l0aCBCMS1CMjogaWYgQTEgYW5kIEEyXG5cdFx0Ly8gYXJlIG9uIG9uZSBzaWRlLCBhbmQgcmVsYXRpdmVUbyBpcyBvbiB0aGUgb3RoZXIgc2lkZSwgdGhlblxuXHRcdC8vIEIgaXMgaW4gYmV0d2VlbiB0aGUgdmlld2VyIGFuZCBBLlxuXHRcdGlmIChCMSA9PSBCMiAmJiBCMiAhPSBCMykgcmV0dXJuIHRydWU7XG5cdFx0aWYgKEExID09IEEyICYmIEEyID09IEEzKSByZXR1cm4gdHJ1ZTtcblx0XHRpZiAoQTEgPT0gQTIgJiYgQTIgIT0gQTMpIHJldHVybiBmYWxzZTtcblx0XHRpZiAoQjEgPT0gQjIgJiYgQjIgPT0gQjMpIHJldHVybiBmYWxzZTtcblxuXHRcdC8vIElmIEExICE9IEEyIGFuZCBCMSAhPSBCMiB0aGVuIHdlIGhhdmUgYW4gaW50ZXJzZWN0aW9uLlxuXHRcdC8vIEV4cG9zZSBpdCBmb3IgdGhlIEdVSSB0byBzaG93IGEgbWVzc2FnZS4gQSBtb3JlIHJvYnVzdFxuXHRcdC8vIGltcGxlbWVudGF0aW9uIHdvdWxkIHNwbGl0IHNlZ21lbnRzIGF0IGludGVyc2VjdGlvbnMgc29cblx0XHQvLyB0aGF0IHBhcnQgb2YgdGhlIHNlZ21lbnQgaXMgaW4gZnJvbnQgYW5kIHBhcnQgaXMgYmVoaW5kLlxuXHRcdHRoaXMuZGVtb19pbnRlcnNlY3Rpb25zRGV0ZWN0ZWQucHVzaChbYS5wMSwgYS5wMiwgYi5wMSwgYi5wMl0pO1xuXHRcdHJldHVybiBmYWxzZTtcblxuXHRcdC8vIE5PVEU6IHByZXZpb3VzIGltcGxlbWVudGF0aW9uIHdhcyBhLmQgPCBiLmQuIFRoYXQncyBzaW1wbGVyXG5cdFx0Ly8gYnV0IHRyb3VibGUgd2hlbiB0aGUgc2VnbWVudHMgYXJlIG9mIGRpc3NpbWlsYXIgc2l6ZXMuIElmXG5cdFx0Ly8geW91J3JlIG9uIGEgZ3JpZCBhbmQgdGhlIHNlZ21lbnRzIGFyZSBzaW1pbGFybHkgc2l6ZWQsIHRoZW5cblx0XHQvLyB1c2luZyBkaXN0YW5jZSB3aWxsIGJlIGEgc2ltcGxlciBhbmQgZmFzdGVyIGltcGxlbWVudGF0aW9uLlxuXHR9LFxuXG5cblx0LyoqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7RmxvYXR9IGFuZ2xlMVxuXHQgKiBAcGFyYW0ge0Zsb2F0fSBhbmdsZTJcblx0ICogQHBhcmFtIHtTZWdtZW50fSBzZWdtZW50XG5cdCAqL1xuXHRhZGRUcmlhbmdsZTogZnVuY3Rpb24oYW5nbGUxLCBhbmdsZTIsIHNlZ21lbnQpIHtcblx0XHR2YXIgY2VudGVyID0gdGhpcy5jZW50ZXI7XG5cblx0XHR2YXIgcDEgPSBjZW50ZXI7XG5cdFx0dmFyIHAyID0gbmV3IFBvaW50KGNlbnRlci54ICsgTWF0aC5jb3MoYW5nbGUxKSwgY2VudGVyLnkgKyBNYXRoLnNpbihhbmdsZTEpKTtcblx0XHR2YXIgcDMgPSBuZXcgUG9pbnQoMC4wLCAwLjApO1xuXHRcdHZhciBwNCA9IG5ldyBQb2ludCgwLjAsIDAuMCk7XG5cblx0XHRpZiAoc2VnbWVudCAhPSBudWxsKSB7XG5cdFx0XHQvLyBTdG9wIHRoZSB0cmlhbmdsZSBhdCB0aGUgaW50ZXJzZWN0aW5nIHNlZ21lbnRcblx0XHRcdHAzLnggPSBzZWdtZW50LnAxLng7XG5cdFx0XHRwMy55ID0gc2VnbWVudC5wMS55O1xuXHRcdFx0cDQueCA9IHNlZ21lbnQucDIueDtcblx0XHRcdHA0LnkgPSBzZWdtZW50LnAyLnk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIFN0b3AgdGhlIHRyaWFuZ2xlIGF0IGEgZml4ZWQgZGlzdGFuY2U7IHRoaXMgcHJvYmFibHkgaXNcblx0XHRcdC8vIG5vdCB3aGF0IHdlIHdhbnQsIGJ1dCBpdCBuZXZlciBnZXRzIHVzZWQgaW4gdGhlIGRlbW9cblx0XHRcdHAzLnggPSBjZW50ZXIueCArIE1hdGguY29zKGFuZ2xlMSkgKiA1MDA7XG5cdFx0XHRwMy55ID0gY2VudGVyLnkgKyBNYXRoLnNpbihhbmdsZTEpICogNTAwO1xuXHRcdFx0cDQueCA9IGNlbnRlci54ICsgTWF0aC5jb3MoYW5nbGUyKSAqIDUwMDtcblx0XHRcdHA0LnkgPSBjZW50ZXIueSArIE1hdGguc2luKGFuZ2xlMikgKiA1MDA7XG5cdFx0fVxuXG5cdFx0dmFyIHBCZWdpbiA9IHRoaXMubGluZUludGVyc2VjdGlvbihwMywgcDQsIHAxLCBwMik7XG5cblx0XHRwMi54ID0gY2VudGVyLnggKyBNYXRoLmNvcyhhbmdsZTIpO1xuXHRcdHAyLnkgPSBjZW50ZXIueSArIE1hdGguc2luKGFuZ2xlMik7XG5cdFx0dmFyIHBFbmQgPSB0aGlzLmxpbmVJbnRlcnNlY3Rpb24ocDMsIHA0LCBwMSwgcDIpO1xuXG5cdFx0dGhpcy5vdXRwdXQucHVzaChwQmVnaW4pO1xuXHRcdHRoaXMub3V0cHV0LnB1c2gocEVuZCk7XG5cdH0sXG5cblxuXHQvKipcblx0ICogQHB1YmxpY1xuXHQgKiBAcGFyYW0ge1BvaW50fSBwMVxuXHQgKiBAcGFyYW0ge1BvaW50fSBwMlxuXHQgKiBAcGFyYW0ge1BvaW50fSBwM1xuXHQgKiBAcGFyYW0ge1BvaW50fSBwNFxuXHQgKiBAcmV0dXJuIHtQb2ludH1cblx0ICovXG5cdGxpbmVJbnRlcnNlY3Rpb246IGZ1bmN0aW9uKHAxLCBwMiwgcDMsIHA0KSB7XG5cdFx0Ly8gRnJvbSBodHRwOi8vcGF1bGJvdXJrZS5uZXQvZ2VvbWV0cnkvbGluZWxpbmUyZC9cblx0XHR2YXIgcyA9ICgocDQueCAtIHAzLngpICogKHAxLnkgLSBwMy55KSAtIChwNC55IC0gcDMueSkgKiAocDEueCAtIHAzLngpKSAvICgocDQueSAtIHAzLnkpICogKHAyLnggLSBwMS54KSAtIChwNC54IC0gcDMueCkgKiAocDIueSAtIHAxLnkpKTtcblx0XHRyZXR1cm4gbmV3IFBvaW50KHAxLnggKyBzICogKHAyLnggLSBwMS54KSwgcDEueSArIHMgKiAocDIueSAtIHAxLnkpKTtcblx0fSxcblxufTtcblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxudmFyIGRlX3BvbHlnb25hbF9kc19ETEwgPSBmdW5jdGlvbihyZXNlcnZlZFNpemUsIG1heFNpemUpIHtcblx0aWYgKG1heFNpemUgPT0gbnVsbCkge1xuXHRcdG1heFNpemUgPSAtMTtcblx0fVxuXHRpZiAocmVzZXJ2ZWRTaXplID09IG51bGwpIHtcblx0XHRyZXNlcnZlZFNpemUgPSAwO1xuXHR9XG5cdHRoaXMubWF4U2l6ZSA9IC0xO1xuXHR0aGlzLl9yZXNlcnZlZFNpemUgPSByZXNlcnZlZFNpemU7XG5cdHRoaXMuX3NpemUgPSAwO1xuXHR0aGlzLl9wb29sU2l6ZSA9IDA7XG5cdHRoaXMuX2NpcmN1bGFyID0gZmFsc2U7XG5cdHRoaXMuX2l0ZXJhdG9yID0gbnVsbDtcblx0aWYgKHJlc2VydmVkU2l6ZSA+IDApIHtcblx0XHR0aGlzLl9oZWFkUG9vbCA9IHRoaXMuX3RhaWxQb29sID0gbmV3IGRlX3BvbHlnb25hbF9kc19ETExOb2RlKG51bGwsIHRoaXMpO1xuXHR9XG5cdHRoaXMuaGVhZCA9IHRoaXMudGFpbCA9IG51bGw7XG5cdHRoaXMua2V5ID0gZGVfcG9seWdvbmFsX2RzX0hhc2hLZXkuX2NvdW50ZXIrKztcblx0dGhpcy5yZXVzZUl0ZXJhdG9yID0gZmFsc2U7XG59O1xuZGVfcG9seWdvbmFsX2RzX0RMTC5wcm90b3R5cGUgPSB7XG5cdGFwcGVuZDogZnVuY3Rpb24oeCkge1xuXHRcdHZhciBub2RlID0gdGhpcy5fZ2V0Tm9kZSh4KTtcblx0XHRpZiAodGhpcy50YWlsICE9IG51bGwpIHtcblx0XHRcdHRoaXMudGFpbC5uZXh0ID0gbm9kZTtcblx0XHRcdG5vZGUucHJldiA9IHRoaXMudGFpbDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5oZWFkID0gbm9kZTtcblx0XHR9XG5cdFx0dGhpcy50YWlsID0gbm9kZTtcblx0XHRpZiAodGhpcy5fY2lyY3VsYXIpIHtcblx0XHRcdHRoaXMudGFpbC5uZXh0ID0gdGhpcy5oZWFkO1xuXHRcdFx0dGhpcy5oZWFkLnByZXYgPSB0aGlzLnRhaWw7XG5cdFx0fVxuXHRcdHRoaXMuX3NpemUrKztcblx0XHRyZXR1cm4gbm9kZTtcblx0fSxcblx0aW5zZXJ0QmVmb3JlOiBmdW5jdGlvbihub2RlLCB4KSB7XG5cdFx0dmFyIHQgPSB0aGlzLl9nZXROb2RlKHgpO1xuXHRcdG5vZGUuX2luc2VydEJlZm9yZSh0KTtcblx0XHRpZiAobm9kZSA9PSB0aGlzLmhlYWQpIHtcblx0XHRcdHRoaXMuaGVhZCA9IHQ7XG5cdFx0XHRpZiAodGhpcy5fY2lyY3VsYXIpIHtcblx0XHRcdFx0dGhpcy5oZWFkLnByZXYgPSB0aGlzLnRhaWw7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRoaXMuX3NpemUrKztcblx0XHRyZXR1cm4gdDtcblx0fSxcblx0dW5saW5rOiBmdW5jdGlvbihub2RlKSB7XG5cdFx0dmFyIGhvb2sgPSBub2RlLm5leHQ7XG5cdFx0aWYgKG5vZGUgPT0gdGhpcy5oZWFkKSB7XG5cdFx0XHR0aGlzLmhlYWQgPSB0aGlzLmhlYWQubmV4dDtcblx0XHRcdGlmICh0aGlzLl9jaXJjdWxhcikge1xuXHRcdFx0XHRpZiAodGhpcy5oZWFkID09IHRoaXMudGFpbCkge1xuXHRcdFx0XHRcdHRoaXMuaGVhZCA9IG51bGw7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy50YWlsLm5leHQgPSB0aGlzLmhlYWQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLmhlYWQgPT0gbnVsbCkge1xuXHRcdFx0XHR0aGlzLnRhaWwgPSBudWxsO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAobm9kZSA9PSB0aGlzLnRhaWwpIHtcblx0XHRcdHRoaXMudGFpbCA9IHRoaXMudGFpbC5wcmV2O1xuXHRcdFx0aWYgKHRoaXMuX2NpcmN1bGFyKSB7XG5cdFx0XHRcdHRoaXMuaGVhZC5wcmV2ID0gdGhpcy50YWlsO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMudGFpbCA9PSBudWxsKSB7XG5cdFx0XHRcdHRoaXMuaGVhZCA9IG51bGw7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdG5vZGUuX3VubGluaygpO1xuXHRcdHRoaXMuX3B1dE5vZGUobm9kZSk7XG5cdFx0dGhpcy5fc2l6ZS0tO1xuXHRcdHJldHVybiBob29rO1xuXHR9LFxuXHRzb3J0OiBmdW5jdGlvbihjb21wYXJlLCB1c2VJbnNlcnRpb25Tb3J0KSB7XG5cdFx0aWYgKHVzZUluc2VydGlvblNvcnQgPT0gbnVsbCkge1xuXHRcdFx0dXNlSW5zZXJ0aW9uU29ydCA9IGZhbHNlO1xuXHRcdH1cblx0XHRpZiAodGhpcy5fc2l6ZSA+IDEpIHtcblx0XHRcdGlmICh0aGlzLl9jaXJjdWxhcikge1xuXHRcdFx0XHR0aGlzLnRhaWwubmV4dCA9IG51bGw7XG5cdFx0XHRcdHRoaXMuaGVhZC5wcmV2ID0gbnVsbDtcblx0XHRcdH1cblx0XHRcdGlmIChjb21wYXJlID09IG51bGwpXG5cdFx0XHRcdGlmICh1c2VJbnNlcnRpb25Tb3J0KSB7XG5cdFx0XHRcdFx0dGhpcy5oZWFkID0gdGhpcy5faW5zZXJ0aW9uU29ydENvbXBhcmFibGUodGhpcy5oZWFkKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLmhlYWQgPSB0aGlzLl9tZXJnZVNvcnRDb21wYXJhYmxlKHRoaXMuaGVhZCk7XG5cdFx0XHR9ZWxzZSBpZiAodXNlSW5zZXJ0aW9uU29ydCkge1xuXHRcdFx0XHR0aGlzLmhlYWQgPSB0aGlzLl9pbnNlcnRpb25Tb3J0KHRoaXMuaGVhZCwgY29tcGFyZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmhlYWQgPSB0aGlzLl9tZXJnZVNvcnQodGhpcy5oZWFkLCBjb21wYXJlKTtcblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLl9jaXJjdWxhcikge1xuXHRcdFx0XHR0aGlzLnRhaWwubmV4dCA9IHRoaXMuaGVhZDtcblx0XHRcdFx0dGhpcy5oZWFkLnByZXYgPSB0aGlzLnRhaWw7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRyZW1vdmU6IGZ1bmN0aW9uKHgpIHtcblx0XHR2YXIgcyA9IHRoaXMuX3NpemU7XG5cdFx0aWYgKHMgPT0gMCkgcmV0dXJuIGZhbHNlO1xuXHRcdHZhciBub2RlID0gdGhpcy5oZWFkO1xuXHRcdHdoaWxlIChub2RlICE9IG51bGwpXG5cdFx0aWYgKG5vZGUudmFsID09IHgpIHtcblx0XHRcdFx0bm9kZSA9IHRoaXMudW5saW5rKG5vZGUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bm9kZSA9IG5vZGUubmV4dDtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX3NpemUgPCBzO1xuXHR9LFxuXHRjbGVhcjogZnVuY3Rpb24ocHVyZ2UpIHtcblx0XHRpZiAocHVyZ2UgPT0gbnVsbCkge1xuXHRcdFx0cHVyZ2UgPSBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKHB1cmdlIHx8IHRoaXMuX3Jlc2VydmVkU2l6ZSA+IDApIHtcblx0XHRcdHZhciBub2RlID0gdGhpcy5oZWFkO1xuXHRcdFx0dmFyIF9nMSA9IDA7XG5cdFx0XHR2YXIgX2cgPSB0aGlzLl9zaXplO1xuXHRcdFx0d2hpbGUgKF9nMSA8IF9nKSB7XG5cdFx0XHRcdHZhciBpID0gX2cxKys7XG5cdFx0XHRcdHZhciBuZXh0ID0gbm9kZS5uZXh0O1xuXHRcdFx0XHRub2RlLnByZXYgPSBudWxsO1xuXHRcdFx0XHRub2RlLm5leHQgPSBudWxsO1xuXHRcdFx0XHR0aGlzLl9wdXROb2RlKG5vZGUpO1xuXHRcdFx0XHRub2RlID0gbmV4dDtcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5oZWFkID0gdGhpcy50YWlsID0gbnVsbDtcblx0XHR0aGlzLl9zaXplID0gMDtcblx0fSxcblx0aXRlcmF0b3I6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICh0aGlzLnJldXNlSXRlcmF0b3IpIHtcblx0XHRcdGlmICh0aGlzLl9pdGVyYXRvciA9PSBudWxsKSB7XG5cdFx0XHRcdGlmICh0aGlzLl9jaXJjdWxhcikgcmV0dXJuIG5ldyBkZV9wb2x5Z29uYWxfZHNfQ2lyY3VsYXJETExJdGVyYXRvcih0aGlzKTsgZWxzZSByZXR1cm4gbmV3IGRlX3BvbHlnb25hbF9kc19ETExJdGVyYXRvcih0aGlzKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuX2l0ZXJhdG9yLnJlc2V0KCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGhpcy5faXRlcmF0b3I7XG5cdFx0fSBlbHNlIGlmICh0aGlzLl9jaXJjdWxhcikgcmV0dXJuIG5ldyBkZV9wb2x5Z29uYWxfZHNfQ2lyY3VsYXJETExJdGVyYXRvcih0aGlzKTsgZWxzZSByZXR1cm4gbmV3IGRlX3BvbHlnb25hbF9kc19ETExJdGVyYXRvcih0aGlzKTtcblx0fSxcblx0dG9BcnJheTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGEgPSBuZXcgQXJyYXkodGhpcy5fc2l6ZSk7XG5cdFx0dmFyIG5vZGUgPSB0aGlzLmhlYWQ7XG5cdFx0dmFyIF9nMSA9IDA7XG5cdFx0dmFyIF9nID0gdGhpcy5fc2l6ZTtcblx0XHR3aGlsZSAoX2cxIDwgX2cpIHtcblx0XHRcdHZhciBpID0gX2cxKys7XG5cdFx0XHRhW2ldID0gbm9kZS52YWw7XG5cdFx0XHRub2RlID0gbm9kZS5uZXh0O1xuXHRcdH1cblx0XHRyZXR1cm4gYTtcblx0fSxcblx0X21lcmdlU29ydDogZnVuY3Rpb24obm9kZSwgY21wKSB7XG5cdFx0dmFyIGggPSBub2RlO1xuXHRcdHZhciBwO1xuXHRcdHZhciBxO1xuXHRcdHZhciBlO1xuXHRcdHZhciB0YWlsID0gbnVsbDtcblx0XHR2YXIgaW5zaXplID0gMTtcblx0XHR2YXIgbm1lcmdlcztcblx0XHR2YXIgcHNpemU7XG5cdFx0dmFyIHFzaXplO1xuXHRcdHZhciBpO1xuXHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHRwID0gaDtcblx0XHRcdGggPSB0YWlsID0gbnVsbDtcblx0XHRcdG5tZXJnZXMgPSAwO1xuXHRcdFx0d2hpbGUgKHAgIT0gbnVsbCkge1xuXHRcdFx0XHRubWVyZ2VzKys7XG5cdFx0XHRcdHBzaXplID0gMDtcblx0XHRcdFx0cSA9IHA7XG5cdFx0XHRcdHZhciBfZyA9IDA7XG5cdFx0XHRcdHdoaWxlIChfZyA8IGluc2l6ZSkge1xuXHRcdFx0XHRcdHZhciBpMSA9IF9nKys7XG5cdFx0XHRcdFx0cHNpemUrKztcblx0XHRcdFx0XHRxID0gcS5uZXh0O1xuXHRcdFx0XHRcdGlmIChxID09IG51bGwpIGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHFzaXplID0gaW5zaXplO1xuXHRcdFx0XHR3aGlsZSAocHNpemUgPiAwIHx8IHFzaXplID4gMCAmJiBxICE9IG51bGwpIHtcblx0XHRcdFx0XHRpZiAocHNpemUgPT0gMCkge1xuXHRcdFx0XHRcdFx0ZSA9IHE7XG5cdFx0XHRcdFx0XHRxID0gcS5uZXh0O1xuXHRcdFx0XHRcdFx0cXNpemUtLTtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHFzaXplID09IDAgfHwgcSA9PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRlID0gcDtcblx0XHRcdFx0XHRcdHAgPSBwLm5leHQ7XG5cdFx0XHRcdFx0XHRwc2l6ZS0tO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoY21wKHEudmFsLCBwLnZhbCkgPj0gMCkge1xuXHRcdFx0XHRcdFx0ZSA9IHA7XG5cdFx0XHRcdFx0XHRwID0gcC5uZXh0O1xuXHRcdFx0XHRcdFx0cHNpemUtLTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZSA9IHE7XG5cdFx0XHRcdFx0XHRxID0gcS5uZXh0O1xuXHRcdFx0XHRcdFx0cXNpemUtLTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHRhaWwgIT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0dGFpbC5uZXh0ID0gZTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0aCA9IGU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGUucHJldiA9IHRhaWw7XG5cdFx0XHRcdFx0dGFpbCA9IGU7XG5cdFx0XHRcdH1cblx0XHRcdFx0cCA9IHE7XG5cdFx0XHR9XG5cdFx0XHR0YWlsLm5leHQgPSBudWxsO1xuXHRcdFx0aWYgKG5tZXJnZXMgPD0gMSkgYnJlYWs7XG5cdFx0XHRpbnNpemUgPDw9IDE7XG5cdFx0fVxuXHRcdGgucHJldiA9IG51bGw7XG5cdFx0dGhpcy50YWlsID0gdGFpbDtcblx0XHRyZXR1cm4gaDtcblx0fSxcblx0X2luc2VydGlvblNvcnQ6IGZ1bmN0aW9uKG5vZGUsIGNtcCkge1xuXHRcdHZhciBoID0gbm9kZTtcblx0XHR2YXIgbiA9IGgubmV4dDtcblx0XHR3aGlsZSAobiAhPSBudWxsKSB7XG5cdFx0XHR2YXIgbSA9IG4ubmV4dDtcblx0XHRcdHZhciBwID0gbi5wcmV2O1xuXHRcdFx0dmFyIHYgPSBuLnZhbDtcblx0XHRcdGlmIChjbXAodiwgcC52YWwpIDwgMCkge1xuXHRcdFx0XHR2YXIgaSA9IHA7XG5cdFx0XHRcdHdoaWxlIChpLnByZXYgIT0gbnVsbClcblx0XHRcdFx0aWYgKGNtcCh2LCBpLnByZXYudmFsKSA8IDApIHtcblx0XHRcdFx0XHRcdGkgPSBpLnByZXY7XG5cdFx0XHRcdFx0fSBlbHNlIGJyZWFrO1xuXHRcdFx0XHRpZiAobSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0cC5uZXh0ID0gbTtcblx0XHRcdFx0XHRtLnByZXYgPSBwO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHAubmV4dCA9IG51bGw7XG5cdFx0XHRcdFx0dGhpcy50YWlsID0gcDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoaSA9PSBoKSB7XG5cdFx0XHRcdFx0bi5wcmV2ID0gbnVsbDtcblx0XHRcdFx0XHRuLm5leHQgPSBpO1xuXHRcdFx0XHRcdGkucHJldiA9IG47XG5cdFx0XHRcdFx0aCA9IG47XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bi5wcmV2ID0gaS5wcmV2O1xuXHRcdFx0XHRcdGkucHJldi5uZXh0ID0gbjtcblx0XHRcdFx0XHRuLm5leHQgPSBpO1xuXHRcdFx0XHRcdGkucHJldiA9IG47XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdG4gPSBtO1xuXHRcdH1cblx0XHRyZXR1cm4gaDtcblx0fSxcblx0X2dldE5vZGU6IGZ1bmN0aW9uKHgpIHtcblx0XHRpZiAodGhpcy5fcmVzZXJ2ZWRTaXplID09IDAgfHwgdGhpcy5fcG9vbFNpemUgPT0gMCkgcmV0dXJuIG5ldyBkZV9wb2x5Z29uYWxfZHNfRExMTm9kZSh4LCB0aGlzKTsgZWxzZSB7XG5cdFx0XHR2YXIgbiA9IHRoaXMuX2hlYWRQb29sO1xuXHRcdFx0dGhpcy5faGVhZFBvb2wgPSB0aGlzLl9oZWFkUG9vbC5uZXh0O1xuXHRcdFx0dGhpcy5fcG9vbFNpemUtLTtcblx0XHRcdG4ubmV4dCA9IG51bGw7XG5cdFx0XHRuLnZhbCA9IHg7XG5cdFx0XHRyZXR1cm4gbjtcblx0XHR9XG5cdH0sXG5cdF9wdXROb2RlOiBmdW5jdGlvbih4KSB7XG5cdFx0dmFyIHZhbCA9IHgudmFsO1xuXHRcdGlmICh0aGlzLl9yZXNlcnZlZFNpemUgPiAwICYmIHRoaXMuX3Bvb2xTaXplIDwgdGhpcy5fcmVzZXJ2ZWRTaXplKSB7XG5cdFx0XHR0aGlzLl90YWlsUG9vbCA9IHRoaXMuX3RhaWxQb29sLm5leHQgPSB4O1xuXHRcdFx0eC52YWwgPSBudWxsO1xuXHRcdFx0dGhpcy5fcG9vbFNpemUrKztcblx0XHR9IGVsc2Uge1xuXHRcdFx0eC5fbGlzdCA9IG51bGw7XG5cdFx0fVxuXHRcdHJldHVybiB2YWw7XG5cdH0sXG5cdF9fY2xhc3NfXzogZGVfcG9seWdvbmFsX2RzX0RMTFxufTtcblxudmFyIGRlX3BvbHlnb25hbF9kc19ETExJdGVyYXRvciA9IGZ1bmN0aW9uKGYpIHtcblx0dGhpcy5fZiA9IGY7e1xuXHR0aGlzLl93YWxrZXIgPSB0aGlzLl9mLmhlYWQ7XG5cdHRoaXMuX2hvb2sgPSBudWxsO1xuXHR0aGlzO1xuXHR9XG59O1xuZGVfcG9seWdvbmFsX2RzX0RMTEl0ZXJhdG9yLnByb3RvdHlwZSA9IHtcblx0cmVzZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuX3dhbGtlciA9IHRoaXMuX2YuaGVhZDtcblx0XHR0aGlzLl9ob29rID0gbnVsbDtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0aGFzTmV4dDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuX3dhbGtlciAhPSBudWxsO1xuXHR9LFxuXHRuZXh0OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgeCA9IHRoaXMuX3dhbGtlci52YWw7XG5cdFx0dGhpcy5faG9vayA9IHRoaXMuX3dhbGtlcjtcblx0XHR0aGlzLl93YWxrZXIgPSB0aGlzLl93YWxrZXIubmV4dDtcblx0XHRyZXR1cm4geDtcblx0fSxcblx0X19jbGFzc19fOiBkZV9wb2x5Z29uYWxfZHNfRExMSXRlcmF0b3Jcbn07XG5cbnZhciBkZV9wb2x5Z29uYWxfZHNfQ2lyY3VsYXJETExJdGVyYXRvciA9IGZ1bmN0aW9uKGYpIHtcblx0dGhpcy5fZiA9IGY7e1xuXHR0aGlzLl93YWxrZXIgPSB0aGlzLl9mLmhlYWQ7XG5cdHRoaXMuX3MgPSB0aGlzLl9mLl9zaXplO1xuXHR0aGlzLl9pID0gMDtcblx0dGhpcy5faG9vayA9IG51bGw7XG5cdHRoaXM7XG5cdH1cbn07XG5kZV9wb2x5Z29uYWxfZHNfQ2lyY3VsYXJETExJdGVyYXRvci5wcm90b3R5cGUgPSB7XG5cdHJlc2V0OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLl93YWxrZXIgPSB0aGlzLl9mLmhlYWQ7XG5cdFx0dGhpcy5fcyA9IHRoaXMuX2YuX3NpemU7XG5cdFx0dGhpcy5faSA9IDA7XG5cdFx0dGhpcy5faG9vayA9IG51bGw7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdGhhc05leHQ6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLl9pIDwgdGhpcy5fcztcblx0fSxcblx0bmV4dDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHggPSB0aGlzLl93YWxrZXIudmFsO1xuXHRcdHRoaXMuX2hvb2sgPSB0aGlzLl93YWxrZXI7XG5cdFx0dGhpcy5fd2Fsa2VyID0gdGhpcy5fd2Fsa2VyLm5leHQ7XG5cdFx0dGhpcy5faSsrO1xuXHRcdHJldHVybiB4O1xuXHR9LFxuXHRfX2NsYXNzX186IGRlX3BvbHlnb25hbF9kc19DaXJjdWxhckRMTEl0ZXJhdG9yXG59O1xuXG52YXIgZGVfcG9seWdvbmFsX2RzX0RMTE5vZGUgPSBmdW5jdGlvbih4LCBsaXN0KSB7XG5cdHRoaXMudmFsID0geDtcblx0dGhpcy5fbGlzdCA9IGxpc3Q7XG59O1xuZGVfcG9seWdvbmFsX2RzX0RMTE5vZGUucHJvdG90eXBlID0ge1xuXHRfdW5saW5rOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgdCA9IHRoaXMubmV4dDtcblx0XHRpZiAodGhpcy5wcmV2ICE9IG51bGwpIHtcblx0XHRcdHRoaXMucHJldi5uZXh0ID0gdGhpcy5uZXh0O1xuXHRcdH1cblx0XHRpZiAodGhpcy5uZXh0ICE9IG51bGwpIHtcblx0XHRcdHRoaXMubmV4dC5wcmV2ID0gdGhpcy5wcmV2O1xuXHRcdH1cblx0XHR0aGlzLm5leHQgPSB0aGlzLnByZXYgPSBudWxsO1xuXHRcdHJldHVybiB0O1xuXHR9LFxuXHRfaW5zZXJ0QWZ0ZXI6IGZ1bmN0aW9uKG5vZGUpIHtcblx0XHRub2RlLm5leHQgPSB0aGlzLm5leHQ7XG5cdFx0bm9kZS5wcmV2ID0gdGhpcztcblx0XHRpZiAodGhpcy5uZXh0ICE9IG51bGwpIHtcblx0XHRcdHRoaXMubmV4dC5wcmV2ID0gbm9kZTtcblx0XHR9XG5cdFx0dGhpcy5uZXh0ID0gbm9kZTtcblx0fSxcblx0X2luc2VydEJlZm9yZTogZnVuY3Rpb24obm9kZSkge1xuXHRcdG5vZGUubmV4dCA9IHRoaXM7XG5cdFx0bm9kZS5wcmV2ID0gdGhpcy5wcmV2O1xuXHRcdGlmICh0aGlzLnByZXYgIT0gbnVsbCkge1xuXHRcdFx0dGhpcy5wcmV2Lm5leHQgPSBub2RlO1xuXHRcdH1cblx0XHR0aGlzLnByZXYgPSBub2RlO1xuXHR9LFxuXHRfX2NsYXNzX186IGRlX3BvbHlnb25hbF9kc19ETExOb2RlXG59O1xuXG5cbnZhciBkZV9wb2x5Z29uYWxfZHNfSGFzaEtleSA9IGZ1bmN0aW9uKCkge307XG5kZV9wb2x5Z29uYWxfZHNfSGFzaEtleS5fY291bnRlciA9IDA7XG4iXX0=
