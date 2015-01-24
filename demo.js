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

},{".":"/home/lain/gocode/src/oniproject/pixiLights/index.js"}],"/home/lain/gocode/src/oniproject/pixiLights/index.js":[function(require,module,exports){
'use strict';

module.exports = require('./src/LightContainer');

},{"./src/LightContainer":"/home/lain/gocode/src/oniproject/pixiLights/src/LightContainer.js"}],"/home/lain/gocode/src/oniproject/pixiLights/src/DiffuseShader.js":[function(require,module,exports){
'use strict';

//var r = t("PIXI");

var DiffuseShader = module.exports = function(gl) {
	PIXI.PixiShader.call(this, gl)
};

DiffuseShader.prototype = Object.create(PIXI.PixiShader.prototype);
DiffuseShader.prototype.constructor = DiffuseShader;

DiffuseShader.prototype.init = function() {
	var gl = this.gl;

	this.vertexSrc = [
		"attribute vec2 aVertexPosition;",
		"attribute vec2 aTextureCoord;",
		"attribute vec4 aColor;",
		"attribute float aRotation;",
		"uniform vec2 projectionVector;",
		"uniform vec2 offsetVector;",
		"uniform float flipY;",
		"varying vec2 vTextureCoord;",
		"varying float vRotation;",
		"varying vec4 vColor;",
		"const vec2 center = vec2(-1.0, 1.0);",
		"void main(void) {",
		"   vec2 finalV = aVertexPosition + offsetVector;",
		"   gl_Position = vec4( finalV.x / projectionVector.x -1.0, (finalV.y / projectionVector.y * +flipY ) + flipY , 0.0, 1.0);",
		"   vTextureCoord = aTextureCoord;",
		"   vRotation = aRotation;",
		"   vColor = aColor;",
		"}"
	];

	this.fragmentSrc = [
		"precision lowp float;",
		"varying vec2 vTextureCoord;",
		"varying vec4 vColor;",
		"varying float vRotation;",
		"uniform sampler2D uSampler;",
		"#define M_PI 3.1415926535897932384626433832795",
		"void main(void) {",
		"   gl_FragColor = texture2D(uSampler, vTextureCoord);",
		"}"
	];

	var e = PIXI.compileProgram(gl, this.vertexSrc, this.fragmentSrc);
	gl.useProgram(e);

	this.uSampler = gl.getUniformLocation(e, "uSampler");
	this.projectionVector = gl.getUniformLocation(e, "projectionVector");
	this.offsetVector = gl.getUniformLocation(e, "offsetVector");
	this.dimensions = gl.getUniformLocation(e, "dimensions");
	this.flipY = gl.getUniformLocation(e, "flipY");
	this.aVertexPosition = gl.getAttribLocation(e, "aVertexPosition");
	this.aTextureCoord = gl.getAttribLocation(e, "aTextureCoord");
	this.colorAttribute = gl.getAttribLocation(e, "aColor");
	this.aRotation = gl.getAttribLocation(e, "aRotation");

	-1 === this.colorAttribute && (this.colorAttribute = 2);

	this.attributes = [
		this.aVertexPosition,
		this.aTextureCoord,
		this.colorAttribute,
		this.aRotation
	];

	for (var i in this.uniforms) {
		this.uniforms[i].uniformLocation = gl.getUniformLocation(e, i);
	}
	this.initUniforms();
	this.program = e;
};

//module.exports = DiffuseShader;

},{}],"/home/lain/gocode/src/oniproject/pixiLights/src/LightContainer.js":[function(require,module,exports){
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

LightContainer.prototype.drawLight = function(num, cx, cy, color, alpha) {
	if (color == null) {
		color = 0x000000;
	}
	if (alpha == null) {
		alpha = 1.0;
	}

	if (num < 4 && this.diff.shader) {
		this.diff.shader.uniforms.LightPos.value[num * 3 + 0] = cx;
		this.diff.shader.uniforms.LightPos.value[num * 3 + 1] = cy;
		this.diff.shader.uniforms.LightPos.value[num * 3 + 2] = .1;

		var r = (color >> 16) & 0xff;
		var g = (color >> 8) & 0xff;
		var b = (color >> 0) & 0xff;

		this.diff.shader.uniforms.LightColor.value[num * 4 + 0] = r / 256;
		this.diff.shader.uniforms.LightColor.value[num * 4 + 1] = g / 256;
		this.diff.shader.uniforms.LightColor.value[num * 4 + 2] = b / 256;
		this.diff.shader.uniforms.LightColor.value[num * 4 + 3] = alpha;
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
	this.walls = walls;
	this.blocks = blocks;
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

},{"./LightSpriteBatch":"/home/lain/gocode/src/oniproject/pixiLights/src/LightSpriteBatch.js","./NormalMapFilter":"/home/lain/gocode/src/oniproject/pixiLights/src/NormalMapFilter.js","./visibility":"/home/lain/gocode/src/oniproject/pixiLights/src/visibility.js"}],"/home/lain/gocode/src/oniproject/pixiLights/src/LightShader.js":[function(require,module,exports){
'use strict';

//var r = t("PIXI");

var LightShader = module.exports = function(t) {
	PIXI.PixiShader.call(this, t)
};

LightShader.prototype = Object.create(PIXI.PixiShader.prototype);
LightShader.prototype.constructor = LightShader;

LightShader.prototype.init = function() {
	var t = this.gl;
	this.vertexSrc = [
		"attribute vec2 aVertexPosition;",
		"attribute vec2 aTextureCoord;",
		"attribute vec4 aColor;",
		"attribute float aRotation;",
		"uniform vec2 projectionVector;",
		"uniform vec2 offsetVector;",
		"uniform float flipY;",
		"varying vec2 vTextureCoord;",
		"varying float vRotation;",
		"varying vec4 vColor;",
		"const vec2 center = vec2(-1.0, 1.0);",
		"void main(void) {",
		"   vec2 finalV = aVertexPosition + offsetVector;",
		"   gl_Position = vec4( finalV.x / projectionVector.x -1.0, (finalV.y / projectionVector.y * +flipY ) + flipY , 0.0, 1.0);",
		"   vTextureCoord = aTextureCoord;",
		"   vRotation = aRotation;",
		"   vColor = aColor;",
		"}"
	];
	this.fragmentSrc = [
		"precision lowp float;",
		"varying vec2 vTextureCoord;",
		"varying vec4 vColor;",
		"varying float vRotation;",
		"uniform sampler2D uSampler;",
		"#define M_PI 3.1415926535897932384626433832795",
		"void main(void) {",
		"    vec4 color =  texture2D(uSampler, vTextureCoord);",
		"    vec3 NormalMap = color.rgb;",
		"    vec3 N = normalize(NormalMap * 2.0 - 1.0);",
		"    float angle = vRotation;",
		"    vec2 rotatedN;",
		"    rotatedN.r = (N.r)*sin(angle) - (N.g)*cos(angle);",
		"    rotatedN.g = (N.r)*cos(angle) + (N.g)*sin(angle);",
		"    N.r = rotatedN.g;",
		"    N.g = rotatedN.r;",
		"    NormalMap = N;",
		"    NormalMap = (NormalMap + 1.0) / 2.0;",
		"    gl_FragColor = vec4(NormalMap * color.a, color.a);",
		"}"
	];

	var e = PIXI.compileProgram(t, this.vertexSrc, this.fragmentSrc);
	t.useProgram(e),

	this.uSampler = t.getUniformLocation(e, "uSampler"),
	this.projectionVector = t.getUniformLocation(e, "projectionVector"),
	this.offsetVector = t.getUniformLocation(e, "offsetVector"),
	this.dimensions = t.getUniformLocation(e, "dimensions"),
	this.flipY = t.getUniformLocation(e, "flipY"),
	this.aVertexPosition = t.getAttribLocation(e, "aVertexPosition"),
	this.aTextureCoord = t.getAttribLocation(e, "aTextureCoord"),
	this.colorAttribute = t.getAttribLocation(e, "aColor"),
	this.aRotation = t.getAttribLocation(e, "aRotation"),

	-1 === this.colorAttribute && (this.colorAttribute = 2),

	this.attributes = [this.aVertexPosition, this.aTextureCoord,
	this.colorAttribute, this.aRotation];

	for (var i in this.uniforms) {
		this.uniforms[i].uniformLocation = t.getUniformLocation(e, i);
	}
	this.initUniforms();
	this.program = e;
};

//module.exports = LightShader;

},{}],"/home/lain/gocode/src/oniproject/pixiLights/src/LightSpriteBatch.js":[function(require,module,exports){
'use strict';
/*
var r = t("PIXI"),
	o = t("./LightShader"),
	n = t("./DiffuseShader");
*/

var LightShader = require('./LightShader');
var DiffuseShader = require('./DiffuseShader');

var LightSpriteBatch = module.exports = function(diff, norm, occ) {
	this.diffuseTexture = diff;
	this.normalTexture = norm;
	this.occludersFBO = occ;
	this.vertSize = 6;
	this.size = 1e4;

	var i = 4 * this.size * 4 * this.vertSize,
		o = 6 * this.size;

	this.vertices = new PIXI.ArrayBuffer(i);
	this.positions = new PIXI.Float32Array(this.vertices);
	this.colors = new PIXI.Uint32Array(this.vertices);
	this.indices = new PIXI.Uint16Array(o);
	this.lastIndexCount = 0;
	for (var n = 0, s = 0; o > n; n += 6, s += 4) {
		this.indices[n + 0] = s + 0;
		this.indices[n + 1] = s + 1;
		this.indices[n + 2] = s + 2;
		this.indices[n + 3] = s + 0;
		this.indices[n + 4] = s + 2;
		this.indices[n + 5] = s + 3;
	}
	this.drawing = !1;
	this.currentBatchSize = 0;
	this.currentBaseTexture = null;
	this.dirty = !0;
	this.textures = [];
	this.blendModes = [];
	this.shaders = [];
	this.sprites = [];
	this.defaultShader = new PIXI.AbstractFilter(["precision lowp float;",
		"varying vec2 vTextureCoord;",
		"varying vec4 vColor;",
		"uniform sampler2D uSampler;",
		"void main(void) {",
		"   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;",
		"}"
	]);
}

LightSpriteBatch.prototype.setContext = function(gl) {
	this.gl = gl;
	this.vertexBuffer = gl.createBuffer();
	this.indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
	this.currentBlendMode = 99999;
	this.lightShader = new LightShader(gl);
	this.diffuseShader = new DiffuseShader(gl);
	// TODO occludersFBO
	//this.occludersShader = new OccShader(gl);
}

LightSpriteBatch.prototype.begin = function(renderSession) {
	this.renderSession = renderSession;
	this.shader = this.renderSession.shaderManager.defaultShader;
	this.start()
}

LightSpriteBatch.prototype.end = function() {
	this.flush()
}

LightSpriteBatch.prototype.render = function(t) {
	var e = t.texture;
	if (this.currentBatchSize >= this.size) {
		this.flush();
		this.currentBaseTexture = e.baseTexture;
	}
	var i = e._uvs;
	if (i) {
		var r, o, n, s,
			a = t.anchor.x,
			h = t.anchor.y;
		if (e.trim) {
			var l = e.trim;
			o = l.x - a * l.width, r = o + e.crop.width, s = l.y - h * l.height, n = s + e.crop.height
		} else {
			r = e.frame.width * (1 - a), o = e.frame.width * -a, n = e.frame.height * (1 - h), s = e.frame.height * -h;
		}
		var u = 4 * this.currentBatchSize * this.vertSize,
			c = e.baseTexture.resolution,
			p = t.worldTransform,
			d = p.a / c,
			f = p.b / c,
			m = p.c / c,
			v = p.d / c,
			g = p.tx,
			y = p.ty,
			x = this.colors,
			b = this.positions,
			w = t.tint,
			_ = (w >> 16) + (65280 & w) + ((255 & w) << 16) + (255 * t.alpha << 24),
			T = Math.atan2(f, d);

		b[u++] = d * o + m * s + g;
		b[u++] = v * s + f * o + y;
		b[u++] = i.x0;
		b[u++] = i.y0;
		x[u++] = _;
		this.positions[u++] = T;
		b[u++] = d * r + m * s + g;
		b[u++] = v * s + f * r + y;
		b[u++] = i.x1;
		b[u++] = i.y1;
		x[u++] = _;
		this.positions[u++] = T;
		b[u++] = d * r + m * n + g;
		b[u++] = v * n + f * r + y;
		b[u++] = i.x2;
		b[u++] = i.y2;
		x[u++] = _;
		this.positions[u++] = T;
		b[u++] = d * o + m * n + g;
		b[u++] = v * n + f * o + y;
		b[u++] = i.x3;
		b[u++] = i.y3;
		x[u++] = _;
		this.positions[u++] = T;
		this.sprites[this.currentBatchSize++] = t
	}
}

LightSpriteBatch.prototype.renderTilingSprite = function(t) {
	var e = t.tilingTexture;
	this.currentBatchSize >= this.size && (this.flush(), this.currentBaseTexture = e.baseTexture);
	t._uvs || (t._uvs = new PIXI.TextureUvs);
	var i = t._uvs;
	t.tilePosition.x %= e.baseTexture.width * t.tileScaleOffset.x;
	t.tilePosition.y %= e.baseTexture.height * t.tileScaleOffset.y;
	var o = t.tilePosition.x / (e.baseTexture.width * t.tileScaleOffset.x),
		n = t.tilePosition.y / (e.baseTexture.height * t.tileScaleOffset.y),
		s = t.width / e.baseTexture.width / (t.tileScale.x * t.tileScaleOffset.x),
		a = t.height / e.baseTexture.height / (t.tileScale.y * t.tileScaleOffset.y);

	i.x0 = 0 - o;
	i.y0 = 0 - n;
	i.x1 = 1 * s - o;
	i.y1 = 0 - n;
	i.x2 = 1 * s - o;
	i.y2 = 1 * a - n;
	i.x3 = 0 - o;
	i.y3 = 1 * a - n;
	var h = t.tint,
		l = (h >> 16) + (65280 & h) + ((255 & h) << 16) + (255 * t.alpha << 24),
		u = this.positions,
		c = this.colors,
		p = t.width,
		d = t.height,
		f = t.anchor.x,
		m = t.anchor.y,
		v = p * (1 - f),
		g = p * -f,
		y = d * (1 - m),
		x = d * -m,
		b = 4 * this.currentBatchSize * this.vertSize,
		w = e.baseTexture.resolution,
		_ = t.worldTransform,
		T = _.a / w,
		S = _.b / w,
		A = _.c / w,
		C = _.d / w,
		E = _.tx,
		M = _.ty;

	u[b++] = T * g + A * x + E;
	u[b++] = C * x + S * g + M;
	u[b++] = i.x0;
	u[b++] = i.y0;
	c[b++] = l;
	u[b++] = T * v + A * x + E;
	u[b++] = C * x + S * v + M;
	u[b++] = i.x1;
	u[b++] = i.y1;
	c[b++] = l;
	u[b++] = T * v + A * y + E;
	u[b++] = C * y + S * v + M;
	u[b++] = i.x2;
	u[b++] = i.y2;
	c[b++] = l;
	u[b++] = T * g + A * y + E;
	u[b++] = C * y + S * g + M;
	u[b++] = i.x3;
	u[b++] = i.y3;
	c[b++] = l;
	this.sprites[this.currentBatchSize++] = t
}

LightSpriteBatch.prototype.flush = function() {
	if (0 !== this.currentBatchSize) {
		var t,
			gl = this.gl;

		if (this.dirty) {
			this.dirty = !1;
			t = this.lightShader;
			gl.activeTexture(gl.TEXTURE0); gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

			var i = 4 * this.vertSize;
			gl.vertexAttribPointer(t.aVertexPosition, 2, gl.FLOAT, !1, i, 0);
			gl.vertexAttribPointer(t.aTextureCoord, 2, gl.FLOAT, !1, i, 8);
			gl.vertexAttribPointer(t.colorAttribute, 4, gl.UNSIGNED_BYTE, !0, i, 16);
			gl.vertexAttribPointer(t.aRotation, 1, gl.FLOAT, !1, i, 20)
		}

		if (this.currentBatchSize > .5 * this.size) {
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
		} else {
			var r = this.positions.subarray(0, 4 * this.currentBatchSize * this.vertSize);
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, r)
		}

		gl.bindFramebuffer(gl.FRAMEBUFFER, this.normalTexture.frameBuffer);
		gl.clearColor(.5, .5, 1, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);
		this.renderSprite(this.lightShader, true);

		gl.bindFramebuffer(gl.FRAMEBUFFER, this.diffuseTexture.frameBuffer);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		this.renderSprite(this.diffuseShader, false);

		/*/ TODO
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.occludersFBO.frameBuffer);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		this.renderSprite(this.occludersShader, false);
		*/

		gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderSession.buffer);

		this.currentBatchSize = 0;
	}
}

LightSpriteBatch.prototype.renderSprite = function(t, isNormalMap) {
	var i, r, o, n,
		gl = this.gl,
		a = 0,
		h = 0,
		l = null,
		u = this.renderSession.blendModeManager.currentBlendMode,
		c = t,
		p = !1,
		d = !1;

	this.renderSession.shaderManager.setShader(c);
	c.dirty && c.syncUniforms();

	var f = this.renderSession.projection;
	gl.uniform2f(c.projectionVector, f.x, f.y);

	var m = this.renderSession.offset;
	gl.uniform2f(c.offsetVector, m.x, m.y);
	gl.uniform1f(c.flipY, -1);

	for (var v = 0, g = this.currentBatchSize; g > v; v++) {
		n = this.sprites[v];
		i = isNormalMap ? n.normalMap.baseTexture : n.texture.baseTexture;
		p = u !== r;
		d = c !== o;
		if (l !== i) {
			this.renderBatch(l, a, h);
			h = v;
			a = 0;
			l = i;
		}
		a++;
	}
	this.renderBatch(l, a, h)
}

LightSpriteBatch.prototype.renderBatch = function(t, e, i) {
	if (0 !== e) {
		var gl = this.gl;
		if (t._dirty[gl.id]) {
			this.renderSession.renderer.updateTexture(t)
		} else {
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, t._glTextures[gl.id]);
		}
		gl.drawElements(gl.TRIANGLES, 6 * e, gl.UNSIGNED_SHORT, 6 * i * 2);
		this.renderSession.drawCount++
	}
}

LightSpriteBatch.prototype.stop = function() {
	this.flush();
	this.dirty = !0
}

LightSpriteBatch.prototype.start = function() {
	this.dirty = !0
}

LightSpriteBatch.prototype.destroy = function() {
	this.vertices = null;
	this.indices = null; this.gl.deleteBuffer(this.vertexBuffer); this.gl.deleteBuffer(this.indexBuffer);
	this.currentBaseTexture = null;
	this.gl = null
}

// module.exports = LightSpriteBatch

},{"./DiffuseShader":"/home/lain/gocode/src/oniproject/pixiLights/src/DiffuseShader.js","./LightShader":"/home/lain/gocode/src/oniproject/pixiLights/src/LightShader.js"}],"/home/lain/gocode/src/oniproject/pixiLights/src/NormalMapFilter.js":[function(require,module,exports){
'use strict';

//var r = t("PIXI");

var NormalMapFilter = module.exports = function(t) {
	PIXI.AbstractFilter.call(this);
	this.passes = [this];
	this.uniforms = {
		displacementMap: {
			type: "sampler2D",
			value: t
		},
		scale: {
			type: "2f",
			value: {
				x: 1,
				y: 1
			}
		},
		offset: {
			type: "2f",
			value: {
				x: 0,
				y: 0
			}
		},
		mapDimensions: {
			type: "2f",
			value: {
				x: 1,
				y: 1
			}
		},
		zoomScale: {
			type: "2f",
			value: {
				x: 1,
				y: 1
			}
		},
		dimensions: {
			type: "4fv",
			value: [0, 0, 0, 0]
		},

		LightPos: {
			type: "3fv",
			value: [
				1, 1, .1,
				//1, 1, .1,
			]
		},
		LightColor: {
			type: "4fv",
			value: [
				1.0, 0, 0.8, 1.0,
				//0.0, 0.9, 0.8, 1.0,
			]
		},


		Falloff: {
			type: "3fv",
			value: [
				//0, .1, .4,
				0.2, .1, .4,
			]
		},


		AmbientColor: {
			type: "4fv",
			value: [0.9, 241.0 / 255.0, 224.0 / 255.0, 0.2]
		},
	};

	if (t.baseTexture.hasLoaded) {
		this.uniforms.mapDimensions.value.x = t.width;
		this.uniforms.mapDimensions.value.y = t.height;
	} else {
		this.boundLoadedFunction = this.onTextureLoaded.bind(this);
		t.baseTexture.on("loaded", this.boundLoadedFunction);
	}

	this.fragmentSrc = [
		"precision mediump float;",
		"#define MAX_LIGHTS 64",
		"varying vec2 vTextureCoord;",
		"varying vec4 vColor;",
		"uniform sampler2D uSampler;",
		"uniform sampler2D displacementMap;",
		"uniform vec4 dimensions;",
		"const vec2 Resolution = vec2(1.0,1.0);",
		"uniform vec3 LightPos[MAX_LIGHTS];",
		//"const vec4 LightColor = vec4(0.9, 241.0/255.0, 224.0/255.0, 1.0);",
		"uniform vec4 LightColor[MAX_LIGHTS];",
		//"const vec4 AmbientColor = vec4(0.9, 241.0/255.0, 224.0/255.0, 0.3);",
		"uniform vec4 AmbientColor;",

		//"const vec3 Falloff = vec3(0.0, 0.1, 0.4);",
		//"const vec3 Falloff = vec3(0.4, 3.2, 20.0);",
		//"/*const*/ vec3 Falloff = vec3(0.0, 0.2, 00.0);",
		"uniform vec3 Falloff;",
		"uniform vec3 LightDir;",
		"uniform vec2 mapDimensions;",
		"uniform vec2 zoomScale;",

		"void main(void) {",
		"    vec2 mapCords = vTextureCoord.xy;",
		"    vec4 color = texture2D(uSampler, vTextureCoord.st);",
		"    vec3 nColor = texture2D(displacementMap, vTextureCoord.st).rgb;",
		"    mapCords *= dimensions.xy/mapDimensions;",

		"    vec4 DiffuseColor = texture2D(displacementMap, vTextureCoord);",
		"    vec3 NormalMap = texture2D(uSampler, vTextureCoord).rgb;",

		"    vec3 Sum = vec3(0.0);",
		"    for (int i=0; i<MAX_LIGHTS; i++) {",
		"        if(LightColor[i].a == 0.0) {",
		"            break;",
		"        }",
		"        vec3 LightDir = vec3((LightPos[i].xy/mapDimensions) - (vTextureCoord.xy), LightPos[i].z);",

		"        // Determine distance (used for attenuation BEFORE we normalize our LightDir",
		"        float D = length(LightDir);",
		"        // normalize our vectors",
		"        vec3 N = normalize(NormalMap * 2.0 - 1.0);",
		"        vec3 L = normalize(LightDir);",

		"        // Pre-multiply lights color with intensity",
		"        // Then perform 'N dot L' to determine our diffuse term",
		"        vec3 Diffuse = (LightColor[i].rgb * LightColor[i].a) * max(dot(N, L), 0.0) * 1.0;",


		//" Falloff.z = LightColor[i].a*100.0;",
		"    // calculate attenuation",
		"        float Attenuation = 1.0 / (Falloff.x + (Falloff.y*D) + (Falloff.z*D*D));",
		//"        /*float*/ Attenuation = 0.2/D;",
		//"        Attenuation = min(Attenuation, 1.0);",

		"        // the calculation hich brings it all together",
		"        vec3 Intensity = (Diffuse * Attenuation) /*+ Ambient*/;",
		//"        vec3 FinalColor = DiffuseColor.rgb * Intensity;",
		//"        Sum += FinalColor;",
		"        Sum += Intensity;",
		"    }",

		"    // Pre-multiply ambient color with intensity",
		"    vec3 Ambient = AmbientColor.rgb * AmbientColor.a;",
		"    vec3 Intensity = Sum + Ambient;",
		"    vec3 FinalColor = DiffuseColor.rgb * Intensity;",
		"    gl_FragColor = vColor * vec4(FinalColor, DiffuseColor.a);",
		"}"
	];

}
NormalMapFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
NormalMapFilter.prototype.constructor = NormalMapFilter;
NormalMapFilter.prototype.onTextureLoaded = function() {
	this.uniforms.mapDimensions.value.x = this.uniforms.displacementMap.value.width;
	this.uniforms.mapDimensions.value.y = this.uniforms.displacementMap.value.height;
	this.uniforms.displacementMap.value.baseTexture.off("loaded", this.boundLoadedFunction);
}
Object.defineProperty(NormalMapFilter.prototype, "map", {
	get: function() {
		return this.uniforms.displacementMap.value
	},
	set: function(t) {
		this.uniforms.displacementMap.value = t
	}
});
Object.defineProperty(NormalMapFilter.prototype, "scale", {
	get: function() {
		return this.uniforms.scale.value
	},
	set: function(t) {
		this.uniforms.scale.value = t
	}
});
Object.defineProperty(NormalMapFilter.prototype, "offset", {
	get: function() {
		return this.uniforms.offset.value
	},
	set: function(t) {
		this.uniforms.offset.value = t
	}
});

//module.exports = NormalMapFilter

},{}],"/home/lain/gocode/src/oniproject/pixiLights/src/visibility.js":[function(require,module,exports){
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
			var w = block.r || block.width;
			var h = block.r || block.height;

			/*
			this.addSegment(x - r, y - r, x - r, y + r);
			this.addSegment(x - r, y + r, x + r, y + r);
			this.addSegment(x + r, y + r, x + r, y - r);
			this.addSegment(x + r, y - r, x - r, y - r);
			*/
			/*
			this.addSegment(x - w, y - h, x - w, y + h);
			this.addSegment(x - w, y + h, x + w, y + h);
			this.addSegment(x + w, y + h, x + w, y - h);
			this.addSegment(x + w, y - h, x - w, y - h);
			*/
			this.addSegment(x, y, x, y + h);
			this.addSegment(x, y + h, x + w, y + h);
			this.addSegment(x + w, y + h, x + w, y);
			this.addSegment(x + w, y, x, y);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZW1vLnNyYy5qcyIsImluZGV4LmpzIiwic3JjL0RpZmZ1c2VTaGFkZXIuanMiLCJzcmMvTGlnaHRDb250YWluZXIuanMiLCJzcmMvTGlnaHRTaGFkZXIuanMiLCJzcmMvTGlnaHRTcHJpdGVCYXRjaC5qcyIsInNyYy9Ob3JtYWxNYXBGaWx0ZXIuanMiLCJzcmMvdmlzaWJpbGl0eS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsUEE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgTGlnaHRDb250YWluZXIgPSByZXF1aXJlKCcuJyk7XG5cbnZhciBzdGF0cyA9IG5ldyBTdGF0cygpO1xuXG5zdGF0cy5zZXRNb2RlKDApO1xuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG5zdGF0cy5kb21FbGVtZW50LnN0eWxlLnJpZ2h0ID0gJzBweCc7XG5zdGF0cy5kb21FbGVtZW50LnN0eWxlLnRvcCA9ICcwcHgnO1xuXG5cbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc3RhdHMuZG9tRWxlbWVudCk7XG5cbnZhciBzdGFnZSA9IG5ldyBQSVhJLlN0YWdlKCAvKjB4NjZGRjk5Ki8gKTtcbnZhciByZW5kZXJlciA9IFBJWEkuYXV0b0RldGVjdFJlbmRlcmVyKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQsIHtcblx0Ly8gdmlldzogLi4uLFxuXHR0cmFuc3BhcmVudDogZmFsc2UsXG5cdGFudGlhbGlhczogdHJ1ZSxcblx0cHJlc2VydmVkRHJhd2luZ0J1ZmZlcjogZmFsc2UsXG5cdHJlc29sdXRpb246IDEsXG59KTtcbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQocmVuZGVyZXIudmlldyk7XG5cblxudmFyIG1hemVXYWxscyA9IFtcblx0Ly8gSG9yaXpvbnRhbCB3YWxsc1xuXHRbMjAsIDYwLCA2MCwgNjBdLCBbNjAsIDYwLCAxMDAsIDYwXSwgWzEwMCwgNjAsIDE0MCwgNjBdLCBbMTQwLCA2MCwgMTgwLCA2MF0sXG5cdFs2MCwgMTAwLCAxMDAsIDEwMF0sIFsxMDAsIDEwMCwgMTQwLCAxMDBdLFxuXHRbMjYwLCAxMDAsIDMwMCwgMTAwXSwgWzMwMCwgMTAwLCAzNDAsIDEwMF0sXG5cdFsxNDAsIDE0MCwgMTgwLCAxNDBdLCBbMTgwLCAxNDAsIDIyMCwgMTQwXSxcblx0WzMwMCwgMTQwLCAzNDAsIDE0MF0sIFszNDAsIDE0MCwgMzgwLCAxNDBdLFxuXHRbMTQwLCAyNjAsIDE4MCwgMjYwXSwgWzE4MCwgMjYwLCAyMjAsIDI2MF0sXG5cdFsyMTUsIDI0MCwgMjI1LCAyNDBdLCBbMjYwLCAyMjAsIDI3NSwgMjIwXSxcblx0Ly8gVmVydGljYWwgd2FsbHNcblx0WzMwMCwgMjAsIDMwMCwgNjBdLFxuXHRbMTgwLCA2MCwgMTgwLCAxMDBdLCBbMTgwLCAxMDAsIDE4MCwgMTQwXSxcblx0WzI2MCwgNjAsIDI2MCwgMTAwXSwgWzM0MCwgNjAsIDM0MCwgMTAwXSxcblx0WzE4MCwgMTQwLCAxODAsIDE4MF0sIFsxODAsIDE4MCwgMTgwLCAyMjBdLFxuXHRbMjYwLCAxNDAsIDI2MCwgMTgwXSwgWzI2MCwgMTgwLCAyNjAsIDIyMF0sXG5cdFsxNDAsIDIyMCwgMTQwLCAyNjBdLCBbMTQwLCAyNjAsIDE0MCwgMzAwXSwgWzE0MCwgMzAwLCAxNDAsIDM0MF0sXG5cdFsyMjAsIDI0MCwgMjIwLCAyNjBdLCBbMjIwLCAzNDAsIDIyMCwgMzgwXSxcblx0Ly8gV2FsbCB3aXRoIGhvbGVzXG5cdFsyMjAsIDI2MCwgMjIwLCAyNjhdLCBbMjIwLCAyNzAsIDIyMCwgMjc4XSwgWzIyMCwgMjgwLCAyMjAsIDI4OF0sXG5cdFsyMjAsIDI5MCwgMjIwLCAyOThdLCBbMjIwLCAzMDAsIDIyMCwgMzA4XSwgWzIyMCwgMzEwLCAyMjAsIDMxOF0sXG5cdFsyMjAsIDMyMCwgMjIwLCAzMjhdLCBbMjIwLCAzMzAsIDIyMCwgMzM4XSxcblx0Ly8gUGlsbGFyc1xuXHRbMjEwLCA3MCwgMjMwLCA3MF0sIFsyMzAsIDcwLCAyMzAsIDkwXSwgWzIzMCwgOTAsIDIyMiwgOTBdLCBbMjE4LCA5MCwgMjEwLCA5MF0sIFsyMTAsIDkwLCAyMTAsIDcwXSxcblx0WzUxLCAyNDAsIDYwLCAyMzFdLCBbNjAsIDIzMSwgNjksIDI0MF0sIFs2OSwgMjQwLCA2MCwgMjQ5XSwgWzYwLCAyNDksIDUxLCAyNDBdLFxuXHQvLyBDdXJ2ZXNcblx0WzIwLCAxNDAsIDUwLCAxNDBdLCBbNTAsIDE0MCwgODAsIDE1MF0sIFs4MCwgMTUwLCA5NSwgMTgwXSwgWzk1LCAxODAsIDEwMCwgMjIwXSxcblx0WzEwMCwgMjIwLCAxMDAsIDI2MF0sIFsxMDAsIDI2MCwgOTUsIDMwMF0sIFs5NSwgMzAwLCA4MCwgMzMwXSxcblx0WzMwMCwgMTgwLCAzMjAsIDIyMF0sIFszMjAsIDIyMCwgMzIwLCAyNDBdLCBbMzIwLCAyNDAsIDMxMCwgMjYwXSxcblx0WzMxMCwgMjYwLCAzMDUsIDI3NV0sIFszMDUsIDI3NSwgMzAwLCAzMDBdLCBbMzAwLCAzMDAsIDMwMCwgMzEwXSxcblx0WzMwMCwgMzEwLCAzMDUsIDMzMF0sIFszMDUsIDMzMCwgMzMwLCAzNTBdLCBbMzMwLCAzNTAsIDM2MCwgMzYwXSxcbl07XG5cbnZhciBtYXplTGlnaHRzID0gW1xuXHQvLyB0b3AgaGFsbHdheVxuXHRbNDAsIDU5XSwgWzgwLCAyMV0sIFsxMjAsIDU5XSwgWzE2MCwgMjFdLFxuXHRbMjk3LCAyM10sIFszMDMsIDIzXSwgWzM3NywgMjNdLFxuXHRbMjYzLCA5N10sIFszMzcsIDk3XSxcblx0Ly8gdXBwZXIgbGVmdCByb29tXG5cdFsyMywgNjNdLCBbMTc3LCA2M10sIFsyMywgMTM3XSwgWzE3NywgMTM3XSxcblx0Ly8gcm91bmQgcm9vbSBvbiBsZWZ0XG5cdFs0NSwgMjM1XSwgWzQ1LCAyNDBdLCBbNDUsIDI0NV0sXG5cdC8vIHVwcGVyIHBpbGxhclxuXHRbMjIwLCA4MF0sXG5cdC8vIGhhbGx3YXkgb24gbGVmdFxuXHRbMTIwLCAyODBdLFxuXHQvLyBuZXh0IHRvIHdhbGwgbm90Y2hcblx0WzIxNywgMjQzXSxcblx0Ly8gaW5zaWRlIHJvb20gd2l0aCBob2xlc1xuXHRbMTgwLCAyOTBdLCBbMTgwLCAzMjBdLCBbMTgwLCAzNTBdLFxuXHQvLyByaWdodCBjdXJ2ZWQgcm9vbVxuXHRbMzIwLCAzMjBdLFxuXHQvLyByaWdodCBoYWxsd2F5XG5cdFsyNzAsIDE3MF0sXG5dO1xuXG5mb3IgKHZhciBpID0gMCwgbCA9IG1hemVMaWdodHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdHZhciBjb2xvciA9IE1hdGgucmFuZG9tKCkgKiAweGZmZmZmZjtcblx0bWF6ZUxpZ2h0c1tpXS5wdXNoKGNvbG9yIHwgMCk7XG59XG5cbnZhciBjb250YWluZXIgPSBuZXcgTGlnaHRDb250YWluZXIoKTtcbnN0YWdlLmFkZENoaWxkKGNvbnRhaW5lci5ncmFwaGljcyk7XG5zdGFnZS5hZGRDaGlsZChjb250YWluZXIubm9ybSk7XG5zdGFnZS5hZGRDaGlsZChjb250YWluZXIuZGlmZik7XG5zdGFnZS5hZGRDaGlsZChjb250YWluZXIpO1xuXG5jb250YWluZXIubG9hZE1hcChtYXplV2FsbHMpO1xuXG52YXIgYXNzZXRzVG9Mb2FkZXIgPSBbJ3ByZXNlbnRDb2xvdXJzLmpzb24nLCAncHJlc2VudE5vcm1hbHMuanNvbicsICdjb3VjaC5qcGcnLCAnY291bmNoX25vcm0uanBnJ107XG52YXIgbG9hZGVyID0gbmV3IFBJWEkuQXNzZXRMb2FkZXIoYXNzZXRzVG9Mb2FkZXIpO1xubG9hZGVyLm9uQ29tcGxldGUgPSBvbkFzc2V0c0xvYWRlZDtcbmxvYWRlci5sb2FkKCk7XG5cbmZ1bmN0aW9uIG9uQXNzZXRzTG9hZGVkKCkge1xuXHR2YXIgZGlmZiA9ICdib3hfZGlmZjAyLnBuZyc7XG5cdHZhciBub3JtID0gJ2JveF9ub3JtMDIucG5nJztcblxuXHR2YXIgc3ByaXRlID0gUElYSS5TcHJpdGUuZnJvbUltYWdlKGRpZmYpO1xuXHRzcHJpdGUueCA9IDU2MDtcblx0c3ByaXRlLnkgPSAxNjA7XG5cdHNwcml0ZS5hbmNob3IueCA9IHNwcml0ZS5hbmNob3IueSA9IDAuNTtcblx0c3ByaXRlLnNjYWxlLnggPSBzcHJpdGUuc2NhbGUueSA9IDE7IC8vMC41O1xuXHRzcHJpdGUubm9ybWFsTWFwID0gUElYSS5UZXh0dXJlLmZyb21JbWFnZShub3JtKTtcblxuXHRjb25zb2xlLmxvZyhzcHJpdGUudGV4dHVyZS5jcm9wLCBzcHJpdGUudGV4dHVyZS50cmltKTtcblxuXHRjb250YWluZXIuYWRkQ2hpbGQoc3ByaXRlKTtcblxuXG5cdHZhciBjeCA9IDIwMCxcblx0XHRjeSA9IDIwMCxcblx0XHR2aXNpYmlsaXR5ID0gY29udGFpbmVyLnZpc2liaWxpdHksXG5cdFx0YyA9IGNvbnRhaW5lci5ncmFwaGljcztcblxuXHRyZW5kZXJlci52aWV3LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0Y3ggPSBldmVudC5jbGllbnRYO1xuXHRcdGN5ID0gZXZlbnQuY2xpZW50WTtcblx0fSk7XG5cblx0Lypcblx0ICAgVXNhZ2U6XG5cdCAgICAgIG5ldyBWaXNpYmlsaXR5KClcblx0ICAgV2hlbmV2ZXIgbWFwIGRhdGEgY2hhbmdlczpcblx0ICAgICAgbG9hZE1hcFxuXHQgICBXaGVuZXZlciBsaWdodCBzb3VyY2UgY2hhbmdlczpcblx0ICAgICAgc2V0TGlnaHRMb2NhdGlvblxuXHQgICBUbyBjYWxjdWxhdGUgdGhlIGFyZWE6XG5cdCAgICAgIHN3ZWVwXG5cdFx0ICAqL1xuXG5cblx0cmVxdWVzdEFuaW1GcmFtZShhbmltYXRlKTtcblx0ZnVuY3Rpb24gYW5pbWF0ZSgpIHtcblx0XHRyZXF1ZXN0QW5pbUZyYW1lKGFuaW1hdGUpO1xuXG5cdFx0c3RhdHMuYmVnaW4oKTtcblx0XHRjLmNsZWFyKCk7XG5cblx0XHRzcHJpdGUucm90YXRpb24gKz0gMC4wMTtcblxuXHRcdGNvbnRhaW5lci5sb2FkTWFwKG1hemVXYWxscy5jb25jYXQoYm91bmRzKHNwcml0ZSwgMTUpKSwgW10pXG5cblx0XHRmb3IgKHZhciBpID0gMCwgbCA9IG1hemVMaWdodHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdFx0XHR2YXIgcCA9IG1hemVMaWdodHNbaV07XG5cdFx0XHRjb250YWluZXIuZHJhd0xpZ2h0KGkgKyAxLCBwWzBdLCBwWzFdLCBwWzJdLCAwLjE1KVxuXG5cdFx0XHRjLmJlZ2luRmlsbCgweGZmY2MwMCk7XG5cdFx0XHRjLmRyYXdDaXJjbGUocFswXSwgcFsxXSwgMyk7XG5cdFx0XHRjLmVuZEZpbGwoKTtcblx0XHR9XG5cblx0XHRjb250YWluZXIuZHJhd0xpZ2h0KDAsIGN4LCBjeSwgMHhjYzAwMDAsIDAuMylcblxuXHRcdGMuYmVnaW5GaWxsKDB4ZmZjYzAwKTtcblx0XHRjLmRyYXdDaXJjbGUodmlzaWJpbGl0eS5jZW50ZXIueCwgdmlzaWJpbGl0eS5jZW50ZXIueSwgOCk7XG5cdFx0Yy5lbmRGaWxsKCk7XG5cblx0XHRkcmF3U2VnbWVudHMoYywgY29udGFpbmVyLnZpc2liaWxpdHkpO1xuXG5cblx0XHRyZW5kZXJlci5yZW5kZXIoc3RhZ2UpO1xuXHRcdHN0YXRzLmVuZCgpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGRyYXdMaWdodChjLCB2aXNpYmlsaXR5LCBjeCwgY3ksIGExLCBhMikge1xuXHR2aXNpYmlsaXR5LnNldExpZ2h0TG9jYXRpb24oY3gsIGN5KTtcblx0dmlzaWJpbGl0eS5zd2VlcCgpO1xuXG5cdGZvciAodmFyIGkgPSAwLCBsID0gdmlzaWJpbGl0eS5vdXRwdXQubGVuZ3RoOyBpIDwgbDsgaSArPSAyKSB7XG5cdFx0dmFyIHAxID0gdmlzaWJpbGl0eS5vdXRwdXRbaV07XG5cdFx0dmFyIHAyID0gdmlzaWJpbGl0eS5vdXRwdXRbaSArIDFdO1xuXG5cdFx0Yy5tb3ZlVG8ocDEueCwgcDEueSlcblx0XHRjLmxpbmVUbyhwMi54LCBwMi55KVxuXHRcdGMubGluZVRvKHZpc2liaWxpdHkuY2VudGVyLngsIHZpc2liaWxpdHkuY2VudGVyLnkpXG5cdFx0Yy5saW5lVG8ocDEueCwgcDEueSlcblx0fVxufVxuXG5cbmZ1bmN0aW9uIGRyYXdTZWdtZW50cyhnLCB2aXNpYmlsaXR5KSB7XG5cdHZhciBtYXhBbmdsZSA9IE1hdGguUEk7XG5cblx0Zy5saW5lU3R5bGUoMywgMHhjYzAwMDAsIDEuMCk7XG5cblx0Zm9yICh2YXIgaSA9IDAsIGwgPSB2aXNpYmlsaXR5Lm9wZW4ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdFx0dmFyIHNlZ21lbnQgPSB2aXNpYmlsaXR5Lm9wZW5baV07XG5cdFx0Zy5tb3ZlVG8oc2VnbWVudC5wMS54LCBzZWdtZW50LnAxLnkpO1xuXHRcdGcubGluZVRvKHNlZ21lbnQucDIueCwgc2VnbWVudC5wMi55KTtcblx0fVxuXG5cdGcubGluZVN0eWxlKDIsIDB4MDAwMDAwLCAxLjApO1xuXHRmb3IgKHZhciBpID0gMCwgbCA9IHZpc2liaWxpdHkuc2VnbWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdFx0dmFyIHNlZ21lbnQgPSB2aXNpYmlsaXR5LnNlZ21lbnRzW2ldO1xuXHRcdGcubW92ZVRvKHNlZ21lbnQucDEueCwgc2VnbWVudC5wMS55KTtcblx0XHRnLmxpbmVUbyhzZWdtZW50LnAyLngsIHNlZ21lbnQucDIueSk7XG5cdH1cblxuXHRnLmxpbmVTdHlsZSgwLCAweDAwMDAwMCwgMS4wKTtcbn1cblxuZnVuY3Rpb24gYm91bmRzKG9iaiwgbikge1xuXHR2YXIgdyA9IG9iai53aWR0aCAtIG47XG5cdHZhciBoID0gb2JqLmhlaWdodCAtIG47XG5cdHZhciBjcm9wID0gb2JqLnRleHR1cmUuY3JvcDtcblx0aWYgKGNyb3ApIHtcblx0XHR3ID0gY3JvcC53aWR0aCAtIG47XG5cdFx0aCA9IGNyb3AuaGVpZ2h0IC0gbjtcblx0fVxuXHR2YXIgeCA9IHcgKiBvYmouYW5jaG9yLngsXG5cdFx0eSA9IGggKiBvYmouYW5jaG9yLnk7XG5cblx0dmFyIHAxID0gb2JqLnRvR2xvYmFsKHtcblx0XHR4OiB4LFxuXHRcdHk6IHlcblx0fSk7XG5cdHZhciBwMiA9IG9iai50b0dsb2JhbCh7XG5cdFx0eDogeCAtIHcsXG5cdFx0eTogeVxuXHR9KTtcblx0dmFyIHAzID0gb2JqLnRvR2xvYmFsKHtcblx0XHR4OiB4LFxuXHRcdHk6IHkgLSBoXG5cdH0pO1xuXHR2YXIgcDQgPSBvYmoudG9HbG9iYWwoe1xuXHRcdHg6IHggLSB3LFxuXHRcdHk6IHkgLSBoXG5cdH0pO1xuXG5cdHJldHVybiBbXG5cdFx0W3AxLngsIHAxLnksIHAyLngsIHAyLnldLFxuXHRcdFtwMS54LCBwMS55LCBwMy54LCBwMy55XSxcblx0XHRbcDQueCwgcDQueSwgcDIueCwgcDIueV0sXG5cdFx0W3A0LngsIHA0LnksIHAzLngsIHAzLnldLFxuXHRdO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vc3JjL0xpZ2h0Q29udGFpbmVyJyk7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vdmFyIHIgPSB0KFwiUElYSVwiKTtcblxudmFyIERpZmZ1c2VTaGFkZXIgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGdsKSB7XG5cdFBJWEkuUGl4aVNoYWRlci5jYWxsKHRoaXMsIGdsKVxufTtcblxuRGlmZnVzZVNoYWRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBJWEkuUGl4aVNoYWRlci5wcm90b3R5cGUpO1xuRGlmZnVzZVNoYWRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBEaWZmdXNlU2hhZGVyO1xuXG5EaWZmdXNlU2hhZGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdHZhciBnbCA9IHRoaXMuZ2w7XG5cblx0dGhpcy52ZXJ0ZXhTcmMgPSBbXG5cdFx0XCJhdHRyaWJ1dGUgdmVjMiBhVmVydGV4UG9zaXRpb247XCIsXG5cdFx0XCJhdHRyaWJ1dGUgdmVjMiBhVGV4dHVyZUNvb3JkO1wiLFxuXHRcdFwiYXR0cmlidXRlIHZlYzQgYUNvbG9yO1wiLFxuXHRcdFwiYXR0cmlidXRlIGZsb2F0IGFSb3RhdGlvbjtcIixcblx0XHRcInVuaWZvcm0gdmVjMiBwcm9qZWN0aW9uVmVjdG9yO1wiLFxuXHRcdFwidW5pZm9ybSB2ZWMyIG9mZnNldFZlY3RvcjtcIixcblx0XHRcInVuaWZvcm0gZmxvYXQgZmxpcFk7XCIsXG5cdFx0XCJ2YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZDtcIixcblx0XHRcInZhcnlpbmcgZmxvYXQgdlJvdGF0aW9uO1wiLFxuXHRcdFwidmFyeWluZyB2ZWM0IHZDb2xvcjtcIixcblx0XHRcImNvbnN0IHZlYzIgY2VudGVyID0gdmVjMigtMS4wLCAxLjApO1wiLFxuXHRcdFwidm9pZCBtYWluKHZvaWQpIHtcIixcblx0XHRcIiAgIHZlYzIgZmluYWxWID0gYVZlcnRleFBvc2l0aW9uICsgb2Zmc2V0VmVjdG9yO1wiLFxuXHRcdFwiICAgZ2xfUG9zaXRpb24gPSB2ZWM0KCBmaW5hbFYueCAvIHByb2plY3Rpb25WZWN0b3IueCAtMS4wLCAoZmluYWxWLnkgLyBwcm9qZWN0aW9uVmVjdG9yLnkgKiArZmxpcFkgKSArIGZsaXBZICwgMC4wLCAxLjApO1wiLFxuXHRcdFwiICAgdlRleHR1cmVDb29yZCA9IGFUZXh0dXJlQ29vcmQ7XCIsXG5cdFx0XCIgICB2Um90YXRpb24gPSBhUm90YXRpb247XCIsXG5cdFx0XCIgICB2Q29sb3IgPSBhQ29sb3I7XCIsXG5cdFx0XCJ9XCJcblx0XTtcblxuXHR0aGlzLmZyYWdtZW50U3JjID0gW1xuXHRcdFwicHJlY2lzaW9uIGxvd3AgZmxvYXQ7XCIsXG5cdFx0XCJ2YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZDtcIixcblx0XHRcInZhcnlpbmcgdmVjNCB2Q29sb3I7XCIsXG5cdFx0XCJ2YXJ5aW5nIGZsb2F0IHZSb3RhdGlvbjtcIixcblx0XHRcInVuaWZvcm0gc2FtcGxlcjJEIHVTYW1wbGVyO1wiLFxuXHRcdFwiI2RlZmluZSBNX1BJIDMuMTQxNTkyNjUzNTg5NzkzMjM4NDYyNjQzMzgzMjc5NVwiLFxuXHRcdFwidm9pZCBtYWluKHZvaWQpIHtcIixcblx0XHRcIiAgIGdsX0ZyYWdDb2xvciA9IHRleHR1cmUyRCh1U2FtcGxlciwgdlRleHR1cmVDb29yZCk7XCIsXG5cdFx0XCJ9XCJcblx0XTtcblxuXHR2YXIgZSA9IFBJWEkuY29tcGlsZVByb2dyYW0oZ2wsIHRoaXMudmVydGV4U3JjLCB0aGlzLmZyYWdtZW50U3JjKTtcblx0Z2wudXNlUHJvZ3JhbShlKTtcblxuXHR0aGlzLnVTYW1wbGVyID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKGUsIFwidVNhbXBsZXJcIik7XG5cdHRoaXMucHJvamVjdGlvblZlY3RvciA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihlLCBcInByb2plY3Rpb25WZWN0b3JcIik7XG5cdHRoaXMub2Zmc2V0VmVjdG9yID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKGUsIFwib2Zmc2V0VmVjdG9yXCIpO1xuXHR0aGlzLmRpbWVuc2lvbnMgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24oZSwgXCJkaW1lbnNpb25zXCIpO1xuXHR0aGlzLmZsaXBZID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKGUsIFwiZmxpcFlcIik7XG5cdHRoaXMuYVZlcnRleFBvc2l0aW9uID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24oZSwgXCJhVmVydGV4UG9zaXRpb25cIik7XG5cdHRoaXMuYVRleHR1cmVDb29yZCA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKGUsIFwiYVRleHR1cmVDb29yZFwiKTtcblx0dGhpcy5jb2xvckF0dHJpYnV0ZSA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKGUsIFwiYUNvbG9yXCIpO1xuXHR0aGlzLmFSb3RhdGlvbiA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKGUsIFwiYVJvdGF0aW9uXCIpO1xuXG5cdC0xID09PSB0aGlzLmNvbG9yQXR0cmlidXRlICYmICh0aGlzLmNvbG9yQXR0cmlidXRlID0gMik7XG5cblx0dGhpcy5hdHRyaWJ1dGVzID0gW1xuXHRcdHRoaXMuYVZlcnRleFBvc2l0aW9uLFxuXHRcdHRoaXMuYVRleHR1cmVDb29yZCxcblx0XHR0aGlzLmNvbG9yQXR0cmlidXRlLFxuXHRcdHRoaXMuYVJvdGF0aW9uXG5cdF07XG5cblx0Zm9yICh2YXIgaSBpbiB0aGlzLnVuaWZvcm1zKSB7XG5cdFx0dGhpcy51bmlmb3Jtc1tpXS51bmlmb3JtTG9jYXRpb24gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24oZSwgaSk7XG5cdH1cblx0dGhpcy5pbml0VW5pZm9ybXMoKTtcblx0dGhpcy5wcm9ncmFtID0gZTtcbn07XG5cbi8vbW9kdWxlLmV4cG9ydHMgPSBEaWZmdXNlU2hhZGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgVmlzaWJpbGl0eSA9IHJlcXVpcmUoJy4vdmlzaWJpbGl0eScpO1xudmFyIE5vcm1hbE1hcEZpbHRlciA9IHJlcXVpcmUoJy4vTm9ybWFsTWFwRmlsdGVyJyk7XG52YXIgTGlnaHRTcHJpdGVCYXRjaCA9IHJlcXVpcmUoJy4vTGlnaHRTcHJpdGVCYXRjaCcpO1xuXG52YXIgTGlnaHRDb250YWluZXIgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuXHRQSVhJLkRpc3BsYXlPYmplY3RDb250YWluZXIuY2FsbCh0aGlzKTtcblx0dGhpcy5ncmFwaGljcyA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG5cdHRoaXMudmlzaWJpbGl0eSA9IG5ldyBWaXNpYmlsaXR5KCk7XG5cblxuXG5cdHRoaXMuc2l6ZSA9IHtcblx0XHR3aWR0aDogMTAyNCxcblx0XHRoZWlnaHQ6IDc2OFxuXHR9O1xuXG5cdHRoaXMuZGlmZnVzZVRleHR1cmUgPSBuZXcgUElYSS5SZW5kZXJUZXh0dXJlKHRoaXMuc2l6ZS53aWR0aCwgdGhpcy5zaXplLmhlaWdodCk7XG5cdHRoaXMubm9ybWFsVGV4dHVyZSA9IG5ldyBQSVhJLlJlbmRlclRleHR1cmUodGhpcy5zaXplLndpZHRoLCB0aGlzLnNpemUuaGVpZ2h0KTtcblxuXHR0aGlzLnNwcml0ZWJhdGNoID0gbmV3IExpZ2h0U3ByaXRlQmF0Y2godGhpcy5kaWZmdXNlVGV4dHVyZS50ZXh0dXJlQnVmZmVyLCB0aGlzLm5vcm1hbFRleHR1cmUudGV4dHVyZUJ1ZmZlcik7XG5cblx0dGhpcy5kaWZmID0gbmV3IFBJWEkuU3ByaXRlKHRoaXMuZGlmZnVzZVRleHR1cmUpO1xuXHR0aGlzLm5vcm0gPSBuZXcgUElYSS5TcHJpdGUodGhpcy5ub3JtYWxUZXh0dXJlKTtcblx0dGhpcy5ub3JtLnggPSAyNTA1O1xufVxuXG5MaWdodENvbnRhaW5lci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBJWEkuRGlzcGxheU9iamVjdENvbnRhaW5lci5wcm90b3R5cGUpO1xuTGlnaHRDb250YWluZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTGlnaHRDb250YWluZXI7XG5cbkxpZ2h0Q29udGFpbmVyLnByb3RvdHlwZS5kcmF3TGlnaHQgPSBmdW5jdGlvbihudW0sIGN4LCBjeSwgY29sb3IsIGFscGhhKSB7XG5cdGlmIChjb2xvciA9PSBudWxsKSB7XG5cdFx0Y29sb3IgPSAweDAwMDAwMDtcblx0fVxuXHRpZiAoYWxwaGEgPT0gbnVsbCkge1xuXHRcdGFscGhhID0gMS4wO1xuXHR9XG5cblx0aWYgKG51bSA8IDQgJiYgdGhpcy5kaWZmLnNoYWRlcikge1xuXHRcdHRoaXMuZGlmZi5zaGFkZXIudW5pZm9ybXMuTGlnaHRQb3MudmFsdWVbbnVtICogMyArIDBdID0gY3g7XG5cdFx0dGhpcy5kaWZmLnNoYWRlci51bmlmb3Jtcy5MaWdodFBvcy52YWx1ZVtudW0gKiAzICsgMV0gPSBjeTtcblx0XHR0aGlzLmRpZmYuc2hhZGVyLnVuaWZvcm1zLkxpZ2h0UG9zLnZhbHVlW251bSAqIDMgKyAyXSA9IC4xO1xuXG5cdFx0dmFyIHIgPSAoY29sb3IgPj4gMTYpICYgMHhmZjtcblx0XHR2YXIgZyA9IChjb2xvciA+PiA4KSAmIDB4ZmY7XG5cdFx0dmFyIGIgPSAoY29sb3IgPj4gMCkgJiAweGZmO1xuXG5cdFx0dGhpcy5kaWZmLnNoYWRlci51bmlmb3Jtcy5MaWdodENvbG9yLnZhbHVlW251bSAqIDQgKyAwXSA9IHIgLyAyNTY7XG5cdFx0dGhpcy5kaWZmLnNoYWRlci51bmlmb3Jtcy5MaWdodENvbG9yLnZhbHVlW251bSAqIDQgKyAxXSA9IGcgLyAyNTY7XG5cdFx0dGhpcy5kaWZmLnNoYWRlci51bmlmb3Jtcy5MaWdodENvbG9yLnZhbHVlW251bSAqIDQgKyAyXSA9IGIgLyAyNTY7XG5cdFx0dGhpcy5kaWZmLnNoYWRlci51bmlmb3Jtcy5MaWdodENvbG9yLnZhbHVlW251bSAqIDQgKyAzXSA9IGFscGhhO1xuXHR9XG5cblx0dmFyIHZpc2liaWxpdHkgPSB0aGlzLnZpc2liaWxpdHk7XG5cdHZhciBjID0gdGhpcy5ncmFwaGljcztcblxuXHR2aXNpYmlsaXR5LnNldExpZ2h0TG9jYXRpb24oY3gsIGN5KTtcblx0dmlzaWJpbGl0eS5zd2VlcCgpO1xuXG5cdGMuYmVnaW5GaWxsKGNvbG9yLCBhbHBoYSk7XG5cdGZvciAodmFyIGkgPSAwLCBsID0gdmlzaWJpbGl0eS5vdXRwdXQubGVuZ3RoOyBpIDwgbDsgaSArPSAyKSB7XG5cdFx0dmFyIHAxID0gdmlzaWJpbGl0eS5vdXRwdXRbaV07XG5cdFx0dmFyIHAyID0gdmlzaWJpbGl0eS5vdXRwdXRbaSArIDFdO1xuXHRcdGMubW92ZVRvKHAxLngsIHAxLnkpXG5cdFx0Yy5saW5lVG8ocDIueCwgcDIueSlcblx0XHRjLmxpbmVUbyhjeCwgY3kpXG5cdFx0Yy5saW5lVG8ocDEueCwgcDEueSlcblx0fVxuXHRjLmVuZEZpbGwoKTtcbn07XG5cbkxpZ2h0Q29udGFpbmVyLnByb3RvdHlwZS5sb2FkTWFwID0gZnVuY3Rpb24od2FsbHMsIGJsb2Nrcykge1xuXHRpZiAod2FsbHMgPT0gbnVsbCkge1xuXHRcdHdhbGxzID0gW107XG5cdH1cblx0aWYgKGJsb2NrcyA9PSBudWxsKSB7XG5cdFx0YmxvY2tzID0gW107XG5cdH1cblx0Lypcblx0YmxvY2tzID0gYmxvY2tzLm1hcChmdW5jdGlvbihibG9jaykge1xuXHRcdHJldHVybiB7XG5cdFx0XHRwMToge1xuXHRcdFx0XHR4OiBibG9ja1swXSxcblx0XHRcdFx0eTogYmxvY2tbMV1cblx0XHRcdH0sXG5cdFx0XHRwMjoge1xuXHRcdFx0XHR4OiB3YWxsWzJdLFxuXHRcdFx0XHR5OiB3YWxsWzNdXG5cdFx0XHR9XG5cdFx0fTtcblx0fSk7Ki9cblx0d2FsbHMgPSB3YWxscy5tYXAoZnVuY3Rpb24od2FsbCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRwMToge1xuXHRcdFx0XHR4OiB3YWxsWzBdLFxuXHRcdFx0XHR5OiB3YWxsWzFdXG5cdFx0XHR9LFxuXHRcdFx0cDI6IHtcblx0XHRcdFx0eDogd2FsbFsyXSxcblx0XHRcdFx0eTogd2FsbFszXVxuXHRcdFx0fVxuXHRcdH07XG5cdH0pO1xuXHR0aGlzLndhbGxzID0gd2FsbHM7XG5cdHRoaXMuYmxvY2tzID0gYmxvY2tzO1xuXHR0aGlzLnZpc2liaWxpdHkubG9hZE1hcCgzMCwgLTIwMDAsIGJsb2Nrcywgd2FsbHMpO1xufTtcblxuLy8vL1xuXG5MaWdodENvbnRhaW5lci5wcm90b3R5cGUuX3JlbmRlcldlYkdMID0gZnVuY3Rpb24ocmVuZGVyU2Vzc2lvbikge1xuXHRpZiAoIXRoaXMuc3ByaXRlYmF0Y2guZ2wpIHtcblx0XHR0aGlzLnNwcml0ZWJhdGNoLnNldENvbnRleHQocmVuZGVyU2Vzc2lvbi5nbCk7XG5cdFx0dGhpcy5kaWZmLnNoYWRlciA9IG5ldyBOb3JtYWxNYXBGaWx0ZXIodGhpcy5ub3JtYWxUZXh0dXJlKTtcblx0fVxuXHRyZW5kZXJTZXNzaW9uLnNoYWRlck1hbmFnZXIuc2V0U2hhZGVyKHJlbmRlclNlc3Npb24uc2hhZGVyTWFuYWdlci5kZWZhdWx0U2hhZGVyKTtcblxuXHRyZW5kZXJTZXNzaW9uLnNwcml0ZUJhdGNoLnN0b3AoKTtcblxuXHR2YXIgaSA9IFtdO1xuXHR0aGlzLmNvbGxlY3RTcHJpdGVzKHRoaXMsIGkpO1xuXG5cdHRoaXMuc3ByaXRlYmF0Y2guYmVnaW4ocmVuZGVyU2Vzc2lvbik7XG5cdGZvciAodmFyIHIgPSAwOyByIDwgaS5sZW5ndGg7IHIrKykge1xuXHRcdHRoaXMuc3ByaXRlYmF0Y2gucmVuZGVyKGlbcl0pO1xuXHR9XG5cdHRoaXMuc3ByaXRlYmF0Y2guZW5kKCk7XG5cblx0cmVuZGVyU2Vzc2lvbi5zcHJpdGVCYXRjaC5zdGFydCgpO1xufTtcblxuTGlnaHRDb250YWluZXIucHJvdG90eXBlLmNvbGxlY3RTcHJpdGVzID0gZnVuY3Rpb24ob2JqLCBjb2xsZWN0aW9uKSB7XG5cdG9iai5hbmNob3IgJiYgY29sbGVjdGlvbi5wdXNoKG9iaik7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgb2JqLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG5cdFx0dGhpcy5jb2xsZWN0U3ByaXRlcyhvYmouY2hpbGRyZW5baV0sIGNvbGxlY3Rpb24pO1xuXHR9XG59O1xuXG5MaWdodENvbnRhaW5lci5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24odywgaCkge1xuXHR0aGlzLnNpemUud2lkdGggPSB3O1xuXHR0aGlzLnNpemUuaGVpZ2h0ID0gaDtcblx0dGhpcy5kaWZmdXNlVGV4dHVyZS5yZXNpemUodywgaCk7XG5cdHRoaXMubm9ybWFsVGV4dHVyZS5yZXNpemUodywgaCk7XG5cdHRoaXMub2NjbHVkZXJzRkJPLnJlc2l6ZSh3LCBoKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vdmFyIHIgPSB0KFwiUElYSVwiKTtcblxudmFyIExpZ2h0U2hhZGVyID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0KSB7XG5cdFBJWEkuUGl4aVNoYWRlci5jYWxsKHRoaXMsIHQpXG59O1xuXG5MaWdodFNoYWRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBJWEkuUGl4aVNoYWRlci5wcm90b3R5cGUpO1xuTGlnaHRTaGFkZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTGlnaHRTaGFkZXI7XG5cbkxpZ2h0U2hhZGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdHZhciB0ID0gdGhpcy5nbDtcblx0dGhpcy52ZXJ0ZXhTcmMgPSBbXG5cdFx0XCJhdHRyaWJ1dGUgdmVjMiBhVmVydGV4UG9zaXRpb247XCIsXG5cdFx0XCJhdHRyaWJ1dGUgdmVjMiBhVGV4dHVyZUNvb3JkO1wiLFxuXHRcdFwiYXR0cmlidXRlIHZlYzQgYUNvbG9yO1wiLFxuXHRcdFwiYXR0cmlidXRlIGZsb2F0IGFSb3RhdGlvbjtcIixcblx0XHRcInVuaWZvcm0gdmVjMiBwcm9qZWN0aW9uVmVjdG9yO1wiLFxuXHRcdFwidW5pZm9ybSB2ZWMyIG9mZnNldFZlY3RvcjtcIixcblx0XHRcInVuaWZvcm0gZmxvYXQgZmxpcFk7XCIsXG5cdFx0XCJ2YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZDtcIixcblx0XHRcInZhcnlpbmcgZmxvYXQgdlJvdGF0aW9uO1wiLFxuXHRcdFwidmFyeWluZyB2ZWM0IHZDb2xvcjtcIixcblx0XHRcImNvbnN0IHZlYzIgY2VudGVyID0gdmVjMigtMS4wLCAxLjApO1wiLFxuXHRcdFwidm9pZCBtYWluKHZvaWQpIHtcIixcblx0XHRcIiAgIHZlYzIgZmluYWxWID0gYVZlcnRleFBvc2l0aW9uICsgb2Zmc2V0VmVjdG9yO1wiLFxuXHRcdFwiICAgZ2xfUG9zaXRpb24gPSB2ZWM0KCBmaW5hbFYueCAvIHByb2plY3Rpb25WZWN0b3IueCAtMS4wLCAoZmluYWxWLnkgLyBwcm9qZWN0aW9uVmVjdG9yLnkgKiArZmxpcFkgKSArIGZsaXBZICwgMC4wLCAxLjApO1wiLFxuXHRcdFwiICAgdlRleHR1cmVDb29yZCA9IGFUZXh0dXJlQ29vcmQ7XCIsXG5cdFx0XCIgICB2Um90YXRpb24gPSBhUm90YXRpb247XCIsXG5cdFx0XCIgICB2Q29sb3IgPSBhQ29sb3I7XCIsXG5cdFx0XCJ9XCJcblx0XTtcblx0dGhpcy5mcmFnbWVudFNyYyA9IFtcblx0XHRcInByZWNpc2lvbiBsb3dwIGZsb2F0O1wiLFxuXHRcdFwidmFyeWluZyB2ZWMyIHZUZXh0dXJlQ29vcmQ7XCIsXG5cdFx0XCJ2YXJ5aW5nIHZlYzQgdkNvbG9yO1wiLFxuXHRcdFwidmFyeWluZyBmbG9hdCB2Um90YXRpb247XCIsXG5cdFx0XCJ1bmlmb3JtIHNhbXBsZXIyRCB1U2FtcGxlcjtcIixcblx0XHRcIiNkZWZpbmUgTV9QSSAzLjE0MTU5MjY1MzU4OTc5MzIzODQ2MjY0MzM4MzI3OTVcIixcblx0XHRcInZvaWQgbWFpbih2b2lkKSB7XCIsXG5cdFx0XCIgICAgdmVjNCBjb2xvciA9ICB0ZXh0dXJlMkQodVNhbXBsZXIsIHZUZXh0dXJlQ29vcmQpO1wiLFxuXHRcdFwiICAgIHZlYzMgTm9ybWFsTWFwID0gY29sb3IucmdiO1wiLFxuXHRcdFwiICAgIHZlYzMgTiA9IG5vcm1hbGl6ZShOb3JtYWxNYXAgKiAyLjAgLSAxLjApO1wiLFxuXHRcdFwiICAgIGZsb2F0IGFuZ2xlID0gdlJvdGF0aW9uO1wiLFxuXHRcdFwiICAgIHZlYzIgcm90YXRlZE47XCIsXG5cdFx0XCIgICAgcm90YXRlZE4uciA9IChOLnIpKnNpbihhbmdsZSkgLSAoTi5nKSpjb3MoYW5nbGUpO1wiLFxuXHRcdFwiICAgIHJvdGF0ZWROLmcgPSAoTi5yKSpjb3MoYW5nbGUpICsgKE4uZykqc2luKGFuZ2xlKTtcIixcblx0XHRcIiAgICBOLnIgPSByb3RhdGVkTi5nO1wiLFxuXHRcdFwiICAgIE4uZyA9IHJvdGF0ZWROLnI7XCIsXG5cdFx0XCIgICAgTm9ybWFsTWFwID0gTjtcIixcblx0XHRcIiAgICBOb3JtYWxNYXAgPSAoTm9ybWFsTWFwICsgMS4wKSAvIDIuMDtcIixcblx0XHRcIiAgICBnbF9GcmFnQ29sb3IgPSB2ZWM0KE5vcm1hbE1hcCAqIGNvbG9yLmEsIGNvbG9yLmEpO1wiLFxuXHRcdFwifVwiXG5cdF07XG5cblx0dmFyIGUgPSBQSVhJLmNvbXBpbGVQcm9ncmFtKHQsIHRoaXMudmVydGV4U3JjLCB0aGlzLmZyYWdtZW50U3JjKTtcblx0dC51c2VQcm9ncmFtKGUpLFxuXG5cdHRoaXMudVNhbXBsZXIgPSB0LmdldFVuaWZvcm1Mb2NhdGlvbihlLCBcInVTYW1wbGVyXCIpLFxuXHR0aGlzLnByb2plY3Rpb25WZWN0b3IgPSB0LmdldFVuaWZvcm1Mb2NhdGlvbihlLCBcInByb2plY3Rpb25WZWN0b3JcIiksXG5cdHRoaXMub2Zmc2V0VmVjdG9yID0gdC5nZXRVbmlmb3JtTG9jYXRpb24oZSwgXCJvZmZzZXRWZWN0b3JcIiksXG5cdHRoaXMuZGltZW5zaW9ucyA9IHQuZ2V0VW5pZm9ybUxvY2F0aW9uKGUsIFwiZGltZW5zaW9uc1wiKSxcblx0dGhpcy5mbGlwWSA9IHQuZ2V0VW5pZm9ybUxvY2F0aW9uKGUsIFwiZmxpcFlcIiksXG5cdHRoaXMuYVZlcnRleFBvc2l0aW9uID0gdC5nZXRBdHRyaWJMb2NhdGlvbihlLCBcImFWZXJ0ZXhQb3NpdGlvblwiKSxcblx0dGhpcy5hVGV4dHVyZUNvb3JkID0gdC5nZXRBdHRyaWJMb2NhdGlvbihlLCBcImFUZXh0dXJlQ29vcmRcIiksXG5cdHRoaXMuY29sb3JBdHRyaWJ1dGUgPSB0LmdldEF0dHJpYkxvY2F0aW9uKGUsIFwiYUNvbG9yXCIpLFxuXHR0aGlzLmFSb3RhdGlvbiA9IHQuZ2V0QXR0cmliTG9jYXRpb24oZSwgXCJhUm90YXRpb25cIiksXG5cblx0LTEgPT09IHRoaXMuY29sb3JBdHRyaWJ1dGUgJiYgKHRoaXMuY29sb3JBdHRyaWJ1dGUgPSAyKSxcblxuXHR0aGlzLmF0dHJpYnV0ZXMgPSBbdGhpcy5hVmVydGV4UG9zaXRpb24sIHRoaXMuYVRleHR1cmVDb29yZCxcblx0dGhpcy5jb2xvckF0dHJpYnV0ZSwgdGhpcy5hUm90YXRpb25dO1xuXG5cdGZvciAodmFyIGkgaW4gdGhpcy51bmlmb3Jtcykge1xuXHRcdHRoaXMudW5pZm9ybXNbaV0udW5pZm9ybUxvY2F0aW9uID0gdC5nZXRVbmlmb3JtTG9jYXRpb24oZSwgaSk7XG5cdH1cblx0dGhpcy5pbml0VW5pZm9ybXMoKTtcblx0dGhpcy5wcm9ncmFtID0gZTtcbn07XG5cbi8vbW9kdWxlLmV4cG9ydHMgPSBMaWdodFNoYWRlcjtcbiIsIid1c2Ugc3RyaWN0Jztcbi8qXG52YXIgciA9IHQoXCJQSVhJXCIpLFxuXHRvID0gdChcIi4vTGlnaHRTaGFkZXJcIiksXG5cdG4gPSB0KFwiLi9EaWZmdXNlU2hhZGVyXCIpO1xuKi9cblxudmFyIExpZ2h0U2hhZGVyID0gcmVxdWlyZSgnLi9MaWdodFNoYWRlcicpO1xudmFyIERpZmZ1c2VTaGFkZXIgPSByZXF1aXJlKCcuL0RpZmZ1c2VTaGFkZXInKTtcblxudmFyIExpZ2h0U3ByaXRlQmF0Y2ggPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRpZmYsIG5vcm0sIG9jYykge1xuXHR0aGlzLmRpZmZ1c2VUZXh0dXJlID0gZGlmZjtcblx0dGhpcy5ub3JtYWxUZXh0dXJlID0gbm9ybTtcblx0dGhpcy5vY2NsdWRlcnNGQk8gPSBvY2M7XG5cdHRoaXMudmVydFNpemUgPSA2O1xuXHR0aGlzLnNpemUgPSAxZTQ7XG5cblx0dmFyIGkgPSA0ICogdGhpcy5zaXplICogNCAqIHRoaXMudmVydFNpemUsXG5cdFx0byA9IDYgKiB0aGlzLnNpemU7XG5cblx0dGhpcy52ZXJ0aWNlcyA9IG5ldyBQSVhJLkFycmF5QnVmZmVyKGkpO1xuXHR0aGlzLnBvc2l0aW9ucyA9IG5ldyBQSVhJLkZsb2F0MzJBcnJheSh0aGlzLnZlcnRpY2VzKTtcblx0dGhpcy5jb2xvcnMgPSBuZXcgUElYSS5VaW50MzJBcnJheSh0aGlzLnZlcnRpY2VzKTtcblx0dGhpcy5pbmRpY2VzID0gbmV3IFBJWEkuVWludDE2QXJyYXkobyk7XG5cdHRoaXMubGFzdEluZGV4Q291bnQgPSAwO1xuXHRmb3IgKHZhciBuID0gMCwgcyA9IDA7IG8gPiBuOyBuICs9IDYsIHMgKz0gNCkge1xuXHRcdHRoaXMuaW5kaWNlc1tuICsgMF0gPSBzICsgMDtcblx0XHR0aGlzLmluZGljZXNbbiArIDFdID0gcyArIDE7XG5cdFx0dGhpcy5pbmRpY2VzW24gKyAyXSA9IHMgKyAyO1xuXHRcdHRoaXMuaW5kaWNlc1tuICsgM10gPSBzICsgMDtcblx0XHR0aGlzLmluZGljZXNbbiArIDRdID0gcyArIDI7XG5cdFx0dGhpcy5pbmRpY2VzW24gKyA1XSA9IHMgKyAzO1xuXHR9XG5cdHRoaXMuZHJhd2luZyA9ICExO1xuXHR0aGlzLmN1cnJlbnRCYXRjaFNpemUgPSAwO1xuXHR0aGlzLmN1cnJlbnRCYXNlVGV4dHVyZSA9IG51bGw7XG5cdHRoaXMuZGlydHkgPSAhMDtcblx0dGhpcy50ZXh0dXJlcyA9IFtdO1xuXHR0aGlzLmJsZW5kTW9kZXMgPSBbXTtcblx0dGhpcy5zaGFkZXJzID0gW107XG5cdHRoaXMuc3ByaXRlcyA9IFtdO1xuXHR0aGlzLmRlZmF1bHRTaGFkZXIgPSBuZXcgUElYSS5BYnN0cmFjdEZpbHRlcihbXCJwcmVjaXNpb24gbG93cCBmbG9hdDtcIixcblx0XHRcInZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkO1wiLFxuXHRcdFwidmFyeWluZyB2ZWM0IHZDb2xvcjtcIixcblx0XHRcInVuaWZvcm0gc2FtcGxlcjJEIHVTYW1wbGVyO1wiLFxuXHRcdFwidm9pZCBtYWluKHZvaWQpIHtcIixcblx0XHRcIiAgIGdsX0ZyYWdDb2xvciA9IHRleHR1cmUyRCh1U2FtcGxlciwgdlRleHR1cmVDb29yZCkgKiB2Q29sb3IgO1wiLFxuXHRcdFwifVwiXG5cdF0pO1xufVxuXG5MaWdodFNwcml0ZUJhdGNoLnByb3RvdHlwZS5zZXRDb250ZXh0ID0gZnVuY3Rpb24oZ2wpIHtcblx0dGhpcy5nbCA9IGdsO1xuXHR0aGlzLnZlcnRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuXHR0aGlzLmluZGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG5cdGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIHRoaXMuaW5kZXhCdWZmZXIpO1xuXHRnbC5idWZmZXJEYXRhKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCB0aGlzLmluZGljZXMsIGdsLlNUQVRJQ19EUkFXKTtcblx0Z2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRoaXMudmVydGV4QnVmZmVyKTtcblx0Z2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIHRoaXMudmVydGljZXMsIGdsLkRZTkFNSUNfRFJBVyk7XG5cdHRoaXMuY3VycmVudEJsZW5kTW9kZSA9IDk5OTk5O1xuXHR0aGlzLmxpZ2h0U2hhZGVyID0gbmV3IExpZ2h0U2hhZGVyKGdsKTtcblx0dGhpcy5kaWZmdXNlU2hhZGVyID0gbmV3IERpZmZ1c2VTaGFkZXIoZ2wpO1xuXHQvLyBUT0RPIG9jY2x1ZGVyc0ZCT1xuXHQvL3RoaXMub2NjbHVkZXJzU2hhZGVyID0gbmV3IE9jY1NoYWRlcihnbCk7XG59XG5cbkxpZ2h0U3ByaXRlQmF0Y2gucHJvdG90eXBlLmJlZ2luID0gZnVuY3Rpb24ocmVuZGVyU2Vzc2lvbikge1xuXHR0aGlzLnJlbmRlclNlc3Npb24gPSByZW5kZXJTZXNzaW9uO1xuXHR0aGlzLnNoYWRlciA9IHRoaXMucmVuZGVyU2Vzc2lvbi5zaGFkZXJNYW5hZ2VyLmRlZmF1bHRTaGFkZXI7XG5cdHRoaXMuc3RhcnQoKVxufVxuXG5MaWdodFNwcml0ZUJhdGNoLnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5mbHVzaCgpXG59XG5cbkxpZ2h0U3ByaXRlQmF0Y2gucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHQpIHtcblx0dmFyIGUgPSB0LnRleHR1cmU7XG5cdGlmICh0aGlzLmN1cnJlbnRCYXRjaFNpemUgPj0gdGhpcy5zaXplKSB7XG5cdFx0dGhpcy5mbHVzaCgpO1xuXHRcdHRoaXMuY3VycmVudEJhc2VUZXh0dXJlID0gZS5iYXNlVGV4dHVyZTtcblx0fVxuXHR2YXIgaSA9IGUuX3V2cztcblx0aWYgKGkpIHtcblx0XHR2YXIgciwgbywgbiwgcyxcblx0XHRcdGEgPSB0LmFuY2hvci54LFxuXHRcdFx0aCA9IHQuYW5jaG9yLnk7XG5cdFx0aWYgKGUudHJpbSkge1xuXHRcdFx0dmFyIGwgPSBlLnRyaW07XG5cdFx0XHRvID0gbC54IC0gYSAqIGwud2lkdGgsIHIgPSBvICsgZS5jcm9wLndpZHRoLCBzID0gbC55IC0gaCAqIGwuaGVpZ2h0LCBuID0gcyArIGUuY3JvcC5oZWlnaHRcblx0XHR9IGVsc2Uge1xuXHRcdFx0ciA9IGUuZnJhbWUud2lkdGggKiAoMSAtIGEpLCBvID0gZS5mcmFtZS53aWR0aCAqIC1hLCBuID0gZS5mcmFtZS5oZWlnaHQgKiAoMSAtIGgpLCBzID0gZS5mcmFtZS5oZWlnaHQgKiAtaDtcblx0XHR9XG5cdFx0dmFyIHUgPSA0ICogdGhpcy5jdXJyZW50QmF0Y2hTaXplICogdGhpcy52ZXJ0U2l6ZSxcblx0XHRcdGMgPSBlLmJhc2VUZXh0dXJlLnJlc29sdXRpb24sXG5cdFx0XHRwID0gdC53b3JsZFRyYW5zZm9ybSxcblx0XHRcdGQgPSBwLmEgLyBjLFxuXHRcdFx0ZiA9IHAuYiAvIGMsXG5cdFx0XHRtID0gcC5jIC8gYyxcblx0XHRcdHYgPSBwLmQgLyBjLFxuXHRcdFx0ZyA9IHAudHgsXG5cdFx0XHR5ID0gcC50eSxcblx0XHRcdHggPSB0aGlzLmNvbG9ycyxcblx0XHRcdGIgPSB0aGlzLnBvc2l0aW9ucyxcblx0XHRcdHcgPSB0LnRpbnQsXG5cdFx0XHRfID0gKHcgPj4gMTYpICsgKDY1MjgwICYgdykgKyAoKDI1NSAmIHcpIDw8IDE2KSArICgyNTUgKiB0LmFscGhhIDw8IDI0KSxcblx0XHRcdFQgPSBNYXRoLmF0YW4yKGYsIGQpO1xuXG5cdFx0Ylt1KytdID0gZCAqIG8gKyBtICogcyArIGc7XG5cdFx0Ylt1KytdID0gdiAqIHMgKyBmICogbyArIHk7XG5cdFx0Ylt1KytdID0gaS54MDtcblx0XHRiW3UrK10gPSBpLnkwO1xuXHRcdHhbdSsrXSA9IF87XG5cdFx0dGhpcy5wb3NpdGlvbnNbdSsrXSA9IFQ7XG5cdFx0Ylt1KytdID0gZCAqIHIgKyBtICogcyArIGc7XG5cdFx0Ylt1KytdID0gdiAqIHMgKyBmICogciArIHk7XG5cdFx0Ylt1KytdID0gaS54MTtcblx0XHRiW3UrK10gPSBpLnkxO1xuXHRcdHhbdSsrXSA9IF87XG5cdFx0dGhpcy5wb3NpdGlvbnNbdSsrXSA9IFQ7XG5cdFx0Ylt1KytdID0gZCAqIHIgKyBtICogbiArIGc7XG5cdFx0Ylt1KytdID0gdiAqIG4gKyBmICogciArIHk7XG5cdFx0Ylt1KytdID0gaS54Mjtcblx0XHRiW3UrK10gPSBpLnkyO1xuXHRcdHhbdSsrXSA9IF87XG5cdFx0dGhpcy5wb3NpdGlvbnNbdSsrXSA9IFQ7XG5cdFx0Ylt1KytdID0gZCAqIG8gKyBtICogbiArIGc7XG5cdFx0Ylt1KytdID0gdiAqIG4gKyBmICogbyArIHk7XG5cdFx0Ylt1KytdID0gaS54Mztcblx0XHRiW3UrK10gPSBpLnkzO1xuXHRcdHhbdSsrXSA9IF87XG5cdFx0dGhpcy5wb3NpdGlvbnNbdSsrXSA9IFQ7XG5cdFx0dGhpcy5zcHJpdGVzW3RoaXMuY3VycmVudEJhdGNoU2l6ZSsrXSA9IHRcblx0fVxufVxuXG5MaWdodFNwcml0ZUJhdGNoLnByb3RvdHlwZS5yZW5kZXJUaWxpbmdTcHJpdGUgPSBmdW5jdGlvbih0KSB7XG5cdHZhciBlID0gdC50aWxpbmdUZXh0dXJlO1xuXHR0aGlzLmN1cnJlbnRCYXRjaFNpemUgPj0gdGhpcy5zaXplICYmICh0aGlzLmZsdXNoKCksIHRoaXMuY3VycmVudEJhc2VUZXh0dXJlID0gZS5iYXNlVGV4dHVyZSk7XG5cdHQuX3V2cyB8fCAodC5fdXZzID0gbmV3IFBJWEkuVGV4dHVyZVV2cyk7XG5cdHZhciBpID0gdC5fdXZzO1xuXHR0LnRpbGVQb3NpdGlvbi54ICU9IGUuYmFzZVRleHR1cmUud2lkdGggKiB0LnRpbGVTY2FsZU9mZnNldC54O1xuXHR0LnRpbGVQb3NpdGlvbi55ICU9IGUuYmFzZVRleHR1cmUuaGVpZ2h0ICogdC50aWxlU2NhbGVPZmZzZXQueTtcblx0dmFyIG8gPSB0LnRpbGVQb3NpdGlvbi54IC8gKGUuYmFzZVRleHR1cmUud2lkdGggKiB0LnRpbGVTY2FsZU9mZnNldC54KSxcblx0XHRuID0gdC50aWxlUG9zaXRpb24ueSAvIChlLmJhc2VUZXh0dXJlLmhlaWdodCAqIHQudGlsZVNjYWxlT2Zmc2V0LnkpLFxuXHRcdHMgPSB0LndpZHRoIC8gZS5iYXNlVGV4dHVyZS53aWR0aCAvICh0LnRpbGVTY2FsZS54ICogdC50aWxlU2NhbGVPZmZzZXQueCksXG5cdFx0YSA9IHQuaGVpZ2h0IC8gZS5iYXNlVGV4dHVyZS5oZWlnaHQgLyAodC50aWxlU2NhbGUueSAqIHQudGlsZVNjYWxlT2Zmc2V0LnkpO1xuXG5cdGkueDAgPSAwIC0gbztcblx0aS55MCA9IDAgLSBuO1xuXHRpLngxID0gMSAqIHMgLSBvO1xuXHRpLnkxID0gMCAtIG47XG5cdGkueDIgPSAxICogcyAtIG87XG5cdGkueTIgPSAxICogYSAtIG47XG5cdGkueDMgPSAwIC0gbztcblx0aS55MyA9IDEgKiBhIC0gbjtcblx0dmFyIGggPSB0LnRpbnQsXG5cdFx0bCA9IChoID4+IDE2KSArICg2NTI4MCAmIGgpICsgKCgyNTUgJiBoKSA8PCAxNikgKyAoMjU1ICogdC5hbHBoYSA8PCAyNCksXG5cdFx0dSA9IHRoaXMucG9zaXRpb25zLFxuXHRcdGMgPSB0aGlzLmNvbG9ycyxcblx0XHRwID0gdC53aWR0aCxcblx0XHRkID0gdC5oZWlnaHQsXG5cdFx0ZiA9IHQuYW5jaG9yLngsXG5cdFx0bSA9IHQuYW5jaG9yLnksXG5cdFx0diA9IHAgKiAoMSAtIGYpLFxuXHRcdGcgPSBwICogLWYsXG5cdFx0eSA9IGQgKiAoMSAtIG0pLFxuXHRcdHggPSBkICogLW0sXG5cdFx0YiA9IDQgKiB0aGlzLmN1cnJlbnRCYXRjaFNpemUgKiB0aGlzLnZlcnRTaXplLFxuXHRcdHcgPSBlLmJhc2VUZXh0dXJlLnJlc29sdXRpb24sXG5cdFx0XyA9IHQud29ybGRUcmFuc2Zvcm0sXG5cdFx0VCA9IF8uYSAvIHcsXG5cdFx0UyA9IF8uYiAvIHcsXG5cdFx0QSA9IF8uYyAvIHcsXG5cdFx0QyA9IF8uZCAvIHcsXG5cdFx0RSA9IF8udHgsXG5cdFx0TSA9IF8udHk7XG5cblx0dVtiKytdID0gVCAqIGcgKyBBICogeCArIEU7XG5cdHVbYisrXSA9IEMgKiB4ICsgUyAqIGcgKyBNO1xuXHR1W2IrK10gPSBpLngwO1xuXHR1W2IrK10gPSBpLnkwO1xuXHRjW2IrK10gPSBsO1xuXHR1W2IrK10gPSBUICogdiArIEEgKiB4ICsgRTtcblx0dVtiKytdID0gQyAqIHggKyBTICogdiArIE07XG5cdHVbYisrXSA9IGkueDE7XG5cdHVbYisrXSA9IGkueTE7XG5cdGNbYisrXSA9IGw7XG5cdHVbYisrXSA9IFQgKiB2ICsgQSAqIHkgKyBFO1xuXHR1W2IrK10gPSBDICogeSArIFMgKiB2ICsgTTtcblx0dVtiKytdID0gaS54Mjtcblx0dVtiKytdID0gaS55Mjtcblx0Y1tiKytdID0gbDtcblx0dVtiKytdID0gVCAqIGcgKyBBICogeSArIEU7XG5cdHVbYisrXSA9IEMgKiB5ICsgUyAqIGcgKyBNO1xuXHR1W2IrK10gPSBpLngzO1xuXHR1W2IrK10gPSBpLnkzO1xuXHRjW2IrK10gPSBsO1xuXHR0aGlzLnNwcml0ZXNbdGhpcy5jdXJyZW50QmF0Y2hTaXplKytdID0gdFxufVxuXG5MaWdodFNwcml0ZUJhdGNoLnByb3RvdHlwZS5mbHVzaCA9IGZ1bmN0aW9uKCkge1xuXHRpZiAoMCAhPT0gdGhpcy5jdXJyZW50QmF0Y2hTaXplKSB7XG5cdFx0dmFyIHQsXG5cdFx0XHRnbCA9IHRoaXMuZ2w7XG5cblx0XHRpZiAodGhpcy5kaXJ0eSkge1xuXHRcdFx0dGhpcy5kaXJ0eSA9ICExO1xuXHRcdFx0dCA9IHRoaXMubGlnaHRTaGFkZXI7XG5cdFx0XHRnbC5hY3RpdmVUZXh0dXJlKGdsLlRFWFRVUkUwKTsgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRoaXMudmVydGV4QnVmZmVyKTtcblx0XHRcdGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIHRoaXMuaW5kZXhCdWZmZXIpO1xuXG5cdFx0XHR2YXIgaSA9IDQgKiB0aGlzLnZlcnRTaXplO1xuXHRcdFx0Z2wudmVydGV4QXR0cmliUG9pbnRlcih0LmFWZXJ0ZXhQb3NpdGlvbiwgMiwgZ2wuRkxPQVQsICExLCBpLCAwKTtcblx0XHRcdGdsLnZlcnRleEF0dHJpYlBvaW50ZXIodC5hVGV4dHVyZUNvb3JkLCAyLCBnbC5GTE9BVCwgITEsIGksIDgpO1xuXHRcdFx0Z2wudmVydGV4QXR0cmliUG9pbnRlcih0LmNvbG9yQXR0cmlidXRlLCA0LCBnbC5VTlNJR05FRF9CWVRFLCAhMCwgaSwgMTYpO1xuXHRcdFx0Z2wudmVydGV4QXR0cmliUG9pbnRlcih0LmFSb3RhdGlvbiwgMSwgZ2wuRkxPQVQsICExLCBpLCAyMClcblx0XHR9XG5cblx0XHRpZiAodGhpcy5jdXJyZW50QmF0Y2hTaXplID4gLjUgKiB0aGlzLnNpemUpIHtcblx0XHRcdGdsLmJ1ZmZlclN1YkRhdGEoZ2wuQVJSQVlfQlVGRkVSLCAwLCB0aGlzLnZlcnRpY2VzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIHIgPSB0aGlzLnBvc2l0aW9ucy5zdWJhcnJheSgwLCA0ICogdGhpcy5jdXJyZW50QmF0Y2hTaXplICogdGhpcy52ZXJ0U2l6ZSk7XG5cdFx0XHRnbC5idWZmZXJTdWJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgMCwgcilcblx0XHR9XG5cblx0XHRnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIHRoaXMubm9ybWFsVGV4dHVyZS5mcmFtZUJ1ZmZlcik7XG5cdFx0Z2wuY2xlYXJDb2xvciguNSwgLjUsIDEsIDEpO1xuXHRcdGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQpO1xuXHRcdHRoaXMucmVuZGVyU3ByaXRlKHRoaXMubGlnaHRTaGFkZXIsIHRydWUpO1xuXG5cdFx0Z2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCB0aGlzLmRpZmZ1c2VUZXh0dXJlLmZyYW1lQnVmZmVyKTtcblx0XHRnbC5jbGVhckNvbG9yKDAsIDAsIDAsIDApO1xuXHRcdGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQpO1xuXHRcdHRoaXMucmVuZGVyU3ByaXRlKHRoaXMuZGlmZnVzZVNoYWRlciwgZmFsc2UpO1xuXG5cdFx0LyovIFRPRE9cblx0XHRnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIHRoaXMub2NjbHVkZXJzRkJPLmZyYW1lQnVmZmVyKTtcblx0XHRnbC5jbGVhckNvbG9yKDAsIDAsIDAsIDApO1xuXHRcdGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQpO1xuXHRcdHRoaXMucmVuZGVyU3ByaXRlKHRoaXMub2NjbHVkZXJzU2hhZGVyLCBmYWxzZSk7XG5cdFx0Ki9cblxuXHRcdGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgdGhpcy5yZW5kZXJTZXNzaW9uLmJ1ZmZlcik7XG5cblx0XHR0aGlzLmN1cnJlbnRCYXRjaFNpemUgPSAwO1xuXHR9XG59XG5cbkxpZ2h0U3ByaXRlQmF0Y2gucHJvdG90eXBlLnJlbmRlclNwcml0ZSA9IGZ1bmN0aW9uKHQsIGlzTm9ybWFsTWFwKSB7XG5cdHZhciBpLCByLCBvLCBuLFxuXHRcdGdsID0gdGhpcy5nbCxcblx0XHRhID0gMCxcblx0XHRoID0gMCxcblx0XHRsID0gbnVsbCxcblx0XHR1ID0gdGhpcy5yZW5kZXJTZXNzaW9uLmJsZW5kTW9kZU1hbmFnZXIuY3VycmVudEJsZW5kTW9kZSxcblx0XHRjID0gdCxcblx0XHRwID0gITEsXG5cdFx0ZCA9ICExO1xuXG5cdHRoaXMucmVuZGVyU2Vzc2lvbi5zaGFkZXJNYW5hZ2VyLnNldFNoYWRlcihjKTtcblx0Yy5kaXJ0eSAmJiBjLnN5bmNVbmlmb3JtcygpO1xuXG5cdHZhciBmID0gdGhpcy5yZW5kZXJTZXNzaW9uLnByb2plY3Rpb247XG5cdGdsLnVuaWZvcm0yZihjLnByb2plY3Rpb25WZWN0b3IsIGYueCwgZi55KTtcblxuXHR2YXIgbSA9IHRoaXMucmVuZGVyU2Vzc2lvbi5vZmZzZXQ7XG5cdGdsLnVuaWZvcm0yZihjLm9mZnNldFZlY3RvciwgbS54LCBtLnkpO1xuXHRnbC51bmlmb3JtMWYoYy5mbGlwWSwgLTEpO1xuXG5cdGZvciAodmFyIHYgPSAwLCBnID0gdGhpcy5jdXJyZW50QmF0Y2hTaXplOyBnID4gdjsgdisrKSB7XG5cdFx0biA9IHRoaXMuc3ByaXRlc1t2XTtcblx0XHRpID0gaXNOb3JtYWxNYXAgPyBuLm5vcm1hbE1hcC5iYXNlVGV4dHVyZSA6IG4udGV4dHVyZS5iYXNlVGV4dHVyZTtcblx0XHRwID0gdSAhPT0gcjtcblx0XHRkID0gYyAhPT0gbztcblx0XHRpZiAobCAhPT0gaSkge1xuXHRcdFx0dGhpcy5yZW5kZXJCYXRjaChsLCBhLCBoKTtcblx0XHRcdGggPSB2O1xuXHRcdFx0YSA9IDA7XG5cdFx0XHRsID0gaTtcblx0XHR9XG5cdFx0YSsrO1xuXHR9XG5cdHRoaXMucmVuZGVyQmF0Y2gobCwgYSwgaClcbn1cblxuTGlnaHRTcHJpdGVCYXRjaC5wcm90b3R5cGUucmVuZGVyQmF0Y2ggPSBmdW5jdGlvbih0LCBlLCBpKSB7XG5cdGlmICgwICE9PSBlKSB7XG5cdFx0dmFyIGdsID0gdGhpcy5nbDtcblx0XHRpZiAodC5fZGlydHlbZ2wuaWRdKSB7XG5cdFx0XHR0aGlzLnJlbmRlclNlc3Npb24ucmVuZGVyZXIudXBkYXRlVGV4dHVyZSh0KVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRnbC5hY3RpdmVUZXh0dXJlKGdsLlRFWFRVUkUwKTtcblx0XHRcdGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHQuX2dsVGV4dHVyZXNbZ2wuaWRdKTtcblx0XHR9XG5cdFx0Z2wuZHJhd0VsZW1lbnRzKGdsLlRSSUFOR0xFUywgNiAqIGUsIGdsLlVOU0lHTkVEX1NIT1JULCA2ICogaSAqIDIpO1xuXHRcdHRoaXMucmVuZGVyU2Vzc2lvbi5kcmF3Q291bnQrK1xuXHR9XG59XG5cbkxpZ2h0U3ByaXRlQmF0Y2gucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5mbHVzaCgpO1xuXHR0aGlzLmRpcnR5ID0gITBcbn1cblxuTGlnaHRTcHJpdGVCYXRjaC5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5kaXJ0eSA9ICEwXG59XG5cbkxpZ2h0U3ByaXRlQmF0Y2gucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcblx0dGhpcy52ZXJ0aWNlcyA9IG51bGw7XG5cdHRoaXMuaW5kaWNlcyA9IG51bGw7IHRoaXMuZ2wuZGVsZXRlQnVmZmVyKHRoaXMudmVydGV4QnVmZmVyKTsgdGhpcy5nbC5kZWxldGVCdWZmZXIodGhpcy5pbmRleEJ1ZmZlcik7XG5cdHRoaXMuY3VycmVudEJhc2VUZXh0dXJlID0gbnVsbDtcblx0dGhpcy5nbCA9IG51bGxcbn1cblxuLy8gbW9kdWxlLmV4cG9ydHMgPSBMaWdodFNwcml0ZUJhdGNoXG4iLCIndXNlIHN0cmljdCc7XG5cbi8vdmFyIHIgPSB0KFwiUElYSVwiKTtcblxudmFyIE5vcm1hbE1hcEZpbHRlciA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odCkge1xuXHRQSVhJLkFic3RyYWN0RmlsdGVyLmNhbGwodGhpcyk7XG5cdHRoaXMucGFzc2VzID0gW3RoaXNdO1xuXHR0aGlzLnVuaWZvcm1zID0ge1xuXHRcdGRpc3BsYWNlbWVudE1hcDoge1xuXHRcdFx0dHlwZTogXCJzYW1wbGVyMkRcIixcblx0XHRcdHZhbHVlOiB0XG5cdFx0fSxcblx0XHRzY2FsZToge1xuXHRcdFx0dHlwZTogXCIyZlwiLFxuXHRcdFx0dmFsdWU6IHtcblx0XHRcdFx0eDogMSxcblx0XHRcdFx0eTogMVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0b2Zmc2V0OiB7XG5cdFx0XHR0eXBlOiBcIjJmXCIsXG5cdFx0XHR2YWx1ZToge1xuXHRcdFx0XHR4OiAwLFxuXHRcdFx0XHR5OiAwXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRtYXBEaW1lbnNpb25zOiB7XG5cdFx0XHR0eXBlOiBcIjJmXCIsXG5cdFx0XHR2YWx1ZToge1xuXHRcdFx0XHR4OiAxLFxuXHRcdFx0XHR5OiAxXG5cdFx0XHR9XG5cdFx0fSxcblx0XHR6b29tU2NhbGU6IHtcblx0XHRcdHR5cGU6IFwiMmZcIixcblx0XHRcdHZhbHVlOiB7XG5cdFx0XHRcdHg6IDEsXG5cdFx0XHRcdHk6IDFcblx0XHRcdH1cblx0XHR9LFxuXHRcdGRpbWVuc2lvbnM6IHtcblx0XHRcdHR5cGU6IFwiNGZ2XCIsXG5cdFx0XHR2YWx1ZTogWzAsIDAsIDAsIDBdXG5cdFx0fSxcblxuXHRcdExpZ2h0UG9zOiB7XG5cdFx0XHR0eXBlOiBcIjNmdlwiLFxuXHRcdFx0dmFsdWU6IFtcblx0XHRcdFx0MSwgMSwgLjEsXG5cdFx0XHRcdC8vMSwgMSwgLjEsXG5cdFx0XHRdXG5cdFx0fSxcblx0XHRMaWdodENvbG9yOiB7XG5cdFx0XHR0eXBlOiBcIjRmdlwiLFxuXHRcdFx0dmFsdWU6IFtcblx0XHRcdFx0MS4wLCAwLCAwLjgsIDEuMCxcblx0XHRcdFx0Ly8wLjAsIDAuOSwgMC44LCAxLjAsXG5cdFx0XHRdXG5cdFx0fSxcblxuXG5cdFx0RmFsbG9mZjoge1xuXHRcdFx0dHlwZTogXCIzZnZcIixcblx0XHRcdHZhbHVlOiBbXG5cdFx0XHRcdC8vMCwgLjEsIC40LFxuXHRcdFx0XHQwLjIsIC4xLCAuNCxcblx0XHRcdF1cblx0XHR9LFxuXG5cblx0XHRBbWJpZW50Q29sb3I6IHtcblx0XHRcdHR5cGU6IFwiNGZ2XCIsXG5cdFx0XHR2YWx1ZTogWzAuOSwgMjQxLjAgLyAyNTUuMCwgMjI0LjAgLyAyNTUuMCwgMC4yXVxuXHRcdH0sXG5cdH07XG5cblx0aWYgKHQuYmFzZVRleHR1cmUuaGFzTG9hZGVkKSB7XG5cdFx0dGhpcy51bmlmb3Jtcy5tYXBEaW1lbnNpb25zLnZhbHVlLnggPSB0LndpZHRoO1xuXHRcdHRoaXMudW5pZm9ybXMubWFwRGltZW5zaW9ucy52YWx1ZS55ID0gdC5oZWlnaHQ7XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5ib3VuZExvYWRlZEZ1bmN0aW9uID0gdGhpcy5vblRleHR1cmVMb2FkZWQuYmluZCh0aGlzKTtcblx0XHR0LmJhc2VUZXh0dXJlLm9uKFwibG9hZGVkXCIsIHRoaXMuYm91bmRMb2FkZWRGdW5jdGlvbik7XG5cdH1cblxuXHR0aGlzLmZyYWdtZW50U3JjID0gW1xuXHRcdFwicHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XCIsXG5cdFx0XCIjZGVmaW5lIE1BWF9MSUdIVFMgNjRcIixcblx0XHRcInZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkO1wiLFxuXHRcdFwidmFyeWluZyB2ZWM0IHZDb2xvcjtcIixcblx0XHRcInVuaWZvcm0gc2FtcGxlcjJEIHVTYW1wbGVyO1wiLFxuXHRcdFwidW5pZm9ybSBzYW1wbGVyMkQgZGlzcGxhY2VtZW50TWFwO1wiLFxuXHRcdFwidW5pZm9ybSB2ZWM0IGRpbWVuc2lvbnM7XCIsXG5cdFx0XCJjb25zdCB2ZWMyIFJlc29sdXRpb24gPSB2ZWMyKDEuMCwxLjApO1wiLFxuXHRcdFwidW5pZm9ybSB2ZWMzIExpZ2h0UG9zW01BWF9MSUdIVFNdO1wiLFxuXHRcdC8vXCJjb25zdCB2ZWM0IExpZ2h0Q29sb3IgPSB2ZWM0KDAuOSwgMjQxLjAvMjU1LjAsIDIyNC4wLzI1NS4wLCAxLjApO1wiLFxuXHRcdFwidW5pZm9ybSB2ZWM0IExpZ2h0Q29sb3JbTUFYX0xJR0hUU107XCIsXG5cdFx0Ly9cImNvbnN0IHZlYzQgQW1iaWVudENvbG9yID0gdmVjNCgwLjksIDI0MS4wLzI1NS4wLCAyMjQuMC8yNTUuMCwgMC4zKTtcIixcblx0XHRcInVuaWZvcm0gdmVjNCBBbWJpZW50Q29sb3I7XCIsXG5cblx0XHQvL1wiY29uc3QgdmVjMyBGYWxsb2ZmID0gdmVjMygwLjAsIDAuMSwgMC40KTtcIixcblx0XHQvL1wiY29uc3QgdmVjMyBGYWxsb2ZmID0gdmVjMygwLjQsIDMuMiwgMjAuMCk7XCIsXG5cdFx0Ly9cIi8qY29uc3QqLyB2ZWMzIEZhbGxvZmYgPSB2ZWMzKDAuMCwgMC4yLCAwMC4wKTtcIixcblx0XHRcInVuaWZvcm0gdmVjMyBGYWxsb2ZmO1wiLFxuXHRcdFwidW5pZm9ybSB2ZWMzIExpZ2h0RGlyO1wiLFxuXHRcdFwidW5pZm9ybSB2ZWMyIG1hcERpbWVuc2lvbnM7XCIsXG5cdFx0XCJ1bmlmb3JtIHZlYzIgem9vbVNjYWxlO1wiLFxuXG5cdFx0XCJ2b2lkIG1haW4odm9pZCkge1wiLFxuXHRcdFwiICAgIHZlYzIgbWFwQ29yZHMgPSB2VGV4dHVyZUNvb3JkLnh5O1wiLFxuXHRcdFwiICAgIHZlYzQgY29sb3IgPSB0ZXh0dXJlMkQodVNhbXBsZXIsIHZUZXh0dXJlQ29vcmQuc3QpO1wiLFxuXHRcdFwiICAgIHZlYzMgbkNvbG9yID0gdGV4dHVyZTJEKGRpc3BsYWNlbWVudE1hcCwgdlRleHR1cmVDb29yZC5zdCkucmdiO1wiLFxuXHRcdFwiICAgIG1hcENvcmRzICo9IGRpbWVuc2lvbnMueHkvbWFwRGltZW5zaW9ucztcIixcblxuXHRcdFwiICAgIHZlYzQgRGlmZnVzZUNvbG9yID0gdGV4dHVyZTJEKGRpc3BsYWNlbWVudE1hcCwgdlRleHR1cmVDb29yZCk7XCIsXG5cdFx0XCIgICAgdmVjMyBOb3JtYWxNYXAgPSB0ZXh0dXJlMkQodVNhbXBsZXIsIHZUZXh0dXJlQ29vcmQpLnJnYjtcIixcblxuXHRcdFwiICAgIHZlYzMgU3VtID0gdmVjMygwLjApO1wiLFxuXHRcdFwiICAgIGZvciAoaW50IGk9MDsgaTxNQVhfTElHSFRTOyBpKyspIHtcIixcblx0XHRcIiAgICAgICAgaWYoTGlnaHRDb2xvcltpXS5hID09IDAuMCkge1wiLFxuXHRcdFwiICAgICAgICAgICAgYnJlYWs7XCIsXG5cdFx0XCIgICAgICAgIH1cIixcblx0XHRcIiAgICAgICAgdmVjMyBMaWdodERpciA9IHZlYzMoKExpZ2h0UG9zW2ldLnh5L21hcERpbWVuc2lvbnMpIC0gKHZUZXh0dXJlQ29vcmQueHkpLCBMaWdodFBvc1tpXS56KTtcIixcblxuXHRcdFwiICAgICAgICAvLyBEZXRlcm1pbmUgZGlzdGFuY2UgKHVzZWQgZm9yIGF0dGVudWF0aW9uIEJFRk9SRSB3ZSBub3JtYWxpemUgb3VyIExpZ2h0RGlyXCIsXG5cdFx0XCIgICAgICAgIGZsb2F0IEQgPSBsZW5ndGgoTGlnaHREaXIpO1wiLFxuXHRcdFwiICAgICAgICAvLyBub3JtYWxpemUgb3VyIHZlY3RvcnNcIixcblx0XHRcIiAgICAgICAgdmVjMyBOID0gbm9ybWFsaXplKE5vcm1hbE1hcCAqIDIuMCAtIDEuMCk7XCIsXG5cdFx0XCIgICAgICAgIHZlYzMgTCA9IG5vcm1hbGl6ZShMaWdodERpcik7XCIsXG5cblx0XHRcIiAgICAgICAgLy8gUHJlLW11bHRpcGx5IGxpZ2h0cyBjb2xvciB3aXRoIGludGVuc2l0eVwiLFxuXHRcdFwiICAgICAgICAvLyBUaGVuIHBlcmZvcm0gJ04gZG90IEwnIHRvIGRldGVybWluZSBvdXIgZGlmZnVzZSB0ZXJtXCIsXG5cdFx0XCIgICAgICAgIHZlYzMgRGlmZnVzZSA9IChMaWdodENvbG9yW2ldLnJnYiAqIExpZ2h0Q29sb3JbaV0uYSkgKiBtYXgoZG90KE4sIEwpLCAwLjApICogMS4wO1wiLFxuXG5cblx0XHQvL1wiIEZhbGxvZmYueiA9IExpZ2h0Q29sb3JbaV0uYSoxMDAuMDtcIixcblx0XHRcIiAgICAvLyBjYWxjdWxhdGUgYXR0ZW51YXRpb25cIixcblx0XHRcIiAgICAgICAgZmxvYXQgQXR0ZW51YXRpb24gPSAxLjAgLyAoRmFsbG9mZi54ICsgKEZhbGxvZmYueSpEKSArIChGYWxsb2ZmLnoqRCpEKSk7XCIsXG5cdFx0Ly9cIiAgICAgICAgLypmbG9hdCovIEF0dGVudWF0aW9uID0gMC4yL0Q7XCIsXG5cdFx0Ly9cIiAgICAgICAgQXR0ZW51YXRpb24gPSBtaW4oQXR0ZW51YXRpb24sIDEuMCk7XCIsXG5cblx0XHRcIiAgICAgICAgLy8gdGhlIGNhbGN1bGF0aW9uIGhpY2ggYnJpbmdzIGl0IGFsbCB0b2dldGhlclwiLFxuXHRcdFwiICAgICAgICB2ZWMzIEludGVuc2l0eSA9IChEaWZmdXNlICogQXR0ZW51YXRpb24pIC8qKyBBbWJpZW50Ki87XCIsXG5cdFx0Ly9cIiAgICAgICAgdmVjMyBGaW5hbENvbG9yID0gRGlmZnVzZUNvbG9yLnJnYiAqIEludGVuc2l0eTtcIixcblx0XHQvL1wiICAgICAgICBTdW0gKz0gRmluYWxDb2xvcjtcIixcblx0XHRcIiAgICAgICAgU3VtICs9IEludGVuc2l0eTtcIixcblx0XHRcIiAgICB9XCIsXG5cblx0XHRcIiAgICAvLyBQcmUtbXVsdGlwbHkgYW1iaWVudCBjb2xvciB3aXRoIGludGVuc2l0eVwiLFxuXHRcdFwiICAgIHZlYzMgQW1iaWVudCA9IEFtYmllbnRDb2xvci5yZ2IgKiBBbWJpZW50Q29sb3IuYTtcIixcblx0XHRcIiAgICB2ZWMzIEludGVuc2l0eSA9IFN1bSArIEFtYmllbnQ7XCIsXG5cdFx0XCIgICAgdmVjMyBGaW5hbENvbG9yID0gRGlmZnVzZUNvbG9yLnJnYiAqIEludGVuc2l0eTtcIixcblx0XHRcIiAgICBnbF9GcmFnQ29sb3IgPSB2Q29sb3IgKiB2ZWM0KEZpbmFsQ29sb3IsIERpZmZ1c2VDb2xvci5hKTtcIixcblx0XHRcIn1cIlxuXHRdO1xuXG59XG5Ob3JtYWxNYXBGaWx0ZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQSVhJLkFic3RyYWN0RmlsdGVyLnByb3RvdHlwZSk7XG5Ob3JtYWxNYXBGaWx0ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTm9ybWFsTWFwRmlsdGVyO1xuTm9ybWFsTWFwRmlsdGVyLnByb3RvdHlwZS5vblRleHR1cmVMb2FkZWQgPSBmdW5jdGlvbigpIHtcblx0dGhpcy51bmlmb3Jtcy5tYXBEaW1lbnNpb25zLnZhbHVlLnggPSB0aGlzLnVuaWZvcm1zLmRpc3BsYWNlbWVudE1hcC52YWx1ZS53aWR0aDtcblx0dGhpcy51bmlmb3Jtcy5tYXBEaW1lbnNpb25zLnZhbHVlLnkgPSB0aGlzLnVuaWZvcm1zLmRpc3BsYWNlbWVudE1hcC52YWx1ZS5oZWlnaHQ7XG5cdHRoaXMudW5pZm9ybXMuZGlzcGxhY2VtZW50TWFwLnZhbHVlLmJhc2VUZXh0dXJlLm9mZihcImxvYWRlZFwiLCB0aGlzLmJvdW5kTG9hZGVkRnVuY3Rpb24pO1xufVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE5vcm1hbE1hcEZpbHRlci5wcm90b3R5cGUsIFwibWFwXCIsIHtcblx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy51bmlmb3Jtcy5kaXNwbGFjZW1lbnRNYXAudmFsdWVcblx0fSxcblx0c2V0OiBmdW5jdGlvbih0KSB7XG5cdFx0dGhpcy51bmlmb3Jtcy5kaXNwbGFjZW1lbnRNYXAudmFsdWUgPSB0XG5cdH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE5vcm1hbE1hcEZpbHRlci5wcm90b3R5cGUsIFwic2NhbGVcIiwge1xuXHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLnVuaWZvcm1zLnNjYWxlLnZhbHVlXG5cdH0sXG5cdHNldDogZnVuY3Rpb24odCkge1xuXHRcdHRoaXMudW5pZm9ybXMuc2NhbGUudmFsdWUgPSB0XG5cdH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE5vcm1hbE1hcEZpbHRlci5wcm90b3R5cGUsIFwib2Zmc2V0XCIsIHtcblx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy51bmlmb3Jtcy5vZmZzZXQudmFsdWVcblx0fSxcblx0c2V0OiBmdW5jdGlvbih0KSB7XG5cdFx0dGhpcy51bmlmb3Jtcy5vZmZzZXQudmFsdWUgPSB0XG5cdH1cbn0pO1xuXG4vL21vZHVsZS5leHBvcnRzID0gTm9ybWFsTWFwRmlsdGVyXG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBCbG9jayA9IGZ1bmN0aW9uKCkge1xuXHQvKiogQG1lbWJlciB7RmxvYXR9ICovXG5cdHRoaXMueCA9IDAuMDtcblx0LyoqIEBtZW1iZXIge0Zsb2F0fSAqL1xuXHR0aGlzLnkgPSAwLjA7XG5cdC8qKiBAbWVtYmVyIHtGbG9hdH0gKi9cblx0dGhpcy5yID0gMC4wO1xufVxuXG52YXIgUG9pbnQgPSBmdW5jdGlvbih4LCB5KSB7XG5cdC8qKiBAbWVtYmVyIHtGbG9hdH0gKi9cblx0dGhpcy54ID0geDtcblx0LyoqIEBtZW1iZXIge0Zsb2F0fSAqL1xuXHR0aGlzLnkgPSB5O1xufVxuXG52YXIgRW5kUG9pbnQgPSBmdW5jdGlvbih4LCB5KSB7XG5cdC8qKiBAbWVtYmVyIHtGbG9hdH0gKi9cblx0dGhpcy54ID0geDtcblx0LyoqIEBtZW1iZXIge0Zsb2F0fSAqL1xuXHR0aGlzLnkgPSB5O1xuXHQvKiogQG1lbWJlciB7Qm9vbH0gKi9cblx0dGhpcy5iZWdpbiA9IGZhbHNlO1xuXHQvKiogQG1lbWJlciB7U2VnbWVudH0gKi9cblx0dGhpcy5zZWdtZW50ID0gbnVsbDtcblx0LyoqIEBtZW1iZXIge0Zsb2F0fSAqL1xuXHR0aGlzLmFuZ2xlID0gMC4wO1xuXHQvKiogQG1lbWJlciB7Qm9vbH0gKi9cblx0dGhpcy52aXN1YWxpemUgPSBmYWxzZTtcbn1cblxudmFyIFNlZ21lbnQgPSBmdW5jdGlvbigpIHtcblx0LyoqIEBtZW1iZXIge0VuZFBvaW50fSAqL1xuXHR0aGlzLnAxID0gbmV3IEVuZFBvaW50KDAsIDApO1xuXHQvKiogQG1lbWJlciB7RW5kUG9pbnR9ICovXG5cdHRoaXMucDIgPSBuZXcgRW5kUG9pbnQoMCwgMCk7XG5cdC8qKiBAbWVtYmVyIHtGbG9hdH0gKi9cblx0dGhpcy5kID0gMC4wO1xufVxuXG4vKiogQGNvbnN0cnVjdG9yICovXG52YXIgVmlzaWJpbGl0eSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG5cdC8vIFRoZXNlIHJlcHJlc2VudCB0aGUgbWFwIGFuZCB0aGUgbGlnaHQgbG9jYXRpb246XG5cdC8qKiBAbWVtYmVyIHtBcnJheX0gLSBBcnJheSBvZiBTZWdtZW50ICovXG5cdHRoaXMuc2VnbWVudHMgPSBbXTtcblx0LyoqIEBtZW1iZXIge0FycmF5fSAtIEFycmF5IG9mIEVuZFBvaW50ICovXG5cdHRoaXMuZW5kcG9pbnRzID0gW107XG5cdC8qKiBAbWVtYmVyIHtQb2ludH0gKi9cblx0dGhpcy5jZW50ZXIgPSBuZXcgUG9pbnQoMCwgMCk7XG5cblx0Ly8gVGhlc2UgYXJlIGN1cnJlbnRseSAnb3BlbicgbGluZSBzZWdtZW50cywgc29ydGVkIHNvIHRoYXQgdGhlIG5lYXJlc3Rcblx0Ly8gc2VnbWVudCBpcyBmaXJzdC4gSXQncyB1c2VkIG9ubHkgZHVyaW5nIHRoZSBzd2VlcCBhbGdvcml0aG0sIGFuZCBleHBvc2VkXG5cdC8vIGFzIGEgcHVibGljIGZpZWxkIGhlcmUgc28gdGhhdCB0aGUgZGVtbyBjYW4gZGlzcGxheSBpdC5cblx0LyoqIEBtZW1iZXIge0FycmF5fSAtIEFycmF5IG9mIFNlZ21lbnQqL1xuXHR0aGlzLm9wZW4gPSBuZXcgZGVfcG9seWdvbmFsX2RzX0RMTCgpO1xuXG5cdC8vIFRoZSBvdXRwdXQgaXMgYSBzZXJpZXMgb2YgcG9pbnRzIHRoYXQgZm9ybXMgYSB2aXNpYmxlIGFyZWEgcG9seWdvblxuXHQvKiogQG1lbWJlciB7QXJyYXl9IC0gQXJyYXkgb2YgUG9pbnQqL1xuXHR0aGlzLm91dHB1dCA9IFtdO1xuXG5cdC8vIEZvciB0aGUgZGVtbywga2VlcCB0cmFjayBvZiB3YWxsIGludGVyc2VjdGlvbnNcblx0LyoqIEBtZW1iZXIge0FycmF5fSAtIEFycmF5IG9mIEFycmF5IG9mIFBvaW50Ki9cblx0dGhpcy5kZW1vX2ludGVyc2VjdGlvbnNEZXRlY3RlZCA9IFtdO1xufTtcblxuLyoqXG4gKiBIZWxwZXI6IGNvbXBhcmlzb24gZnVuY3Rpb24gZm9yIHNvcnRpbmcgcG9pbnRzIGJ5IGFuZ2xlXG4gKiBAcGFyYW0ge0VuZFBvaW50fSBhXG4gKiBAcGFyYW0ge0VuZFBvaW50fSBiXG4gKiBAcmV0dXJuIHtJbnR9XG4gKiBAc3RhdGljXG4gKiBAcHJpdmF0ZVxuICovXG5WaXNpYmlsaXR5Ll9lbmRwb2ludF9jb21wYXJlID0gZnVuY3Rpb24oYSwgYikge1xuXHQvLyBUcmF2ZXJzZSBpbiBhbmdsZSBvcmRlclxuXHRpZiAoYS5hbmdsZSA+IGIuYW5nbGUpIHJldHVybiAxO1xuXHRpZiAoYS5hbmdsZSA8IGIuYW5nbGUpIHJldHVybiAtMTtcblx0Ly8gQnV0IGZvciB0aWVzIChjb21tb24pLCB3ZSB3YW50IEJlZ2luIG5vZGVzIGJlZm9yZSBFbmQgbm9kZXNcblx0aWYgKCFhLmJlZ2luICYmIGIuYmVnaW4pIHJldHVybiAxO1xuXHRpZiAoYS5iZWdpbiAmJiAhYi5iZWdpbikgcmV0dXJuIC0xO1xuXHRyZXR1cm4gMDtcbn07XG5cbi8qKlxuICogSGVscGVyOiBsZWZ0T2Yoc2VnbWVudCwgcG9pbnQpIHJldHVybnMgdHJ1ZSBpZiBwb2ludCBpcyBcImxlZnRcIlxuICogb2Ygc2VnbWVudCB0cmVhdGVkIGFzIGEgdmVjdG9yLiBOb3RlIHRoYXQgdGhpcyBhc3N1bWVzIGEgMkRcbiAqIGNvb3JkaW5hdGUgc3lzdGVtIGluIHdoaWNoIHRoZSBZIGF4aXMgZ3Jvd3MgZG93bndhcmRzLCB3aGljaFxuICogbWF0Y2hlcyBjb21tb24gMkQgZ3JhcGhpY3MgbGlicmFyaWVzLCBidXQgaXMgdGhlIG9wcG9zaXRlIG9mXG4gKiB0aGUgdXN1YWwgY29udmVudGlvbiBmcm9tIG1hdGhlbWF0aWNzIGFuZCBpbiAzRCBncmFwaGljc1xuICogbGlicmFyaWVzLlxuICogQHBhcmFtIHtTZWdtZW50fSBzXG4gKiBAcGFyYW0ge1BvaW50fSBwXG4gKiBAcmV0dXJuIHtCb29sfVxuICogQHN0YXRpY1xuICogQHByaXZhdGVcbiAqL1xuVmlzaWJpbGl0eS5sZWZ0T2YgPSBmdW5jdGlvbihzLCBwKSB7XG5cdC8vIFRoaXMgaXMgYmFzZWQgb24gYSAzZCBjcm9zcyBwcm9kdWN0LCBidXQgd2UgZG9uJ3QgbmVlZCB0b1xuXHQvLyB1c2UgeiBjb29yZGluYXRlIGlucHV0cyAodGhleSdyZSAwKSwgYW5kIHdlIG9ubHkgbmVlZCB0aGVcblx0Ly8gc2lnbi4gSWYgeW91J3JlIGFubm95ZWQgdGhhdCBjcm9zcyBwcm9kdWN0IGlzIG9ubHkgZGVmaW5lZFxuXHQvLyBpbiAzZCwgc2VlIFwib3V0ZXIgcHJvZHVjdFwiIGluIEdlb21ldHJpYyBBbGdlYnJhLlxuXHQvLyA8aHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9HZW9tZXRyaWNfYWxnZWJyYT5cblx0dmFyIGNyb3NzID0gKHMucDIueCAtIHMucDEueCkgKiAocC55IC0gcy5wMS55KSAtIChzLnAyLnkgLSBzLnAxLnkpICogKHAueCAtIHMucDEueCk7XG5cdHJldHVybiBjcm9zcyA8IDA7XG5cdC8vIEFsc28gbm90ZSB0aGF0IHRoaXMgaXMgdGhlIG5haXZlIHZlcnNpb24gb2YgdGhlIHRlc3QgYW5kXG5cdC8vIGlzbid0IG51bWVyaWNhbGx5IHJvYnVzdC4gU2VlXG5cdC8vIDxodHRwczovL2dpdGh1Yi5jb20vbWlrb2xhbHlzZW5rby9yb2J1c3QtYXJpdGhtZXRpYz4gZm9yIGFcblx0Ly8gZGVtbyBvZiBob3cgdGhpcyBmYWlscyB3aGVuIGEgcG9pbnQgaXMgdmVyeSBjbG9zZSB0byB0aGVcblx0Ly8gbGluZS5cbn07XG5cbi8qKlxuICogUmV0dXJuIHAqKDEtZikgKyBxKmZcbiAqIEBwYXJhbSB7UG9pbnR9IHBcbiAqIEBwYXJhbSB7UG9pbnR9IHFcbiAqIEBwYXJhbSB7RmxvYXR9IGZcbiAqIEByZXR1cm4ge1BvaW50fVxuICogQHByaXZhdGVcbiAqIEBzdGF0aWNcbiAqL1xuVmlzaWJpbGl0eS5pbnRlcnBvbGF0ZSA9IGZ1bmN0aW9uKHAsIHEsIGYpIHtcblx0cmV0dXJuIG5ldyBQb2ludChwLnggKiAoMSAtIGYpICsgcS54ICogZiwgcC55ICogKDEgLSBmKSArIHEueSAqIGYpO1xufTtcblxuVmlzaWJpbGl0eS5wcm90b3R5cGUgPSB7XG5cdC8qKlxuXHQgKiBIZWxwZXIgZnVuY3Rpb24gdG8gY29uc3RydWN0IHNlZ21lbnRzIGFsb25nIHRoZSBvdXRzaWRlIHBlcmltZXRlclxuXHQgKiBAcGFyYW0ge0ludH0gc2l6ZVxuXHQgKiBAcGFyYW0ge0ludH0gbWFyZ2luXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRsb2FkRWRnZU9mTWFwOiBmdW5jdGlvbihzaXplLCBtYXJnaW4pIHtcblx0XHR0aGlzLmFkZFNlZ21lbnQobWFyZ2luLCBtYXJnaW4sIG1hcmdpbiwgc2l6ZSAtIG1hcmdpbik7XG5cdFx0dGhpcy5hZGRTZWdtZW50KG1hcmdpbiwgc2l6ZSAtIG1hcmdpbiwgc2l6ZSAtIG1hcmdpbiwgc2l6ZSAtIG1hcmdpbik7XG5cdFx0dGhpcy5hZGRTZWdtZW50KHNpemUgLSBtYXJnaW4sIHNpemUgLSBtYXJnaW4sIHNpemUgLSBtYXJnaW4sIG1hcmdpbik7XG5cdFx0dGhpcy5hZGRTZWdtZW50KHNpemUgLSBtYXJnaW4sIG1hcmdpbiwgbWFyZ2luLCBtYXJnaW4pO1xuXHRcdC8vIE5PVEU6IGlmIHVzaW5nIHRoZSBzaW1wbGVyIGRpc3RhbmNlIGZ1bmN0aW9uIChhLmQgPCBiLmQpXG5cdFx0Ly8gdGhlbiB3ZSBuZWVkIHNlZ21lbnRzIHRvIGJlIHNpbWlsYXJseSBzaXplZCwgc28gdGhlIGVkZ2Ugb2Zcblx0XHQvLyB0aGUgbWFwIG5lZWRzIHRvIGJlIGJyb2tlbiB1cCBpbnRvIHNtYWxsZXIgc2VnbWVudHMuXG5cdH0sXG5cblxuXHQvKipcblx0ICogTG9hZCBhIHNldCBvZiBzcXVhcmUgYmxvY2tzLCBwbHVzIGFueSBvdGhlciBsaW5lIHNlZ21lbnRzXG5cdCAqIEBwYXJhbSBzaXplXG5cdCAqIEBwYXJhbSBtYXJnaW5cblx0ICogQHBhcmFtIHtBcnJheX0gYmxvY2tzIC0gQXJyYXkgb2YgQmxvY2tcblx0ICogQHBhcmFtIHtBcnJheX0gd2FsbHMgLSBBcnJheSBvZiBTZWdtZW50XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGxvYWRNYXA6IGZ1bmN0aW9uKHNpemUsIG1hcmdpbiwgYmxvY2tzLCB3YWxscykge1xuXHRcdHRoaXMuc2VnbWVudHMgPSBbXTtcblx0XHR0aGlzLmVuZHBvaW50cyA9IFtdO1xuXHRcdHRoaXMubG9hZEVkZ2VPZk1hcChzaXplLCBtYXJnaW4pO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDAsIGwgPSBibG9ja3MubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdFx0XHR2YXIgYmxvY2sgPSBibG9ja3NbaV07XG5cdFx0XHR2YXIgeCA9IGJsb2NrLng7XG5cdFx0XHR2YXIgeSA9IGJsb2NrLnk7XG5cdFx0XHR2YXIgdyA9IGJsb2NrLnIgfHwgYmxvY2sud2lkdGg7XG5cdFx0XHR2YXIgaCA9IGJsb2NrLnIgfHwgYmxvY2suaGVpZ2h0O1xuXG5cdFx0XHQvKlxuXHRcdFx0dGhpcy5hZGRTZWdtZW50KHggLSByLCB5IC0gciwgeCAtIHIsIHkgKyByKTtcblx0XHRcdHRoaXMuYWRkU2VnbWVudCh4IC0gciwgeSArIHIsIHggKyByLCB5ICsgcik7XG5cdFx0XHR0aGlzLmFkZFNlZ21lbnQoeCArIHIsIHkgKyByLCB4ICsgciwgeSAtIHIpO1xuXHRcdFx0dGhpcy5hZGRTZWdtZW50KHggKyByLCB5IC0gciwgeCAtIHIsIHkgLSByKTtcblx0XHRcdCovXG5cdFx0XHQvKlxuXHRcdFx0dGhpcy5hZGRTZWdtZW50KHggLSB3LCB5IC0gaCwgeCAtIHcsIHkgKyBoKTtcblx0XHRcdHRoaXMuYWRkU2VnbWVudCh4IC0gdywgeSArIGgsIHggKyB3LCB5ICsgaCk7XG5cdFx0XHR0aGlzLmFkZFNlZ21lbnQoeCArIHcsIHkgKyBoLCB4ICsgdywgeSAtIGgpO1xuXHRcdFx0dGhpcy5hZGRTZWdtZW50KHggKyB3LCB5IC0gaCwgeCAtIHcsIHkgLSBoKTtcblx0XHRcdCovXG5cdFx0XHR0aGlzLmFkZFNlZ21lbnQoeCwgeSwgeCwgeSArIGgpO1xuXHRcdFx0dGhpcy5hZGRTZWdtZW50KHgsIHkgKyBoLCB4ICsgdywgeSArIGgpO1xuXHRcdFx0dGhpcy5hZGRTZWdtZW50KHggKyB3LCB5ICsgaCwgeCArIHcsIHkpO1xuXHRcdFx0dGhpcy5hZGRTZWdtZW50KHggKyB3LCB5LCB4LCB5KTtcblx0XHR9XG5cblx0XHRmb3IgKHZhciBpID0gMCwgbCA9IHdhbGxzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuXHRcdFx0dmFyIHdhbGwgPSB3YWxsc1tpXTtcblx0XHRcdHRoaXMuYWRkU2VnbWVudCh3YWxsLnAxLngsIHdhbGwucDEueSwgd2FsbC5wMi54LCB3YWxsLnAyLnkpO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogQWRkIGEgc2VnbWVudCwgd2hlcmUgdGhlIGZpcnN0IHBvaW50IHNob3dzIHVwIGluIHRoZVxuXHQgKiB2aXN1YWxpemF0aW9uIGJ1dCB0aGUgc2Vjb25kIG9uZSBkb2VzIG5vdC4gKEV2ZXJ5IGVuZHBvaW50IGlzXG5cdCAqIHBhcnQgb2YgdHdvIHNlZ21lbnRzLCBidXQgd2Ugd2FudCB0byBvbmx5IHNob3cgdGhlbSBvbmNlLilcblx0ICogQHBhcmFtIHtGbG9hdH0geDFcblx0ICogQHBhcmFtIHtGbG9hdH0geTFcblx0ICogQHBhcmFtIHtGbG9hdH0geDJcblx0ICogQHBhcmFtIHtGbG9hdH0geTJcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGFkZFNlZ21lbnQ6IGZ1bmN0aW9uKHgxLCB5MSwgeDIsIHkyKSB7XG5cdFx0dmFyIHNlZ21lbnQgPSBuZXcgU2VnbWVudCgpO1xuXG5cdFx0dmFyIHAxID0gbmV3IEVuZFBvaW50KDAuMCwgMC4wKTtcblx0XHRwMS5zZWdtZW50ID0gc2VnbWVudDtcblx0XHRwMS52aXN1YWxpemUgPSB0cnVlO1xuXG5cdFx0dmFyIHAyID0gbmV3IEVuZFBvaW50KDAuMCwgMC4wKTtcblx0XHRwMi5zZWdtZW50ID0gc2VnbWVudDtcblx0XHRwMi52aXN1YWxpemUgPSBmYWxzZTtcblxuXHRcdHAxLnggPSB4MTtcblx0XHRwMS55ID0geTE7XG5cdFx0cDIueCA9IHgyO1xuXHRcdHAyLnkgPSB5MjtcblxuXHRcdHNlZ21lbnQucDEgPSBwMTtcblx0XHRzZWdtZW50LnAyID0gcDI7XG5cdFx0c2VnbWVudC5kID0gMC4wO1xuXG5cdFx0dGhpcy5zZWdtZW50cy5wdXNoKHNlZ21lbnQpO1xuXHRcdHRoaXMuZW5kcG9pbnRzLnB1c2gocDEpO1xuXHRcdHRoaXMuZW5kcG9pbnRzLnB1c2gocDIpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBTZXQgdGhlIGxpZ2h0IGxvY2F0aW9uLiBTZWdtZW50IGFuZCBFbmRQb2ludCBkYXRhIGNhbid0IGJlXG5cdCAqIHByb2Nlc3NlZCB1bnRpbCB0aGUgbGlnaHQgbG9jYXRpb24gaXMga25vd24uXG5cdCAqIEBwYXJhbSB7RmxvYXR9IHhcblx0ICogQHBhcmFtIHtGbG9hdH0geVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRzZXRMaWdodExvY2F0aW9uOiBmdW5jdGlvbih4LCB5KSB7XG5cdFx0dGhpcy5jZW50ZXIueCA9IHg7XG5cdFx0dGhpcy5jZW50ZXIueSA9IHk7XG5cblx0XHRmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMuc2VnbWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdFx0XHR2YXIgc2VnbWVudCA9IHRoaXMuc2VnbWVudHNbaV07XG5cblx0XHRcdHZhciBkeCA9IDAuNSAqIChzZWdtZW50LnAxLnggKyBzZWdtZW50LnAyLngpIC0geDtcblx0XHRcdHZhciBkeSA9IDAuNSAqIChzZWdtZW50LnAxLnkgKyBzZWdtZW50LnAyLnkpIC0geTtcblx0XHRcdC8vIE5PVEU6IHdlIG9ubHkgdXNlIHRoaXMgZm9yIGNvbXBhcmlzb24gc28gd2UgY2FuIHVzZVxuXHRcdFx0Ly8gZGlzdGFuY2Ugc3F1YXJlZCBpbnN0ZWFkIG9mIGRpc3RhbmNlLiBIb3dldmVyIGluXG5cdFx0XHQvLyBwcmFjdGljZSB0aGUgc3FydCBpcyBwbGVudHkgZmFzdCBhbmQgdGhpcyBkb2Vzbid0XG5cdFx0XHQvLyByZWFsbHkgaGVscCBpbiB0aGlzIHNpdHVhdGlvbi5cblx0XHRcdHNlZ21lbnQuZCA9IGR4ICogZHggKyBkeSAqIGR5O1xuXG5cdFx0XHQvLyBOT1RFOiBmdXR1cmUgb3B0aW1pemF0aW9uOiB3ZSBjb3VsZCByZWNvcmQgdGhlIHF1YWRyYW50XG5cdFx0XHQvLyBhbmQgdGhlIHkveCBvciB4L3kgcmF0aW8sIGFuZCBzb3J0IGJ5IChxdWFkcmFudCxcblx0XHRcdC8vIHJhdGlvKSwgaW5zdGVhZCBvZiBjYWxsaW5nIGF0YW4yLiBTZWVcblx0XHRcdC8vIDxodHRwczovL2dpdGh1Yi5jb20vbWlrb2xhbHlzZW5rby9jb21wYXJlLXNsb3BlPiBmb3IgYVxuXHRcdFx0Ly8gbGlicmFyeSB0aGF0IGRvZXMgdGhpcy4gQWx0ZXJuYXRpdmVseSwgY2FsY3VsYXRlIHRoZVxuXHRcdFx0Ly8gYW5nbGVzIGFuZCB1c2UgYnVja2V0IHNvcnQgdG8gZ2V0IGFuIE8oTikgc29ydC5cblx0XHRcdHNlZ21lbnQucDEuYW5nbGUgPSBNYXRoLmF0YW4yKHNlZ21lbnQucDEueSAtIHksIHNlZ21lbnQucDEueCAtIHgpO1xuXHRcdFx0c2VnbWVudC5wMi5hbmdsZSA9IE1hdGguYXRhbjIoc2VnbWVudC5wMi55IC0geSwgc2VnbWVudC5wMi54IC0geCk7XG5cblx0XHRcdHZhciBkQW5nbGUgPSBzZWdtZW50LnAyLmFuZ2xlIC0gc2VnbWVudC5wMS5hbmdsZTtcblx0XHRcdGlmIChkQW5nbGUgPD0gLU1hdGguUEkpIHtcblx0XHRcdFx0ZEFuZ2xlICs9IDIgKiBNYXRoLlBJO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGRBbmdsZSA+IE1hdGguUEkpIHtcblx0XHRcdFx0ZEFuZ2xlIC09IDIgKiBNYXRoLlBJO1xuXHRcdFx0fVxuXHRcdFx0c2VnbWVudC5wMS5iZWdpbiA9IChkQW5nbGUgPiAwLjApO1xuXHRcdFx0c2VnbWVudC5wMi5iZWdpbiA9ICFzZWdtZW50LnAxLmJlZ2luO1xuXHRcdH1cblx0fSxcblxuXG5cblxuXG5cblx0LyoqXG5cdCAqIFJ1biB0aGUgYWxnb3JpdGhtLCBzd2VlcGluZyBvdmVyIGFsbCBvciBwYXJ0IG9mIHRoZSBjaXJjbGUgdG8gZmluZFxuXHQgKiB0aGUgdmlzaWJsZSBhcmVhLCByZXByZXNlbnRlZCBhcyBhIHNldCBvZiB0cmlhbmdsZXNcblx0ICogQHB1YmxpY1xuXHQgKiBAcGFyYW0ge0Zsb2F0fSBtYXhBbmdsZVxuXHQgKi9cblx0c3dlZXA6IGZ1bmN0aW9uKG1heEFuZ2xlKSB7XG5cdFx0aWYgKG1heEFuZ2xlID09IG51bGwpIHtcblx0XHRcdG1heEFuZ2xlID0gOTk5LjA7XG5cdFx0fVxuXHRcdHRoaXMub3V0cHV0ID0gW107XG5cdFx0dGhpcy5kZW1vX2ludGVyc2VjdGlvbnNEZXRlY3RlZCA9IFtdO1xuXHRcdHRoaXMuZW5kcG9pbnRzLnNvcnQoVmlzaWJpbGl0eS5fZW5kcG9pbnRfY29tcGFyZSwgdHJ1ZSk7XG5cdFx0dGhpcy5vcGVuLmNsZWFyKCk7XG5cdFx0dmFyIGJlZ2luQW5nbGUgPSAwLjA7XG5cblx0XHQvL3ZhciBvcGVuID0gdGhpcy5vcGVuLnRvQXJyYXkoKTtcblx0XHQvL3ZhciBvcGVuID0gdGhpcy5vcGVuID0gW107XG5cblxuXHRcdC8vIEF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIHN3ZWVwIHdlIHdhbnQgdG8ga25vdyB3aGljaFxuXHRcdC8vIHNlZ21lbnRzIGFyZSBhY3RpdmUuIFRoZSBzaW1wbGVzdCB3YXkgdG8gZG8gdGhpcyBpcyB0byBtYWtlXG5cdFx0Ly8gYSBwYXNzIGNvbGxlY3RpbmcgdGhlIHNlZ21lbnRzLCBhbmQgbWFrZSBhbm90aGVyIHBhc3MgdG9cblx0XHQvLyBib3RoIGNvbGxlY3QgYW5kIHByb2Nlc3MgdGhlbS4gSG93ZXZlciBpdCB3b3VsZCBiZSBtb3JlXG5cdFx0Ly8gZWZmaWNpZW50IHRvIGdvIHRocm91Z2ggYWxsIHRoZSBzZWdtZW50cywgZmlndXJlIG91dCB3aGljaFxuXHRcdC8vIG9uZXMgaW50ZXJzZWN0IHRoZSBpbml0aWFsIHN3ZWVwIGxpbmUsIGFuZCB0aGVuIHNvcnQgdGhlbS5cblx0XHRmb3IgKHZhciBwYXNzID0gMDsgcGFzcyA8IDI7IHBhc3MrKykge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmVuZHBvaW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0XHRcdFx0dmFyIHAgPSB0aGlzLmVuZHBvaW50c1tpXTtcblxuXHRcdFx0XHQvLyBFYXJseSBleGl0IGZvciB0aGUgdmlzdWFsaXphdGlvbiB0byBzaG93IHRoZSBzd2VlcCBwcm9jZXNzXG5cdFx0XHRcdGlmIChwYXNzID09IDEgJiYgcC5hbmdsZSA+IG1heEFuZ2xlKSBicmVhaztcblxuXHRcdFx0XHR2YXIgY3VycmVudF9vbGQgPSBudWxsO1xuXHRcdFx0XHRpZiAodGhpcy5vcGVuLl9zaXplICE9PSAwKSB7XG5cdFx0XHRcdFx0Y3VycmVudF9vbGQgPSB0aGlzLm9wZW4uaGVhZC52YWw7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAocC5iZWdpbikge1xuXHRcdFx0XHRcdC8vIEluc2VydCBpbnRvIHRoZSByaWdodCBwbGFjZSBpbiB0aGUgbGlzdFxuXHRcdFx0XHRcdHZhciBub2RlID0gdGhpcy5vcGVuLmhlYWQ7XG5cdFx0XHRcdFx0Ly92YXIgbm9kZSA9IG9wZW5bMF07XG5cblx0XHRcdFx0XHRmb3IgKDsgbm9kZSAhPSBudWxsOyBub2RlID0gbm9kZS5uZXh0KSB7XG5cdFx0XHRcdFx0XHRpZiAoIXRoaXMuX3NlZ21lbnRfaW5fZnJvbnRfb2YocC5zZWdtZW50LCBub2RlLnZhbCwgdGhpcy5jZW50ZXIpKSB7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICghbm9kZSkge1xuXHRcdFx0XHRcdFx0dGhpcy5vcGVuLmFwcGVuZChwLnNlZ21lbnQpO1xuXHRcdFx0XHRcdC8vb3Blbi5wdXNoKHAuc2VnbWVudCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHRoaXMub3Blbi5pbnNlcnRCZWZvcmUobm9kZSwgcC5zZWdtZW50KTtcblx0XHRcdFx0XHRcdC8vb3Blbi5zcGxpY2Uob3Blbi5pbmRleE9mKG5vZGUpLCAwLCBwLnNlZ21lbnQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLm9wZW4ucmVtb3ZlKHAuc2VnbWVudCk7XG5cdFx0XHRcdFx0Ly9vcGVuLnNwbGljZShvcGVuLmluZGV4T2YocC5zZWdtZW50KSwgMSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR2YXIgY3VycmVudF9uZXcgPSBudWxsO1xuXHRcdFx0XHRpZiAodGhpcy5vcGVuLl9zaXplICE9PSAwKSB7XG5cdFx0XHRcdFx0Y3VycmVudF9uZXcgPSB0aGlzLm9wZW4uaGVhZC52YWw7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoY3VycmVudF9vbGQgIT0gY3VycmVudF9uZXcpIHtcblx0XHRcdFx0XHRpZiAocGFzcyA9PSAxKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmFkZFRyaWFuZ2xlKGJlZ2luQW5nbGUsIHAuYW5nbGUsIGN1cnJlbnRfb2xkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YmVnaW5BbmdsZSA9IHAuYW5nbGU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblxuXHQvKipcblx0ICogSGVscGVyOiBkbyB3ZSBrbm93IHRoYXQgc2VnbWVudCBhIGlzIGluIGZyb250IG9mIGI/XG5cdCAqIEltcGxlbWVudGF0aW9uIG5vdCBhbnRpLXN5bW1ldHJpYyAodGhhdCBpcyB0byBzYXksXG5cdCAqIF9zZWdtZW50X2luX2Zyb250X29mKGEsIGIpICE9ICghX3NlZ21lbnRfaW5fZnJvbnRfb2YoYiwgYSkpLlxuXHQgKiBBbHNvIG5vdGUgdGhhdCBpdCBvbmx5IGhhcyB0byB3b3JrIGluIGEgcmVzdHJpY3RlZCBzZXQgb2YgY2FzZXNcblx0ICogaW4gdGhlIHZpc2liaWxpdHkgYWxnb3JpdGhtOyBJIGRvbid0IHRoaW5rIGl0IGhhbmRsZXMgYWxsXG5cdCAqIGNhc2VzLiBTZWUgaHR0cDovL3d3dy5yZWRibG9iZ2FtZXMuY29tL2FydGljbGVzL3Zpc2liaWxpdHkvc2VnbWVudC1zb3J0aW5nLmh0bWxcblx0ICogQHBhcmFtIHtTZWdtZW50fSBhXG5cdCAqIEBwYXJhbSB7U2VnbWVudH0gYlxuXHQgKiBAcGFyYW0ge1BvaW50fSByZWxhdGl2ZVRvXG5cdCAqIEByZXR1cm4ge0Jvb2x9XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfc2VnbWVudF9pbl9mcm9udF9vZjogZnVuY3Rpb24oYSwgYiwgcmVsYXRpdmVUbykge1xuXHRcdHZhciBsZWZ0T2YgPSBWaXNpYmlsaXR5LmxlZnRPZjtcblx0XHR2YXIgaW50ZXJwb2xhdGUgPSBWaXNpYmlsaXR5LmludGVycG9sYXRlO1xuXG5cdFx0Ly8gTk9URTogd2Ugc2xpZ2h0bHkgc2hvcnRlbiB0aGUgc2VnbWVudHMgc28gdGhhdFxuXHRcdC8vIGludGVyc2VjdGlvbnMgb2YgdGhlIGVuZHBvaW50cyAoY29tbW9uKSBkb24ndCBjb3VudCBhc1xuXHRcdC8vIGludGVyc2VjdGlvbnMgaW4gdGhpcyBhbGdvcml0aG1cblx0XHR2YXIgQTEgPSBsZWZ0T2YoYSwgaW50ZXJwb2xhdGUoYi5wMSwgYi5wMiwgMC4wMSkpO1xuXHRcdHZhciBBMiA9IGxlZnRPZihhLCBpbnRlcnBvbGF0ZShiLnAyLCBiLnAxLCAwLjAxKSk7XG5cdFx0dmFyIEEzID0gbGVmdE9mKGEsIHJlbGF0aXZlVG8pO1xuXHRcdHZhciBCMSA9IGxlZnRPZihiLCBpbnRlcnBvbGF0ZShhLnAxLCBhLnAyLCAwLjAxKSk7XG5cdFx0dmFyIEIyID0gbGVmdE9mKGIsIGludGVycG9sYXRlKGEucDIsIGEucDEsIDAuMDEpKTtcblx0XHR2YXIgQjMgPSBsZWZ0T2YoYiwgcmVsYXRpdmVUbyk7XG5cblx0XHQvLyBOT1RFOiB0aGlzIGFsZ29yaXRobSBpcyBwcm9iYWJseSB3b3J0aHkgb2YgYSBzaG9ydCBhcnRpY2xlXG5cdFx0Ly8gYnV0IGZvciBub3csIGRyYXcgaXQgb24gcGFwZXIgdG8gc2VlIGhvdyBpdCB3b3Jrcy4gQ29uc2lkZXJcblx0XHQvLyB0aGUgbGluZSBBMS1BMi4gSWYgYm90aCBCMSBhbmQgQjIgYXJlIG9uIG9uZSBzaWRlIGFuZFxuXHRcdC8vIHJlbGF0aXZlVG8gaXMgb24gdGhlIG90aGVyIHNpZGUsIHRoZW4gQSBpcyBpbiBiZXR3ZWVuIHRoZVxuXHRcdC8vIHZpZXdlciBhbmQgQi4gV2UgY2FuIGRvIHRoZSBzYW1lIHdpdGggQjEtQjI6IGlmIEExIGFuZCBBMlxuXHRcdC8vIGFyZSBvbiBvbmUgc2lkZSwgYW5kIHJlbGF0aXZlVG8gaXMgb24gdGhlIG90aGVyIHNpZGUsIHRoZW5cblx0XHQvLyBCIGlzIGluIGJldHdlZW4gdGhlIHZpZXdlciBhbmQgQS5cblx0XHRpZiAoQjEgPT0gQjIgJiYgQjIgIT0gQjMpIHJldHVybiB0cnVlO1xuXHRcdGlmIChBMSA9PSBBMiAmJiBBMiA9PSBBMykgcmV0dXJuIHRydWU7XG5cdFx0aWYgKEExID09IEEyICYmIEEyICE9IEEzKSByZXR1cm4gZmFsc2U7XG5cdFx0aWYgKEIxID09IEIyICYmIEIyID09IEIzKSByZXR1cm4gZmFsc2U7XG5cblx0XHQvLyBJZiBBMSAhPSBBMiBhbmQgQjEgIT0gQjIgdGhlbiB3ZSBoYXZlIGFuIGludGVyc2VjdGlvbi5cblx0XHQvLyBFeHBvc2UgaXQgZm9yIHRoZSBHVUkgdG8gc2hvdyBhIG1lc3NhZ2UuIEEgbW9yZSByb2J1c3Rcblx0XHQvLyBpbXBsZW1lbnRhdGlvbiB3b3VsZCBzcGxpdCBzZWdtZW50cyBhdCBpbnRlcnNlY3Rpb25zIHNvXG5cdFx0Ly8gdGhhdCBwYXJ0IG9mIHRoZSBzZWdtZW50IGlzIGluIGZyb250IGFuZCBwYXJ0IGlzIGJlaGluZC5cblx0XHR0aGlzLmRlbW9faW50ZXJzZWN0aW9uc0RldGVjdGVkLnB1c2goW2EucDEsIGEucDIsIGIucDEsIGIucDJdKTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHQvLyBOT1RFOiBwcmV2aW91cyBpbXBsZW1lbnRhdGlvbiB3YXMgYS5kIDwgYi5kLiBUaGF0J3Mgc2ltcGxlclxuXHRcdC8vIGJ1dCB0cm91YmxlIHdoZW4gdGhlIHNlZ21lbnRzIGFyZSBvZiBkaXNzaW1pbGFyIHNpemVzLiBJZlxuXHRcdC8vIHlvdSdyZSBvbiBhIGdyaWQgYW5kIHRoZSBzZWdtZW50cyBhcmUgc2ltaWxhcmx5IHNpemVkLCB0aGVuXG5cdFx0Ly8gdXNpbmcgZGlzdGFuY2Ugd2lsbCBiZSBhIHNpbXBsZXIgYW5kIGZhc3RlciBpbXBsZW1lbnRhdGlvbi5cblx0fSxcblxuXG5cdC8qKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge0Zsb2F0fSBhbmdsZTFcblx0ICogQHBhcmFtIHtGbG9hdH0gYW5nbGUyXG5cdCAqIEBwYXJhbSB7U2VnbWVudH0gc2VnbWVudFxuXHQgKi9cblx0YWRkVHJpYW5nbGU6IGZ1bmN0aW9uKGFuZ2xlMSwgYW5nbGUyLCBzZWdtZW50KSB7XG5cdFx0dmFyIGNlbnRlciA9IHRoaXMuY2VudGVyO1xuXG5cdFx0dmFyIHAxID0gY2VudGVyO1xuXHRcdHZhciBwMiA9IG5ldyBQb2ludChjZW50ZXIueCArIE1hdGguY29zKGFuZ2xlMSksIGNlbnRlci55ICsgTWF0aC5zaW4oYW5nbGUxKSk7XG5cdFx0dmFyIHAzID0gbmV3IFBvaW50KDAuMCwgMC4wKTtcblx0XHR2YXIgcDQgPSBuZXcgUG9pbnQoMC4wLCAwLjApO1xuXG5cdFx0aWYgKHNlZ21lbnQgIT0gbnVsbCkge1xuXHRcdFx0Ly8gU3RvcCB0aGUgdHJpYW5nbGUgYXQgdGhlIGludGVyc2VjdGluZyBzZWdtZW50XG5cdFx0XHRwMy54ID0gc2VnbWVudC5wMS54O1xuXHRcdFx0cDMueSA9IHNlZ21lbnQucDEueTtcblx0XHRcdHA0LnggPSBzZWdtZW50LnAyLng7XG5cdFx0XHRwNC55ID0gc2VnbWVudC5wMi55O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBTdG9wIHRoZSB0cmlhbmdsZSBhdCBhIGZpeGVkIGRpc3RhbmNlOyB0aGlzIHByb2JhYmx5IGlzXG5cdFx0XHQvLyBub3Qgd2hhdCB3ZSB3YW50LCBidXQgaXQgbmV2ZXIgZ2V0cyB1c2VkIGluIHRoZSBkZW1vXG5cdFx0XHRwMy54ID0gY2VudGVyLnggKyBNYXRoLmNvcyhhbmdsZTEpICogNTAwO1xuXHRcdFx0cDMueSA9IGNlbnRlci55ICsgTWF0aC5zaW4oYW5nbGUxKSAqIDUwMDtcblx0XHRcdHA0LnggPSBjZW50ZXIueCArIE1hdGguY29zKGFuZ2xlMikgKiA1MDA7XG5cdFx0XHRwNC55ID0gY2VudGVyLnkgKyBNYXRoLnNpbihhbmdsZTIpICogNTAwO1xuXHRcdH1cblxuXHRcdHZhciBwQmVnaW4gPSB0aGlzLmxpbmVJbnRlcnNlY3Rpb24ocDMsIHA0LCBwMSwgcDIpO1xuXG5cdFx0cDIueCA9IGNlbnRlci54ICsgTWF0aC5jb3MoYW5nbGUyKTtcblx0XHRwMi55ID0gY2VudGVyLnkgKyBNYXRoLnNpbihhbmdsZTIpO1xuXHRcdHZhciBwRW5kID0gdGhpcy5saW5lSW50ZXJzZWN0aW9uKHAzLCBwNCwgcDEsIHAyKTtcblxuXHRcdHRoaXMub3V0cHV0LnB1c2gocEJlZ2luKTtcblx0XHR0aGlzLm91dHB1dC5wdXNoKHBFbmQpO1xuXHR9LFxuXG5cblx0LyoqXG5cdCAqIEBwdWJsaWNcblx0ICogQHBhcmFtIHtQb2ludH0gcDFcblx0ICogQHBhcmFtIHtQb2ludH0gcDJcblx0ICogQHBhcmFtIHtQb2ludH0gcDNcblx0ICogQHBhcmFtIHtQb2ludH0gcDRcblx0ICogQHJldHVybiB7UG9pbnR9XG5cdCAqL1xuXHRsaW5lSW50ZXJzZWN0aW9uOiBmdW5jdGlvbihwMSwgcDIsIHAzLCBwNCkge1xuXHRcdC8vIEZyb20gaHR0cDovL3BhdWxib3Vya2UubmV0L2dlb21ldHJ5L2xpbmVsaW5lMmQvXG5cdFx0dmFyIHMgPSAoKHA0LnggLSBwMy54KSAqIChwMS55IC0gcDMueSkgLSAocDQueSAtIHAzLnkpICogKHAxLnggLSBwMy54KSkgLyAoKHA0LnkgLSBwMy55KSAqIChwMi54IC0gcDEueCkgLSAocDQueCAtIHAzLngpICogKHAyLnkgLSBwMS55KSk7XG5cdFx0cmV0dXJuIG5ldyBQb2ludChwMS54ICsgcyAqIChwMi54IC0gcDEueCksIHAxLnkgKyBzICogKHAyLnkgLSBwMS55KSk7XG5cdH0sXG5cbn07XG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cbnZhciBkZV9wb2x5Z29uYWxfZHNfRExMID0gZnVuY3Rpb24ocmVzZXJ2ZWRTaXplLCBtYXhTaXplKSB7XG5cdGlmIChtYXhTaXplID09IG51bGwpIHtcblx0XHRtYXhTaXplID0gLTE7XG5cdH1cblx0aWYgKHJlc2VydmVkU2l6ZSA9PSBudWxsKSB7XG5cdFx0cmVzZXJ2ZWRTaXplID0gMDtcblx0fVxuXHR0aGlzLm1heFNpemUgPSAtMTtcblx0dGhpcy5fcmVzZXJ2ZWRTaXplID0gcmVzZXJ2ZWRTaXplO1xuXHR0aGlzLl9zaXplID0gMDtcblx0dGhpcy5fcG9vbFNpemUgPSAwO1xuXHR0aGlzLl9jaXJjdWxhciA9IGZhbHNlO1xuXHR0aGlzLl9pdGVyYXRvciA9IG51bGw7XG5cdGlmIChyZXNlcnZlZFNpemUgPiAwKSB7XG5cdFx0dGhpcy5faGVhZFBvb2wgPSB0aGlzLl90YWlsUG9vbCA9IG5ldyBkZV9wb2x5Z29uYWxfZHNfRExMTm9kZShudWxsLCB0aGlzKTtcblx0fVxuXHR0aGlzLmhlYWQgPSB0aGlzLnRhaWwgPSBudWxsO1xuXHR0aGlzLmtleSA9IGRlX3BvbHlnb25hbF9kc19IYXNoS2V5Ll9jb3VudGVyKys7XG5cdHRoaXMucmV1c2VJdGVyYXRvciA9IGZhbHNlO1xufTtcbmRlX3BvbHlnb25hbF9kc19ETEwucHJvdG90eXBlID0ge1xuXHRhcHBlbmQ6IGZ1bmN0aW9uKHgpIHtcblx0XHR2YXIgbm9kZSA9IHRoaXMuX2dldE5vZGUoeCk7XG5cdFx0aWYgKHRoaXMudGFpbCAhPSBudWxsKSB7XG5cdFx0XHR0aGlzLnRhaWwubmV4dCA9IG5vZGU7XG5cdFx0XHRub2RlLnByZXYgPSB0aGlzLnRhaWw7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuaGVhZCA9IG5vZGU7XG5cdFx0fVxuXHRcdHRoaXMudGFpbCA9IG5vZGU7XG5cdFx0aWYgKHRoaXMuX2NpcmN1bGFyKSB7XG5cdFx0XHR0aGlzLnRhaWwubmV4dCA9IHRoaXMuaGVhZDtcblx0XHRcdHRoaXMuaGVhZC5wcmV2ID0gdGhpcy50YWlsO1xuXHRcdH1cblx0XHR0aGlzLl9zaXplKys7XG5cdFx0cmV0dXJuIG5vZGU7XG5cdH0sXG5cdGluc2VydEJlZm9yZTogZnVuY3Rpb24obm9kZSwgeCkge1xuXHRcdHZhciB0ID0gdGhpcy5fZ2V0Tm9kZSh4KTtcblx0XHRub2RlLl9pbnNlcnRCZWZvcmUodCk7XG5cdFx0aWYgKG5vZGUgPT0gdGhpcy5oZWFkKSB7XG5cdFx0XHR0aGlzLmhlYWQgPSB0O1xuXHRcdFx0aWYgKHRoaXMuX2NpcmN1bGFyKSB7XG5cdFx0XHRcdHRoaXMuaGVhZC5wcmV2ID0gdGhpcy50YWlsO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLl9zaXplKys7XG5cdFx0cmV0dXJuIHQ7XG5cdH0sXG5cdHVubGluazogZnVuY3Rpb24obm9kZSkge1xuXHRcdHZhciBob29rID0gbm9kZS5uZXh0O1xuXHRcdGlmIChub2RlID09IHRoaXMuaGVhZCkge1xuXHRcdFx0dGhpcy5oZWFkID0gdGhpcy5oZWFkLm5leHQ7XG5cdFx0XHRpZiAodGhpcy5fY2lyY3VsYXIpIHtcblx0XHRcdFx0aWYgKHRoaXMuaGVhZCA9PSB0aGlzLnRhaWwpIHtcblx0XHRcdFx0XHR0aGlzLmhlYWQgPSBudWxsO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMudGFpbC5uZXh0ID0gdGhpcy5oZWFkO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAodGhpcy5oZWFkID09IG51bGwpIHtcblx0XHRcdFx0dGhpcy50YWlsID0gbnVsbDtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKG5vZGUgPT0gdGhpcy50YWlsKSB7XG5cdFx0XHR0aGlzLnRhaWwgPSB0aGlzLnRhaWwucHJldjtcblx0XHRcdGlmICh0aGlzLl9jaXJjdWxhcikge1xuXHRcdFx0XHR0aGlzLmhlYWQucHJldiA9IHRoaXMudGFpbDtcblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLnRhaWwgPT0gbnVsbCkge1xuXHRcdFx0XHR0aGlzLmhlYWQgPSBudWxsO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRub2RlLl91bmxpbmsoKTtcblx0XHR0aGlzLl9wdXROb2RlKG5vZGUpO1xuXHRcdHRoaXMuX3NpemUtLTtcblx0XHRyZXR1cm4gaG9vaztcblx0fSxcblx0c29ydDogZnVuY3Rpb24oY29tcGFyZSwgdXNlSW5zZXJ0aW9uU29ydCkge1xuXHRcdGlmICh1c2VJbnNlcnRpb25Tb3J0ID09IG51bGwpIHtcblx0XHRcdHVzZUluc2VydGlvblNvcnQgPSBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKHRoaXMuX3NpemUgPiAxKSB7XG5cdFx0XHRpZiAodGhpcy5fY2lyY3VsYXIpIHtcblx0XHRcdFx0dGhpcy50YWlsLm5leHQgPSBudWxsO1xuXHRcdFx0XHR0aGlzLmhlYWQucHJldiA9IG51bGw7XG5cdFx0XHR9XG5cdFx0XHRpZiAoY29tcGFyZSA9PSBudWxsKVxuXHRcdFx0XHRpZiAodXNlSW5zZXJ0aW9uU29ydCkge1xuXHRcdFx0XHRcdHRoaXMuaGVhZCA9IHRoaXMuX2luc2VydGlvblNvcnRDb21wYXJhYmxlKHRoaXMuaGVhZCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5oZWFkID0gdGhpcy5fbWVyZ2VTb3J0Q29tcGFyYWJsZSh0aGlzLmhlYWQpO1xuXHRcdFx0fWVsc2UgaWYgKHVzZUluc2VydGlvblNvcnQpIHtcblx0XHRcdFx0dGhpcy5oZWFkID0gdGhpcy5faW5zZXJ0aW9uU29ydCh0aGlzLmhlYWQsIGNvbXBhcmUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5oZWFkID0gdGhpcy5fbWVyZ2VTb3J0KHRoaXMuaGVhZCwgY29tcGFyZSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAodGhpcy5fY2lyY3VsYXIpIHtcblx0XHRcdFx0dGhpcy50YWlsLm5leHQgPSB0aGlzLmhlYWQ7XG5cdFx0XHRcdHRoaXMuaGVhZC5wcmV2ID0gdGhpcy50YWlsO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0cmVtb3ZlOiBmdW5jdGlvbih4KSB7XG5cdFx0dmFyIHMgPSB0aGlzLl9zaXplO1xuXHRcdGlmIChzID09IDApIHJldHVybiBmYWxzZTtcblx0XHR2YXIgbm9kZSA9IHRoaXMuaGVhZDtcblx0XHR3aGlsZSAobm9kZSAhPSBudWxsKVxuXHRcdGlmIChub2RlLnZhbCA9PSB4KSB7XG5cdFx0XHRcdG5vZGUgPSB0aGlzLnVubGluayhub2RlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG5vZGUgPSBub2RlLm5leHQ7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl9zaXplIDwgcztcblx0fSxcblx0Y2xlYXI6IGZ1bmN0aW9uKHB1cmdlKSB7XG5cdFx0aWYgKHB1cmdlID09IG51bGwpIHtcblx0XHRcdHB1cmdlID0gZmFsc2U7XG5cdFx0fVxuXHRcdGlmIChwdXJnZSB8fCB0aGlzLl9yZXNlcnZlZFNpemUgPiAwKSB7XG5cdFx0XHR2YXIgbm9kZSA9IHRoaXMuaGVhZDtcblx0XHRcdHZhciBfZzEgPSAwO1xuXHRcdFx0dmFyIF9nID0gdGhpcy5fc2l6ZTtcblx0XHRcdHdoaWxlIChfZzEgPCBfZykge1xuXHRcdFx0XHR2YXIgaSA9IF9nMSsrO1xuXHRcdFx0XHR2YXIgbmV4dCA9IG5vZGUubmV4dDtcblx0XHRcdFx0bm9kZS5wcmV2ID0gbnVsbDtcblx0XHRcdFx0bm9kZS5uZXh0ID0gbnVsbDtcblx0XHRcdFx0dGhpcy5fcHV0Tm9kZShub2RlKTtcblx0XHRcdFx0bm9kZSA9IG5leHQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRoaXMuaGVhZCA9IHRoaXMudGFpbCA9IG51bGw7XG5cdFx0dGhpcy5fc2l6ZSA9IDA7XG5cdH0sXG5cdGl0ZXJhdG9yOiBmdW5jdGlvbigpIHtcblx0XHRpZiAodGhpcy5yZXVzZUl0ZXJhdG9yKSB7XG5cdFx0XHRpZiAodGhpcy5faXRlcmF0b3IgPT0gbnVsbCkge1xuXHRcdFx0XHRpZiAodGhpcy5fY2lyY3VsYXIpIHJldHVybiBuZXcgZGVfcG9seWdvbmFsX2RzX0NpcmN1bGFyRExMSXRlcmF0b3IodGhpcyk7IGVsc2UgcmV0dXJuIG5ldyBkZV9wb2x5Z29uYWxfZHNfRExMSXRlcmF0b3IodGhpcyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLl9pdGVyYXRvci5yZXNldCgpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRoaXMuX2l0ZXJhdG9yO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5fY2lyY3VsYXIpIHJldHVybiBuZXcgZGVfcG9seWdvbmFsX2RzX0NpcmN1bGFyRExMSXRlcmF0b3IodGhpcyk7IGVsc2UgcmV0dXJuIG5ldyBkZV9wb2x5Z29uYWxfZHNfRExMSXRlcmF0b3IodGhpcyk7XG5cdH0sXG5cdHRvQXJyYXk6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBhID0gbmV3IEFycmF5KHRoaXMuX3NpemUpO1xuXHRcdHZhciBub2RlID0gdGhpcy5oZWFkO1xuXHRcdHZhciBfZzEgPSAwO1xuXHRcdHZhciBfZyA9IHRoaXMuX3NpemU7XG5cdFx0d2hpbGUgKF9nMSA8IF9nKSB7XG5cdFx0XHR2YXIgaSA9IF9nMSsrO1xuXHRcdFx0YVtpXSA9IG5vZGUudmFsO1xuXHRcdFx0bm9kZSA9IG5vZGUubmV4dDtcblx0XHR9XG5cdFx0cmV0dXJuIGE7XG5cdH0sXG5cdF9tZXJnZVNvcnQ6IGZ1bmN0aW9uKG5vZGUsIGNtcCkge1xuXHRcdHZhciBoID0gbm9kZTtcblx0XHR2YXIgcDtcblx0XHR2YXIgcTtcblx0XHR2YXIgZTtcblx0XHR2YXIgdGFpbCA9IG51bGw7XG5cdFx0dmFyIGluc2l6ZSA9IDE7XG5cdFx0dmFyIG5tZXJnZXM7XG5cdFx0dmFyIHBzaXplO1xuXHRcdHZhciBxc2l6ZTtcblx0XHR2YXIgaTtcblx0XHR3aGlsZSAodHJ1ZSkge1xuXHRcdFx0cCA9IGg7XG5cdFx0XHRoID0gdGFpbCA9IG51bGw7XG5cdFx0XHRubWVyZ2VzID0gMDtcblx0XHRcdHdoaWxlIChwICE9IG51bGwpIHtcblx0XHRcdFx0bm1lcmdlcysrO1xuXHRcdFx0XHRwc2l6ZSA9IDA7XG5cdFx0XHRcdHEgPSBwO1xuXHRcdFx0XHR2YXIgX2cgPSAwO1xuXHRcdFx0XHR3aGlsZSAoX2cgPCBpbnNpemUpIHtcblx0XHRcdFx0XHR2YXIgaTEgPSBfZysrO1xuXHRcdFx0XHRcdHBzaXplKys7XG5cdFx0XHRcdFx0cSA9IHEubmV4dDtcblx0XHRcdFx0XHRpZiAocSA9PSBudWxsKSBicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0XHRxc2l6ZSA9IGluc2l6ZTtcblx0XHRcdFx0d2hpbGUgKHBzaXplID4gMCB8fCBxc2l6ZSA+IDAgJiYgcSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0aWYgKHBzaXplID09IDApIHtcblx0XHRcdFx0XHRcdGUgPSBxO1xuXHRcdFx0XHRcdFx0cSA9IHEubmV4dDtcblx0XHRcdFx0XHRcdHFzaXplLS07XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChxc2l6ZSA9PSAwIHx8IHEgPT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0ZSA9IHA7XG5cdFx0XHRcdFx0XHRwID0gcC5uZXh0O1xuXHRcdFx0XHRcdFx0cHNpemUtLTtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKGNtcChxLnZhbCwgcC52YWwpID49IDApIHtcblx0XHRcdFx0XHRcdGUgPSBwO1xuXHRcdFx0XHRcdFx0cCA9IHAubmV4dDtcblx0XHRcdFx0XHRcdHBzaXplLS07XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGUgPSBxO1xuXHRcdFx0XHRcdFx0cSA9IHEubmV4dDtcblx0XHRcdFx0XHRcdHFzaXplLS07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmICh0YWlsICE9IG51bGwpIHtcblx0XHRcdFx0XHRcdHRhaWwubmV4dCA9IGU7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGggPSBlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlLnByZXYgPSB0YWlsO1xuXHRcdFx0XHRcdHRhaWwgPSBlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHAgPSBxO1xuXHRcdFx0fVxuXHRcdFx0dGFpbC5uZXh0ID0gbnVsbDtcblx0XHRcdGlmIChubWVyZ2VzIDw9IDEpIGJyZWFrO1xuXHRcdFx0aW5zaXplIDw8PSAxO1xuXHRcdH1cblx0XHRoLnByZXYgPSBudWxsO1xuXHRcdHRoaXMudGFpbCA9IHRhaWw7XG5cdFx0cmV0dXJuIGg7XG5cdH0sXG5cdF9pbnNlcnRpb25Tb3J0OiBmdW5jdGlvbihub2RlLCBjbXApIHtcblx0XHR2YXIgaCA9IG5vZGU7XG5cdFx0dmFyIG4gPSBoLm5leHQ7XG5cdFx0d2hpbGUgKG4gIT0gbnVsbCkge1xuXHRcdFx0dmFyIG0gPSBuLm5leHQ7XG5cdFx0XHR2YXIgcCA9IG4ucHJldjtcblx0XHRcdHZhciB2ID0gbi52YWw7XG5cdFx0XHRpZiAoY21wKHYsIHAudmFsKSA8IDApIHtcblx0XHRcdFx0dmFyIGkgPSBwO1xuXHRcdFx0XHR3aGlsZSAoaS5wcmV2ICE9IG51bGwpXG5cdFx0XHRcdGlmIChjbXAodiwgaS5wcmV2LnZhbCkgPCAwKSB7XG5cdFx0XHRcdFx0XHRpID0gaS5wcmV2O1xuXHRcdFx0XHRcdH0gZWxzZSBicmVhaztcblx0XHRcdFx0aWYgKG0gIT0gbnVsbCkge1xuXHRcdFx0XHRcdHAubmV4dCA9IG07XG5cdFx0XHRcdFx0bS5wcmV2ID0gcDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRwLm5leHQgPSBudWxsO1xuXHRcdFx0XHRcdHRoaXMudGFpbCA9IHA7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGkgPT0gaCkge1xuXHRcdFx0XHRcdG4ucHJldiA9IG51bGw7XG5cdFx0XHRcdFx0bi5uZXh0ID0gaTtcblx0XHRcdFx0XHRpLnByZXYgPSBuO1xuXHRcdFx0XHRcdGggPSBuO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG4ucHJldiA9IGkucHJldjtcblx0XHRcdFx0XHRpLnByZXYubmV4dCA9IG47XG5cdFx0XHRcdFx0bi5uZXh0ID0gaTtcblx0XHRcdFx0XHRpLnByZXYgPSBuO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRuID0gbTtcblx0XHR9XG5cdFx0cmV0dXJuIGg7XG5cdH0sXG5cdF9nZXROb2RlOiBmdW5jdGlvbih4KSB7XG5cdFx0aWYgKHRoaXMuX3Jlc2VydmVkU2l6ZSA9PSAwIHx8IHRoaXMuX3Bvb2xTaXplID09IDApIHJldHVybiBuZXcgZGVfcG9seWdvbmFsX2RzX0RMTE5vZGUoeCwgdGhpcyk7IGVsc2Uge1xuXHRcdFx0dmFyIG4gPSB0aGlzLl9oZWFkUG9vbDtcblx0XHRcdHRoaXMuX2hlYWRQb29sID0gdGhpcy5faGVhZFBvb2wubmV4dDtcblx0XHRcdHRoaXMuX3Bvb2xTaXplLS07XG5cdFx0XHRuLm5leHQgPSBudWxsO1xuXHRcdFx0bi52YWwgPSB4O1xuXHRcdFx0cmV0dXJuIG47XG5cdFx0fVxuXHR9LFxuXHRfcHV0Tm9kZTogZnVuY3Rpb24oeCkge1xuXHRcdHZhciB2YWwgPSB4LnZhbDtcblx0XHRpZiAodGhpcy5fcmVzZXJ2ZWRTaXplID4gMCAmJiB0aGlzLl9wb29sU2l6ZSA8IHRoaXMuX3Jlc2VydmVkU2l6ZSkge1xuXHRcdFx0dGhpcy5fdGFpbFBvb2wgPSB0aGlzLl90YWlsUG9vbC5uZXh0ID0geDtcblx0XHRcdHgudmFsID0gbnVsbDtcblx0XHRcdHRoaXMuX3Bvb2xTaXplKys7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHguX2xpc3QgPSBudWxsO1xuXHRcdH1cblx0XHRyZXR1cm4gdmFsO1xuXHR9LFxuXHRfX2NsYXNzX186IGRlX3BvbHlnb25hbF9kc19ETExcbn07XG5cbnZhciBkZV9wb2x5Z29uYWxfZHNfRExMSXRlcmF0b3IgPSBmdW5jdGlvbihmKSB7XG5cdHRoaXMuX2YgPSBmO3tcblx0dGhpcy5fd2Fsa2VyID0gdGhpcy5fZi5oZWFkO1xuXHR0aGlzLl9ob29rID0gbnVsbDtcblx0dGhpcztcblx0fVxufTtcbmRlX3BvbHlnb25hbF9kc19ETExJdGVyYXRvci5wcm90b3R5cGUgPSB7XG5cdHJlc2V0OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLl93YWxrZXIgPSB0aGlzLl9mLmhlYWQ7XG5cdFx0dGhpcy5faG9vayA9IG51bGw7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdGhhc05leHQ6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLl93YWxrZXIgIT0gbnVsbDtcblx0fSxcblx0bmV4dDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHggPSB0aGlzLl93YWxrZXIudmFsO1xuXHRcdHRoaXMuX2hvb2sgPSB0aGlzLl93YWxrZXI7XG5cdFx0dGhpcy5fd2Fsa2VyID0gdGhpcy5fd2Fsa2VyLm5leHQ7XG5cdFx0cmV0dXJuIHg7XG5cdH0sXG5cdF9fY2xhc3NfXzogZGVfcG9seWdvbmFsX2RzX0RMTEl0ZXJhdG9yXG59O1xuXG52YXIgZGVfcG9seWdvbmFsX2RzX0NpcmN1bGFyRExMSXRlcmF0b3IgPSBmdW5jdGlvbihmKSB7XG5cdHRoaXMuX2YgPSBmO3tcblx0dGhpcy5fd2Fsa2VyID0gdGhpcy5fZi5oZWFkO1xuXHR0aGlzLl9zID0gdGhpcy5fZi5fc2l6ZTtcblx0dGhpcy5faSA9IDA7XG5cdHRoaXMuX2hvb2sgPSBudWxsO1xuXHR0aGlzO1xuXHR9XG59O1xuZGVfcG9seWdvbmFsX2RzX0NpcmN1bGFyRExMSXRlcmF0b3IucHJvdG90eXBlID0ge1xuXHRyZXNldDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5fd2Fsa2VyID0gdGhpcy5fZi5oZWFkO1xuXHRcdHRoaXMuX3MgPSB0aGlzLl9mLl9zaXplO1xuXHRcdHRoaXMuX2kgPSAwO1xuXHRcdHRoaXMuX2hvb2sgPSBudWxsO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHRoYXNOZXh0OiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5faSA8IHRoaXMuX3M7XG5cdH0sXG5cdG5leHQ6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciB4ID0gdGhpcy5fd2Fsa2VyLnZhbDtcblx0XHR0aGlzLl9ob29rID0gdGhpcy5fd2Fsa2VyO1xuXHRcdHRoaXMuX3dhbGtlciA9IHRoaXMuX3dhbGtlci5uZXh0O1xuXHRcdHRoaXMuX2krKztcblx0XHRyZXR1cm4geDtcblx0fSxcblx0X19jbGFzc19fOiBkZV9wb2x5Z29uYWxfZHNfQ2lyY3VsYXJETExJdGVyYXRvclxufTtcblxudmFyIGRlX3BvbHlnb25hbF9kc19ETExOb2RlID0gZnVuY3Rpb24oeCwgbGlzdCkge1xuXHR0aGlzLnZhbCA9IHg7XG5cdHRoaXMuX2xpc3QgPSBsaXN0O1xufTtcbmRlX3BvbHlnb25hbF9kc19ETExOb2RlLnByb3RvdHlwZSA9IHtcblx0X3VubGluazogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHQgPSB0aGlzLm5leHQ7XG5cdFx0aWYgKHRoaXMucHJldiAhPSBudWxsKSB7XG5cdFx0XHR0aGlzLnByZXYubmV4dCA9IHRoaXMubmV4dDtcblx0XHR9XG5cdFx0aWYgKHRoaXMubmV4dCAhPSBudWxsKSB7XG5cdFx0XHR0aGlzLm5leHQucHJldiA9IHRoaXMucHJldjtcblx0XHR9XG5cdFx0dGhpcy5uZXh0ID0gdGhpcy5wcmV2ID0gbnVsbDtcblx0XHRyZXR1cm4gdDtcblx0fSxcblx0X2luc2VydEFmdGVyOiBmdW5jdGlvbihub2RlKSB7XG5cdFx0bm9kZS5uZXh0ID0gdGhpcy5uZXh0O1xuXHRcdG5vZGUucHJldiA9IHRoaXM7XG5cdFx0aWYgKHRoaXMubmV4dCAhPSBudWxsKSB7XG5cdFx0XHR0aGlzLm5leHQucHJldiA9IG5vZGU7XG5cdFx0fVxuXHRcdHRoaXMubmV4dCA9IG5vZGU7XG5cdH0sXG5cdF9pbnNlcnRCZWZvcmU6IGZ1bmN0aW9uKG5vZGUpIHtcblx0XHRub2RlLm5leHQgPSB0aGlzO1xuXHRcdG5vZGUucHJldiA9IHRoaXMucHJldjtcblx0XHRpZiAodGhpcy5wcmV2ICE9IG51bGwpIHtcblx0XHRcdHRoaXMucHJldi5uZXh0ID0gbm9kZTtcblx0XHR9XG5cdFx0dGhpcy5wcmV2ID0gbm9kZTtcblx0fSxcblx0X19jbGFzc19fOiBkZV9wb2x5Z29uYWxfZHNfRExMTm9kZVxufTtcblxuXG52YXIgZGVfcG9seWdvbmFsX2RzX0hhc2hLZXkgPSBmdW5jdGlvbigpIHt9O1xuZGVfcG9seWdvbmFsX2RzX0hhc2hLZXkuX2NvdW50ZXIgPSAwO1xuIl19
