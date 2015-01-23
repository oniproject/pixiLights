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
