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


	var bunny = PIXI.Sprite.fromImage('box_diff02.png');
	bunny.x = bunny.y = 160;
	bunny.scale.x = bunny.scale.y = 1;
	bunny.normalMap = PIXI.Texture.fromImage('box_norm02.png');

	container.addChild(bunny);


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

		bunny.rotation += 0.01;



		if (container.diff.shader) {
			//this.boxContainer.sp2.shader.uniforms.LightPos.value[0] = this.light.light.x / this.res;
			//this.boxContainer.sp2.shader.uniforms.LightPos.value[1] = this.light.light.y / this.res;
			container.diff.shader.uniforms.LightPos.value[0] = cx;
			container.diff.shader.uniforms.LightPos.value[1] = cy;
		}

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

		/*var b = bunny.getBounds();
		c.beginFill(0x00ffcc);
		c.drawRect(b.x, b.y, b.width, b.height);
		c.endFill();
		*/
		container.loadMap(mazeWalls, [bunny.getBounds()])

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
			value: [1, 1, .1]
		}
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
		"varying vec2 vTextureCoord;",
		"varying vec4 vColor;",
		"uniform sampler2D uSampler;",
		"uniform sampler2D displacementMap;",
		"uniform vec4 dimensions;",
		"const vec2 Resolution = vec2(1.0,1.0);",
		"uniform vec3 LightPos;",
		"const vec4 LightColor = vec4(0.9, 241.0/255.0, 224.0/255.0, 1.0);",
		"const vec4 AmbientColor = vec4(0.9, 241.0/255.0, 224.0/255.0, 0.3);",
		"const vec3 Falloff = vec3(0.0, 0.1, 0.4);",
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
		"    vec3 LightDir = vec3((LightPos.xy/mapDimensions) - (vTextureCoord.xy), LightPos.z);",
		"    float D = length(LightDir);",
		"    vec3 N = normalize(NormalMap * 2.0 - 1.0);",
		"    vec3 L = normalize(LightDir);",
		"    vec3 Diffuse = (LightColor.rgb * LightColor.a) * max(dot(N, L), 0.0) * 1.0;",
		"    vec3 Ambient = AmbientColor.rgb * AmbientColor.a;",
		"    float Attenuation = 0.2/D;",
		"    Attenuation = min(Attenuation, 1.0);",
		"    vec3 Intensity = (Diffuse * Attenuation) + Ambient;",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZW1vLnNyYy5qcyIsImluZGV4LmpzIiwic3JjL0RpZmZ1c2VTaGFkZXIuanMiLCJzcmMvTGlnaHRDb250YWluZXIuanMiLCJzcmMvTGlnaHRTaGFkZXIuanMiLCJzcmMvTGlnaHRTcHJpdGVCYXRjaC5qcyIsInNyYy9Ob3JtYWxNYXBGaWx0ZXIuanMiLCJzcmMvdmlzaWJpbGl0eS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE5BO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIExpZ2h0Q29udGFpbmVyID0gcmVxdWlyZSgnLicpO1xuXG52YXIgc3RhdHMgPSBuZXcgU3RhdHMoKTtcblxuc3RhdHMuc2V0TW9kZSgwKTtcbnN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5yaWdodCA9ICcwcHgnO1xuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4JztcblxuXG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHN0YXRzLmRvbUVsZW1lbnQpO1xuXG52YXIgc3RhZ2UgPSBuZXcgUElYSS5TdGFnZSggLyoweDY2RkY5OSovICk7XG52YXIgcmVuZGVyZXIgPSBQSVhJLmF1dG9EZXRlY3RSZW5kZXJlcih3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0LCB7XG5cdC8vIHZpZXc6IC4uLixcblx0dHJhbnNwYXJlbnQ6IGZhbHNlLFxuXHRhbnRpYWxpYXM6IHRydWUsXG5cdHByZXNlcnZlZERyYXdpbmdCdWZmZXI6IGZhbHNlLFxuXHRyZXNvbHV0aW9uOiAxLFxufSk7XG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHJlbmRlcmVyLnZpZXcpO1xuXG5cbnZhciBtYXplV2FsbHMgPSBbXG5cdC8vIEhvcml6b250YWwgd2FsbHNcblx0WzIwLCA2MCwgNjAsIDYwXSwgWzYwLCA2MCwgMTAwLCA2MF0sIFsxMDAsIDYwLCAxNDAsIDYwXSwgWzE0MCwgNjAsIDE4MCwgNjBdLFxuXHRbNjAsIDEwMCwgMTAwLCAxMDBdLCBbMTAwLCAxMDAsIDE0MCwgMTAwXSxcblx0WzI2MCwgMTAwLCAzMDAsIDEwMF0sIFszMDAsIDEwMCwgMzQwLCAxMDBdLFxuXHRbMTQwLCAxNDAsIDE4MCwgMTQwXSwgWzE4MCwgMTQwLCAyMjAsIDE0MF0sXG5cdFszMDAsIDE0MCwgMzQwLCAxNDBdLCBbMzQwLCAxNDAsIDM4MCwgMTQwXSxcblx0WzE0MCwgMjYwLCAxODAsIDI2MF0sIFsxODAsIDI2MCwgMjIwLCAyNjBdLFxuXHRbMjE1LCAyNDAsIDIyNSwgMjQwXSwgWzI2MCwgMjIwLCAyNzUsIDIyMF0sXG5cdC8vIFZlcnRpY2FsIHdhbGxzXG5cdFszMDAsIDIwLCAzMDAsIDYwXSxcblx0WzE4MCwgNjAsIDE4MCwgMTAwXSwgWzE4MCwgMTAwLCAxODAsIDE0MF0sXG5cdFsyNjAsIDYwLCAyNjAsIDEwMF0sIFszNDAsIDYwLCAzNDAsIDEwMF0sXG5cdFsxODAsIDE0MCwgMTgwLCAxODBdLCBbMTgwLCAxODAsIDE4MCwgMjIwXSxcblx0WzI2MCwgMTQwLCAyNjAsIDE4MF0sIFsyNjAsIDE4MCwgMjYwLCAyMjBdLFxuXHRbMTQwLCAyMjAsIDE0MCwgMjYwXSwgWzE0MCwgMjYwLCAxNDAsIDMwMF0sIFsxNDAsIDMwMCwgMTQwLCAzNDBdLFxuXHRbMjIwLCAyNDAsIDIyMCwgMjYwXSwgWzIyMCwgMzQwLCAyMjAsIDM4MF0sXG5cdC8vIFdhbGwgd2l0aCBob2xlc1xuXHRbMjIwLCAyNjAsIDIyMCwgMjY4XSwgWzIyMCwgMjcwLCAyMjAsIDI3OF0sIFsyMjAsIDI4MCwgMjIwLCAyODhdLFxuXHRbMjIwLCAyOTAsIDIyMCwgMjk4XSwgWzIyMCwgMzAwLCAyMjAsIDMwOF0sIFsyMjAsIDMxMCwgMjIwLCAzMThdLFxuXHRbMjIwLCAzMjAsIDIyMCwgMzI4XSwgWzIyMCwgMzMwLCAyMjAsIDMzOF0sXG5cdC8vIFBpbGxhcnNcblx0WzIxMCwgNzAsIDIzMCwgNzBdLCBbMjMwLCA3MCwgMjMwLCA5MF0sIFsyMzAsIDkwLCAyMjIsIDkwXSwgWzIxOCwgOTAsIDIxMCwgOTBdLCBbMjEwLCA5MCwgMjEwLCA3MF0sXG5cdFs1MSwgMjQwLCA2MCwgMjMxXSwgWzYwLCAyMzEsIDY5LCAyNDBdLCBbNjksIDI0MCwgNjAsIDI0OV0sIFs2MCwgMjQ5LCA1MSwgMjQwXSxcblx0Ly8gQ3VydmVzXG5cdFsyMCwgMTQwLCA1MCwgMTQwXSwgWzUwLCAxNDAsIDgwLCAxNTBdLCBbODAsIDE1MCwgOTUsIDE4MF0sIFs5NSwgMTgwLCAxMDAsIDIyMF0sXG5cdFsxMDAsIDIyMCwgMTAwLCAyNjBdLCBbMTAwLCAyNjAsIDk1LCAzMDBdLCBbOTUsIDMwMCwgODAsIDMzMF0sXG5cdFszMDAsIDE4MCwgMzIwLCAyMjBdLCBbMzIwLCAyMjAsIDMyMCwgMjQwXSwgWzMyMCwgMjQwLCAzMTAsIDI2MF0sXG5cdFszMTAsIDI2MCwgMzA1LCAyNzVdLCBbMzA1LCAyNzUsIDMwMCwgMzAwXSwgWzMwMCwgMzAwLCAzMDAsIDMxMF0sXG5cdFszMDAsIDMxMCwgMzA1LCAzMzBdLCBbMzA1LCAzMzAsIDMzMCwgMzUwXSwgWzMzMCwgMzUwLCAzNjAsIDM2MF0sXG5dO1xuXG52YXIgbWF6ZUxpZ2h0cyA9IFtcblx0Ly8gdG9wIGhhbGx3YXlcblx0WzQwLCA1OV0sIFs4MCwgMjFdLCBbMTIwLCA1OV0sIFsxNjAsIDIxXSxcblx0WzI5NywgMjNdLCBbMzAzLCAyM10sIFszNzcsIDIzXSxcblx0WzI2MywgOTddLCBbMzM3LCA5N10sXG5cdC8vIHVwcGVyIGxlZnQgcm9vbVxuXHRbMjMsIDYzXSwgWzE3NywgNjNdLCBbMjMsIDEzN10sIFsxNzcsIDEzN10sXG5cdC8vIHJvdW5kIHJvb20gb24gbGVmdFxuXHRbNDUsIDIzNV0sIFs0NSwgMjQwXSwgWzQ1LCAyNDVdLFxuXHQvLyB1cHBlciBwaWxsYXJcblx0WzIyMCwgODBdLFxuXHQvLyBoYWxsd2F5IG9uIGxlZnRcblx0WzEyMCwgMjgwXSxcblx0Ly8gbmV4dCB0byB3YWxsIG5vdGNoXG5cdFsyMTcsIDI0M10sXG5cdC8vIGluc2lkZSByb29tIHdpdGggaG9sZXNcblx0WzE4MCwgMjkwXSwgWzE4MCwgMzIwXSwgWzE4MCwgMzUwXSxcblx0Ly8gcmlnaHQgY3VydmVkIHJvb21cblx0WzMyMCwgMzIwXSxcblx0Ly8gcmlnaHQgaGFsbHdheVxuXHRbMjcwLCAxNzBdLFxuXTtcblxuZm9yICh2YXIgaSA9IDAsIGwgPSBtYXplTGlnaHRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuXHR2YXIgY29sb3IgPSBNYXRoLnJhbmRvbSgpICogMHhmZmZmZmY7XG5cdG1hemVMaWdodHNbaV0ucHVzaChjb2xvciB8IDApO1xufVxuXG52YXIgY29udGFpbmVyID0gbmV3IExpZ2h0Q29udGFpbmVyKCk7XG5zdGFnZS5hZGRDaGlsZChjb250YWluZXIuZ3JhcGhpY3MpO1xuc3RhZ2UuYWRkQ2hpbGQoY29udGFpbmVyLm5vcm0pO1xuc3RhZ2UuYWRkQ2hpbGQoY29udGFpbmVyLmRpZmYpO1xuc3RhZ2UuYWRkQ2hpbGQoY29udGFpbmVyKTtcblxuY29udGFpbmVyLmxvYWRNYXAobWF6ZVdhbGxzKTtcblxudmFyIGFzc2V0c1RvTG9hZGVyID0gWydwcmVzZW50Q29sb3Vycy5qc29uJywgJ3ByZXNlbnROb3JtYWxzLmpzb24nLCAnY291Y2guanBnJywgJ2NvdW5jaF9ub3JtLmpwZyddO1xudmFyIGxvYWRlciA9IG5ldyBQSVhJLkFzc2V0TG9hZGVyKGFzc2V0c1RvTG9hZGVyKTtcbmxvYWRlci5vbkNvbXBsZXRlID0gb25Bc3NldHNMb2FkZWQ7XG5sb2FkZXIubG9hZCgpO1xuXG5mdW5jdGlvbiBvbkFzc2V0c0xvYWRlZCgpIHtcblxuXG5cdHZhciBidW5ueSA9IFBJWEkuU3ByaXRlLmZyb21JbWFnZSgnYm94X2RpZmYwMi5wbmcnKTtcblx0YnVubnkueCA9IGJ1bm55LnkgPSAxNjA7XG5cdGJ1bm55LnNjYWxlLnggPSBidW5ueS5zY2FsZS55ID0gMTtcblx0YnVubnkubm9ybWFsTWFwID0gUElYSS5UZXh0dXJlLmZyb21JbWFnZSgnYm94X25vcm0wMi5wbmcnKTtcblxuXHRjb250YWluZXIuYWRkQ2hpbGQoYnVubnkpO1xuXG5cblx0dmFyIGN4ID0gMjAwLFxuXHRcdGN5ID0gMjAwLFxuXHRcdHZpc2liaWxpdHkgPSBjb250YWluZXIudmlzaWJpbGl0eSxcblx0XHRjID0gY29udGFpbmVyLmdyYXBoaWNzO1xuXG5cdHJlbmRlcmVyLnZpZXcuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRjeCA9IGV2ZW50LmNsaWVudFg7XG5cdFx0Y3kgPSBldmVudC5jbGllbnRZO1xuXHR9KTtcblxuXHQvKlxuXHQgICBVc2FnZTpcblx0ICAgICAgbmV3IFZpc2liaWxpdHkoKVxuXHQgICBXaGVuZXZlciBtYXAgZGF0YSBjaGFuZ2VzOlxuXHQgICAgICBsb2FkTWFwXG5cdCAgIFdoZW5ldmVyIGxpZ2h0IHNvdXJjZSBjaGFuZ2VzOlxuXHQgICAgICBzZXRMaWdodExvY2F0aW9uXG5cdCAgIFRvIGNhbGN1bGF0ZSB0aGUgYXJlYTpcblx0ICAgICAgc3dlZXBcblx0XHQgICovXG5cblxuXHRyZXF1ZXN0QW5pbUZyYW1lKGFuaW1hdGUpO1xuXHRmdW5jdGlvbiBhbmltYXRlKCkge1xuXHRcdHJlcXVlc3RBbmltRnJhbWUoYW5pbWF0ZSk7XG5cblx0XHRzdGF0cy5iZWdpbigpO1xuXHRcdGMuY2xlYXIoKTtcblxuXHRcdGJ1bm55LnJvdGF0aW9uICs9IDAuMDE7XG5cblxuXG5cdFx0aWYgKGNvbnRhaW5lci5kaWZmLnNoYWRlcikge1xuXHRcdFx0Ly90aGlzLmJveENvbnRhaW5lci5zcDIuc2hhZGVyLnVuaWZvcm1zLkxpZ2h0UG9zLnZhbHVlWzBdID0gdGhpcy5saWdodC5saWdodC54IC8gdGhpcy5yZXM7XG5cdFx0XHQvL3RoaXMuYm94Q29udGFpbmVyLnNwMi5zaGFkZXIudW5pZm9ybXMuTGlnaHRQb3MudmFsdWVbMV0gPSB0aGlzLmxpZ2h0LmxpZ2h0LnkgLyB0aGlzLnJlcztcblx0XHRcdGNvbnRhaW5lci5kaWZmLnNoYWRlci51bmlmb3Jtcy5MaWdodFBvcy52YWx1ZVswXSA9IGN4O1xuXHRcdFx0Y29udGFpbmVyLmRpZmYuc2hhZGVyLnVuaWZvcm1zLkxpZ2h0UG9zLnZhbHVlWzFdID0gY3k7XG5cdFx0fVxuXG5cdFx0Zm9yICh2YXIgaSA9IDAsIGwgPSBtYXplTGlnaHRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuXHRcdFx0dmFyIHAgPSBtYXplTGlnaHRzW2ldO1xuXHRcdFx0Y29udGFpbmVyLmRyYXdMaWdodChwWzBdLCBwWzFdLCBwWzJdLCAwLjE1KVxuXG5cdFx0XHRjLmJlZ2luRmlsbCgweGZmY2MwMCk7XG5cdFx0XHRjLmRyYXdDaXJjbGUocFswXSwgcFsxXSwgMyk7XG5cdFx0XHRjLmVuZEZpbGwoKTtcblx0XHR9XG5cblx0XHRjb250YWluZXIuZHJhd0xpZ2h0KGN4LCBjeSwgMHhmZmNjMDAsIDAuMylcblxuXHRcdGMuYmVnaW5GaWxsKDB4ZmZjYzAwKTtcblx0XHRjLmRyYXdDaXJjbGUodmlzaWJpbGl0eS5jZW50ZXIueCwgdmlzaWJpbGl0eS5jZW50ZXIueSwgOCk7XG5cdFx0Yy5lbmRGaWxsKCk7XG5cblx0XHRkcmF3U2VnbWVudHMoYywgY29udGFpbmVyLnZpc2liaWxpdHkpO1xuXG5cdFx0Lyp2YXIgYiA9IGJ1bm55LmdldEJvdW5kcygpO1xuXHRcdGMuYmVnaW5GaWxsKDB4MDBmZmNjKTtcblx0XHRjLmRyYXdSZWN0KGIueCwgYi55LCBiLndpZHRoLCBiLmhlaWdodCk7XG5cdFx0Yy5lbmRGaWxsKCk7XG5cdFx0Ki9cblx0XHRjb250YWluZXIubG9hZE1hcChtYXplV2FsbHMsIFtidW5ueS5nZXRCb3VuZHMoKV0pXG5cblx0XHRyZW5kZXJlci5yZW5kZXIoc3RhZ2UpO1xuXHRcdHN0YXRzLmVuZCgpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGRyYXdMaWdodChjLCB2aXNpYmlsaXR5LCBjeCwgY3ksIGExLCBhMikge1xuXHR2aXNpYmlsaXR5LnNldExpZ2h0TG9jYXRpb24oY3gsIGN5KTtcblx0dmlzaWJpbGl0eS5zd2VlcCgpO1xuXG5cdGZvciAodmFyIGkgPSAwLCBsID0gdmlzaWJpbGl0eS5vdXRwdXQubGVuZ3RoOyBpIDwgbDsgaSArPSAyKSB7XG5cdFx0dmFyIHAxID0gdmlzaWJpbGl0eS5vdXRwdXRbaV07XG5cdFx0dmFyIHAyID0gdmlzaWJpbGl0eS5vdXRwdXRbaSArIDFdO1xuXG5cdFx0Yy5tb3ZlVG8ocDEueCwgcDEueSlcblx0XHRjLmxpbmVUbyhwMi54LCBwMi55KVxuXHRcdGMubGluZVRvKHZpc2liaWxpdHkuY2VudGVyLngsIHZpc2liaWxpdHkuY2VudGVyLnkpXG5cdFx0Yy5saW5lVG8ocDEueCwgcDEueSlcblx0fVxufVxuXG5cbmZ1bmN0aW9uIGRyYXdTZWdtZW50cyhnLCB2aXNpYmlsaXR5KSB7XG5cdHZhciBtYXhBbmdsZSA9IE1hdGguUEk7XG5cblx0Zy5saW5lU3R5bGUoMywgMHhjYzAwMDAsIDEuMCk7XG5cblx0Zm9yICh2YXIgaSA9IDAsIGwgPSB2aXNpYmlsaXR5Lm9wZW4ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdFx0dmFyIHNlZ21lbnQgPSB2aXNpYmlsaXR5Lm9wZW5baV07XG5cdFx0Zy5tb3ZlVG8oc2VnbWVudC5wMS54LCBzZWdtZW50LnAxLnkpO1xuXHRcdGcubGluZVRvKHNlZ21lbnQucDIueCwgc2VnbWVudC5wMi55KTtcblx0fVxuXG5cdGcubGluZVN0eWxlKDIsIDB4MDAwMDAwLCAxLjApO1xuXHRmb3IgKHZhciBpID0gMCwgbCA9IHZpc2liaWxpdHkuc2VnbWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdFx0dmFyIHNlZ21lbnQgPSB2aXNpYmlsaXR5LnNlZ21lbnRzW2ldO1xuXHRcdGcubW92ZVRvKHNlZ21lbnQucDEueCwgc2VnbWVudC5wMS55KTtcblx0XHRnLmxpbmVUbyhzZWdtZW50LnAyLngsIHNlZ21lbnQucDIueSk7XG5cdH1cblxuXHRnLmxpbmVTdHlsZSgwLCAweDAwMDAwMCwgMS4wKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL3NyYy9MaWdodENvbnRhaW5lcicpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vL3ZhciByID0gdChcIlBJWElcIik7XG5cbnZhciBEaWZmdXNlU2hhZGVyID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihnbCkge1xuXHRQSVhJLlBpeGlTaGFkZXIuY2FsbCh0aGlzLCBnbClcbn07XG5cbkRpZmZ1c2VTaGFkZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQSVhJLlBpeGlTaGFkZXIucHJvdG90eXBlKTtcbkRpZmZ1c2VTaGFkZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRGlmZnVzZVNoYWRlcjtcblxuRGlmZnVzZVNoYWRlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgZ2wgPSB0aGlzLmdsO1xuXG5cdHRoaXMudmVydGV4U3JjID0gW1xuXHRcdFwiYXR0cmlidXRlIHZlYzIgYVZlcnRleFBvc2l0aW9uO1wiLFxuXHRcdFwiYXR0cmlidXRlIHZlYzIgYVRleHR1cmVDb29yZDtcIixcblx0XHRcImF0dHJpYnV0ZSB2ZWM0IGFDb2xvcjtcIixcblx0XHRcImF0dHJpYnV0ZSBmbG9hdCBhUm90YXRpb247XCIsXG5cdFx0XCJ1bmlmb3JtIHZlYzIgcHJvamVjdGlvblZlY3RvcjtcIixcblx0XHRcInVuaWZvcm0gdmVjMiBvZmZzZXRWZWN0b3I7XCIsXG5cdFx0XCJ1bmlmb3JtIGZsb2F0IGZsaXBZO1wiLFxuXHRcdFwidmFyeWluZyB2ZWMyIHZUZXh0dXJlQ29vcmQ7XCIsXG5cdFx0XCJ2YXJ5aW5nIGZsb2F0IHZSb3RhdGlvbjtcIixcblx0XHRcInZhcnlpbmcgdmVjNCB2Q29sb3I7XCIsXG5cdFx0XCJjb25zdCB2ZWMyIGNlbnRlciA9IHZlYzIoLTEuMCwgMS4wKTtcIixcblx0XHRcInZvaWQgbWFpbih2b2lkKSB7XCIsXG5cdFx0XCIgICB2ZWMyIGZpbmFsViA9IGFWZXJ0ZXhQb3NpdGlvbiArIG9mZnNldFZlY3RvcjtcIixcblx0XHRcIiAgIGdsX1Bvc2l0aW9uID0gdmVjNCggZmluYWxWLnggLyBwcm9qZWN0aW9uVmVjdG9yLnggLTEuMCwgKGZpbmFsVi55IC8gcHJvamVjdGlvblZlY3Rvci55ICogK2ZsaXBZICkgKyBmbGlwWSAsIDAuMCwgMS4wKTtcIixcblx0XHRcIiAgIHZUZXh0dXJlQ29vcmQgPSBhVGV4dHVyZUNvb3JkO1wiLFxuXHRcdFwiICAgdlJvdGF0aW9uID0gYVJvdGF0aW9uO1wiLFxuXHRcdFwiICAgdkNvbG9yID0gYUNvbG9yO1wiLFxuXHRcdFwifVwiXG5cdF07XG5cblx0dGhpcy5mcmFnbWVudFNyYyA9IFtcblx0XHRcInByZWNpc2lvbiBsb3dwIGZsb2F0O1wiLFxuXHRcdFwidmFyeWluZyB2ZWMyIHZUZXh0dXJlQ29vcmQ7XCIsXG5cdFx0XCJ2YXJ5aW5nIHZlYzQgdkNvbG9yO1wiLFxuXHRcdFwidmFyeWluZyBmbG9hdCB2Um90YXRpb247XCIsXG5cdFx0XCJ1bmlmb3JtIHNhbXBsZXIyRCB1U2FtcGxlcjtcIixcblx0XHRcIiNkZWZpbmUgTV9QSSAzLjE0MTU5MjY1MzU4OTc5MzIzODQ2MjY0MzM4MzI3OTVcIixcblx0XHRcInZvaWQgbWFpbih2b2lkKSB7XCIsXG5cdFx0XCIgICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlMkQodVNhbXBsZXIsIHZUZXh0dXJlQ29vcmQpO1wiLFxuXHRcdFwifVwiXG5cdF07XG5cblx0dmFyIGUgPSBQSVhJLmNvbXBpbGVQcm9ncmFtKGdsLCB0aGlzLnZlcnRleFNyYywgdGhpcy5mcmFnbWVudFNyYyk7XG5cdGdsLnVzZVByb2dyYW0oZSk7XG5cblx0dGhpcy51U2FtcGxlciA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihlLCBcInVTYW1wbGVyXCIpO1xuXHR0aGlzLnByb2plY3Rpb25WZWN0b3IgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24oZSwgXCJwcm9qZWN0aW9uVmVjdG9yXCIpO1xuXHR0aGlzLm9mZnNldFZlY3RvciA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihlLCBcIm9mZnNldFZlY3RvclwiKTtcblx0dGhpcy5kaW1lbnNpb25zID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKGUsIFwiZGltZW5zaW9uc1wiKTtcblx0dGhpcy5mbGlwWSA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihlLCBcImZsaXBZXCIpO1xuXHR0aGlzLmFWZXJ0ZXhQb3NpdGlvbiA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKGUsIFwiYVZlcnRleFBvc2l0aW9uXCIpO1xuXHR0aGlzLmFUZXh0dXJlQ29vcmQgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihlLCBcImFUZXh0dXJlQ29vcmRcIik7XG5cdHRoaXMuY29sb3JBdHRyaWJ1dGUgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihlLCBcImFDb2xvclwiKTtcblx0dGhpcy5hUm90YXRpb24gPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihlLCBcImFSb3RhdGlvblwiKTtcblxuXHQtMSA9PT0gdGhpcy5jb2xvckF0dHJpYnV0ZSAmJiAodGhpcy5jb2xvckF0dHJpYnV0ZSA9IDIpO1xuXG5cdHRoaXMuYXR0cmlidXRlcyA9IFtcblx0XHR0aGlzLmFWZXJ0ZXhQb3NpdGlvbixcblx0XHR0aGlzLmFUZXh0dXJlQ29vcmQsXG5cdFx0dGhpcy5jb2xvckF0dHJpYnV0ZSxcblx0XHR0aGlzLmFSb3RhdGlvblxuXHRdO1xuXG5cdGZvciAodmFyIGkgaW4gdGhpcy51bmlmb3Jtcykge1xuXHRcdHRoaXMudW5pZm9ybXNbaV0udW5pZm9ybUxvY2F0aW9uID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKGUsIGkpO1xuXHR9XG5cdHRoaXMuaW5pdFVuaWZvcm1zKCk7XG5cdHRoaXMucHJvZ3JhbSA9IGU7XG59O1xuXG4vL21vZHVsZS5leHBvcnRzID0gRGlmZnVzZVNoYWRlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFZpc2liaWxpdHkgPSByZXF1aXJlKCcuL3Zpc2liaWxpdHknKTtcbnZhciBOb3JtYWxNYXBGaWx0ZXIgPSByZXF1aXJlKCcuL05vcm1hbE1hcEZpbHRlcicpO1xudmFyIExpZ2h0U3ByaXRlQmF0Y2ggPSByZXF1aXJlKCcuL0xpZ2h0U3ByaXRlQmF0Y2gnKTtcblxudmFyIExpZ2h0Q29udGFpbmVyID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcblx0UElYSS5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLmNhbGwodGhpcyk7XG5cdHRoaXMuZ3JhcGhpY3MgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuXHR0aGlzLnZpc2liaWxpdHkgPSBuZXcgVmlzaWJpbGl0eSgpO1xuXG5cblxuXHR0aGlzLnNpemUgPSB7XG5cdFx0d2lkdGg6IDEwMjQsXG5cdFx0aGVpZ2h0OiA3Njhcblx0fTtcblxuXHR0aGlzLmRpZmZ1c2VUZXh0dXJlID0gbmV3IFBJWEkuUmVuZGVyVGV4dHVyZSh0aGlzLnNpemUud2lkdGgsIHRoaXMuc2l6ZS5oZWlnaHQpO1xuXHR0aGlzLm5vcm1hbFRleHR1cmUgPSBuZXcgUElYSS5SZW5kZXJUZXh0dXJlKHRoaXMuc2l6ZS53aWR0aCwgdGhpcy5zaXplLmhlaWdodCk7XG5cblx0dGhpcy5zcHJpdGViYXRjaCA9IG5ldyBMaWdodFNwcml0ZUJhdGNoKHRoaXMuZGlmZnVzZVRleHR1cmUudGV4dHVyZUJ1ZmZlciwgdGhpcy5ub3JtYWxUZXh0dXJlLnRleHR1cmVCdWZmZXIpO1xuXG5cdHRoaXMuZGlmZiA9IG5ldyBQSVhJLlNwcml0ZSh0aGlzLmRpZmZ1c2VUZXh0dXJlKTtcblx0dGhpcy5ub3JtID0gbmV3IFBJWEkuU3ByaXRlKHRoaXMubm9ybWFsVGV4dHVyZSk7XG5cdHRoaXMubm9ybS54ID0gMjUwNTtcbn1cblxuTGlnaHRDb250YWluZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQSVhJLkRpc3BsYXlPYmplY3RDb250YWluZXIucHJvdG90eXBlKTtcbkxpZ2h0Q29udGFpbmVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExpZ2h0Q29udGFpbmVyO1xuXG5MaWdodENvbnRhaW5lci5wcm90b3R5cGUuZHJhd0xpZ2h0ID0gZnVuY3Rpb24oY3gsIGN5LCBjb2xvciwgYWxwaGEpIHtcblx0aWYgKGNvbG9yID09IG51bGwpIHtcblx0XHRjb2xvciA9IDB4MDAwMDAwO1xuXHR9XG5cdGlmIChhbHBoYSA9PSBudWxsKSB7XG5cdFx0YWxwaGEgPSAxLjA7XG5cdH1cblxuXHR2YXIgdmlzaWJpbGl0eSA9IHRoaXMudmlzaWJpbGl0eTtcblx0dmFyIGMgPSB0aGlzLmdyYXBoaWNzO1xuXG5cdHZpc2liaWxpdHkuc2V0TGlnaHRMb2NhdGlvbihjeCwgY3kpO1xuXHR2aXNpYmlsaXR5LnN3ZWVwKCk7XG5cblx0Yy5iZWdpbkZpbGwoY29sb3IsIGFscGhhKTtcblx0Zm9yICh2YXIgaSA9IDAsIGwgPSB2aXNpYmlsaXR5Lm91dHB1dC5sZW5ndGg7IGkgPCBsOyBpICs9IDIpIHtcblx0XHR2YXIgcDEgPSB2aXNpYmlsaXR5Lm91dHB1dFtpXTtcblx0XHR2YXIgcDIgPSB2aXNpYmlsaXR5Lm91dHB1dFtpICsgMV07XG5cdFx0Yy5tb3ZlVG8ocDEueCwgcDEueSlcblx0XHRjLmxpbmVUbyhwMi54LCBwMi55KVxuXHRcdGMubGluZVRvKGN4LCBjeSlcblx0XHRjLmxpbmVUbyhwMS54LCBwMS55KVxuXHR9XG5cdGMuZW5kRmlsbCgpO1xufTtcblxuTGlnaHRDb250YWluZXIucHJvdG90eXBlLmxvYWRNYXAgPSBmdW5jdGlvbih3YWxscywgYmxvY2tzKSB7XG5cdGlmICh3YWxscyA9PSBudWxsKSB7XG5cdFx0d2FsbHMgPSBbXTtcblx0fVxuXHRpZiAoYmxvY2tzID09IG51bGwpIHtcblx0XHRibG9ja3MgPSBbXTtcblx0fVxuXHQvKlxuXHRibG9ja3MgPSBibG9ja3MubWFwKGZ1bmN0aW9uKGJsb2NrKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHAxOiB7XG5cdFx0XHRcdHg6IGJsb2NrWzBdLFxuXHRcdFx0XHR5OiBibG9ja1sxXVxuXHRcdFx0fSxcblx0XHRcdHAyOiB7XG5cdFx0XHRcdHg6IHdhbGxbMl0sXG5cdFx0XHRcdHk6IHdhbGxbM11cblx0XHRcdH1cblx0XHR9O1xuXHR9KTsqL1xuXHR3YWxscyA9IHdhbGxzLm1hcChmdW5jdGlvbih3YWxsKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHAxOiB7XG5cdFx0XHRcdHg6IHdhbGxbMF0sXG5cdFx0XHRcdHk6IHdhbGxbMV1cblx0XHRcdH0sXG5cdFx0XHRwMjoge1xuXHRcdFx0XHR4OiB3YWxsWzJdLFxuXHRcdFx0XHR5OiB3YWxsWzNdXG5cdFx0XHR9XG5cdFx0fTtcblx0fSk7XG5cdHRoaXMudmlzaWJpbGl0eS5sb2FkTWFwKDMwLCAtMjAwMCwgYmxvY2tzLCB3YWxscyk7XG59O1xuXG4vLy8vXG5cbkxpZ2h0Q29udGFpbmVyLnByb3RvdHlwZS5fcmVuZGVyV2ViR0wgPSBmdW5jdGlvbihyZW5kZXJTZXNzaW9uKSB7XG5cdGlmICghdGhpcy5zcHJpdGViYXRjaC5nbCkge1xuXHRcdHRoaXMuc3ByaXRlYmF0Y2guc2V0Q29udGV4dChyZW5kZXJTZXNzaW9uLmdsKTtcblx0XHR0aGlzLmRpZmYuc2hhZGVyID0gbmV3IE5vcm1hbE1hcEZpbHRlcih0aGlzLm5vcm1hbFRleHR1cmUpO1xuXHR9XG5cdHJlbmRlclNlc3Npb24uc2hhZGVyTWFuYWdlci5zZXRTaGFkZXIocmVuZGVyU2Vzc2lvbi5zaGFkZXJNYW5hZ2VyLmRlZmF1bHRTaGFkZXIpO1xuXG5cdHJlbmRlclNlc3Npb24uc3ByaXRlQmF0Y2guc3RvcCgpO1xuXG5cdHZhciBpID0gW107XG5cdHRoaXMuY29sbGVjdFNwcml0ZXModGhpcywgaSk7XG5cblx0dGhpcy5zcHJpdGViYXRjaC5iZWdpbihyZW5kZXJTZXNzaW9uKTtcblx0Zm9yICh2YXIgciA9IDA7IHIgPCBpLmxlbmd0aDsgcisrKSB7XG5cdFx0dGhpcy5zcHJpdGViYXRjaC5yZW5kZXIoaVtyXSk7XG5cdH1cblx0dGhpcy5zcHJpdGViYXRjaC5lbmQoKTtcblxuXHRyZW5kZXJTZXNzaW9uLnNwcml0ZUJhdGNoLnN0YXJ0KCk7XG59O1xuXG5MaWdodENvbnRhaW5lci5wcm90b3R5cGUuY29sbGVjdFNwcml0ZXMgPSBmdW5jdGlvbihvYmosIGNvbGxlY3Rpb24pIHtcblx0b2JqLmFuY2hvciAmJiBjb2xsZWN0aW9uLnB1c2gob2JqKTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBvYmouY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcblx0XHR0aGlzLmNvbGxlY3RTcHJpdGVzKG9iai5jaGlsZHJlbltpXSwgY29sbGVjdGlvbik7XG5cdH1cbn07XG5cbkxpZ2h0Q29udGFpbmVyLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbih3LCBoKSB7XG5cdHRoaXMuc2l6ZS53aWR0aCA9IHc7XG5cdHRoaXMuc2l6ZS5oZWlnaHQgPSBoO1xuXHR0aGlzLmRpZmZ1c2VUZXh0dXJlLnJlc2l6ZSh3LCBoKTtcblx0dGhpcy5ub3JtYWxUZXh0dXJlLnJlc2l6ZSh3LCBoKTtcblx0dGhpcy5vY2NsdWRlcnNGQk8ucmVzaXplKHcsIGgpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy92YXIgciA9IHQoXCJQSVhJXCIpO1xuXG52YXIgTGlnaHRTaGFkZXIgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHQpIHtcblx0UElYSS5QaXhpU2hhZGVyLmNhbGwodGhpcywgdClcbn07XG5cbkxpZ2h0U2hhZGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUElYSS5QaXhpU2hhZGVyLnByb3RvdHlwZSk7XG5MaWdodFNoYWRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBMaWdodFNoYWRlcjtcblxuTGlnaHRTaGFkZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcblx0dmFyIHQgPSB0aGlzLmdsO1xuXHR0aGlzLnZlcnRleFNyYyA9IFtcblx0XHRcImF0dHJpYnV0ZSB2ZWMyIGFWZXJ0ZXhQb3NpdGlvbjtcIixcblx0XHRcImF0dHJpYnV0ZSB2ZWMyIGFUZXh0dXJlQ29vcmQ7XCIsXG5cdFx0XCJhdHRyaWJ1dGUgdmVjNCBhQ29sb3I7XCIsXG5cdFx0XCJhdHRyaWJ1dGUgZmxvYXQgYVJvdGF0aW9uO1wiLFxuXHRcdFwidW5pZm9ybSB2ZWMyIHByb2plY3Rpb25WZWN0b3I7XCIsXG5cdFx0XCJ1bmlmb3JtIHZlYzIgb2Zmc2V0VmVjdG9yO1wiLFxuXHRcdFwidW5pZm9ybSBmbG9hdCBmbGlwWTtcIixcblx0XHRcInZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkO1wiLFxuXHRcdFwidmFyeWluZyBmbG9hdCB2Um90YXRpb247XCIsXG5cdFx0XCJ2YXJ5aW5nIHZlYzQgdkNvbG9yO1wiLFxuXHRcdFwiY29uc3QgdmVjMiBjZW50ZXIgPSB2ZWMyKC0xLjAsIDEuMCk7XCIsXG5cdFx0XCJ2b2lkIG1haW4odm9pZCkge1wiLFxuXHRcdFwiICAgdmVjMiBmaW5hbFYgPSBhVmVydGV4UG9zaXRpb24gKyBvZmZzZXRWZWN0b3I7XCIsXG5cdFx0XCIgICBnbF9Qb3NpdGlvbiA9IHZlYzQoIGZpbmFsVi54IC8gcHJvamVjdGlvblZlY3Rvci54IC0xLjAsIChmaW5hbFYueSAvIHByb2plY3Rpb25WZWN0b3IueSAqICtmbGlwWSApICsgZmxpcFkgLCAwLjAsIDEuMCk7XCIsXG5cdFx0XCIgICB2VGV4dHVyZUNvb3JkID0gYVRleHR1cmVDb29yZDtcIixcblx0XHRcIiAgIHZSb3RhdGlvbiA9IGFSb3RhdGlvbjtcIixcblx0XHRcIiAgIHZDb2xvciA9IGFDb2xvcjtcIixcblx0XHRcIn1cIlxuXHRdO1xuXHR0aGlzLmZyYWdtZW50U3JjID0gW1xuXHRcdFwicHJlY2lzaW9uIGxvd3AgZmxvYXQ7XCIsXG5cdFx0XCJ2YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZDtcIixcblx0XHRcInZhcnlpbmcgdmVjNCB2Q29sb3I7XCIsXG5cdFx0XCJ2YXJ5aW5nIGZsb2F0IHZSb3RhdGlvbjtcIixcblx0XHRcInVuaWZvcm0gc2FtcGxlcjJEIHVTYW1wbGVyO1wiLFxuXHRcdFwiI2RlZmluZSBNX1BJIDMuMTQxNTkyNjUzNTg5NzkzMjM4NDYyNjQzMzgzMjc5NVwiLFxuXHRcdFwidm9pZCBtYWluKHZvaWQpIHtcIixcblx0XHRcIiAgICB2ZWM0IGNvbG9yID0gIHRleHR1cmUyRCh1U2FtcGxlciwgdlRleHR1cmVDb29yZCk7XCIsXG5cdFx0XCIgICAgdmVjMyBOb3JtYWxNYXAgPSBjb2xvci5yZ2I7XCIsXG5cdFx0XCIgICAgdmVjMyBOID0gbm9ybWFsaXplKE5vcm1hbE1hcCAqIDIuMCAtIDEuMCk7XCIsXG5cdFx0XCIgICAgZmxvYXQgYW5nbGUgPSB2Um90YXRpb247XCIsXG5cdFx0XCIgICAgdmVjMiByb3RhdGVkTjtcIixcblx0XHRcIiAgICByb3RhdGVkTi5yID0gKE4ucikqc2luKGFuZ2xlKSAtIChOLmcpKmNvcyhhbmdsZSk7XCIsXG5cdFx0XCIgICAgcm90YXRlZE4uZyA9IChOLnIpKmNvcyhhbmdsZSkgKyAoTi5nKSpzaW4oYW5nbGUpO1wiLFxuXHRcdFwiICAgIE4uciA9IHJvdGF0ZWROLmc7XCIsXG5cdFx0XCIgICAgTi5nID0gcm90YXRlZE4ucjtcIixcblx0XHRcIiAgICBOb3JtYWxNYXAgPSBOO1wiLFxuXHRcdFwiICAgIE5vcm1hbE1hcCA9IChOb3JtYWxNYXAgKyAxLjApIC8gMi4wO1wiLFxuXHRcdFwiICAgIGdsX0ZyYWdDb2xvciA9IHZlYzQoTm9ybWFsTWFwICogY29sb3IuYSwgY29sb3IuYSk7XCIsXG5cdFx0XCJ9XCJcblx0XTtcblxuXHR2YXIgZSA9IFBJWEkuY29tcGlsZVByb2dyYW0odCwgdGhpcy52ZXJ0ZXhTcmMsIHRoaXMuZnJhZ21lbnRTcmMpO1xuXHR0LnVzZVByb2dyYW0oZSksXG5cblx0dGhpcy51U2FtcGxlciA9IHQuZ2V0VW5pZm9ybUxvY2F0aW9uKGUsIFwidVNhbXBsZXJcIiksXG5cdHRoaXMucHJvamVjdGlvblZlY3RvciA9IHQuZ2V0VW5pZm9ybUxvY2F0aW9uKGUsIFwicHJvamVjdGlvblZlY3RvclwiKSxcblx0dGhpcy5vZmZzZXRWZWN0b3IgPSB0LmdldFVuaWZvcm1Mb2NhdGlvbihlLCBcIm9mZnNldFZlY3RvclwiKSxcblx0dGhpcy5kaW1lbnNpb25zID0gdC5nZXRVbmlmb3JtTG9jYXRpb24oZSwgXCJkaW1lbnNpb25zXCIpLFxuXHR0aGlzLmZsaXBZID0gdC5nZXRVbmlmb3JtTG9jYXRpb24oZSwgXCJmbGlwWVwiKSxcblx0dGhpcy5hVmVydGV4UG9zaXRpb24gPSB0LmdldEF0dHJpYkxvY2F0aW9uKGUsIFwiYVZlcnRleFBvc2l0aW9uXCIpLFxuXHR0aGlzLmFUZXh0dXJlQ29vcmQgPSB0LmdldEF0dHJpYkxvY2F0aW9uKGUsIFwiYVRleHR1cmVDb29yZFwiKSxcblx0dGhpcy5jb2xvckF0dHJpYnV0ZSA9IHQuZ2V0QXR0cmliTG9jYXRpb24oZSwgXCJhQ29sb3JcIiksXG5cdHRoaXMuYVJvdGF0aW9uID0gdC5nZXRBdHRyaWJMb2NhdGlvbihlLCBcImFSb3RhdGlvblwiKSxcblxuXHQtMSA9PT0gdGhpcy5jb2xvckF0dHJpYnV0ZSAmJiAodGhpcy5jb2xvckF0dHJpYnV0ZSA9IDIpLFxuXG5cdHRoaXMuYXR0cmlidXRlcyA9IFt0aGlzLmFWZXJ0ZXhQb3NpdGlvbiwgdGhpcy5hVGV4dHVyZUNvb3JkLFxuXHR0aGlzLmNvbG9yQXR0cmlidXRlLCB0aGlzLmFSb3RhdGlvbl07XG5cblx0Zm9yICh2YXIgaSBpbiB0aGlzLnVuaWZvcm1zKSB7XG5cdFx0dGhpcy51bmlmb3Jtc1tpXS51bmlmb3JtTG9jYXRpb24gPSB0LmdldFVuaWZvcm1Mb2NhdGlvbihlLCBpKTtcblx0fVxuXHR0aGlzLmluaXRVbmlmb3JtcygpO1xuXHR0aGlzLnByb2dyYW0gPSBlO1xufTtcblxuLy9tb2R1bGUuZXhwb3J0cyA9IExpZ2h0U2hhZGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuLypcbnZhciByID0gdChcIlBJWElcIiksXG5cdG8gPSB0KFwiLi9MaWdodFNoYWRlclwiKSxcblx0biA9IHQoXCIuL0RpZmZ1c2VTaGFkZXJcIik7XG4qL1xuXG52YXIgTGlnaHRTaGFkZXIgPSByZXF1aXJlKCcuL0xpZ2h0U2hhZGVyJyk7XG52YXIgRGlmZnVzZVNoYWRlciA9IHJlcXVpcmUoJy4vRGlmZnVzZVNoYWRlcicpO1xuXG52YXIgTGlnaHRTcHJpdGVCYXRjaCA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGlmZiwgbm9ybSwgb2NjKSB7XG5cdHRoaXMuZGlmZnVzZVRleHR1cmUgPSBkaWZmO1xuXHR0aGlzLm5vcm1hbFRleHR1cmUgPSBub3JtO1xuXHR0aGlzLm9jY2x1ZGVyc0ZCTyA9IG9jYztcblx0dGhpcy52ZXJ0U2l6ZSA9IDY7XG5cdHRoaXMuc2l6ZSA9IDFlNDtcblxuXHR2YXIgaSA9IDQgKiB0aGlzLnNpemUgKiA0ICogdGhpcy52ZXJ0U2l6ZSxcblx0XHRvID0gNiAqIHRoaXMuc2l6ZTtcblxuXHR0aGlzLnZlcnRpY2VzID0gbmV3IFBJWEkuQXJyYXlCdWZmZXIoaSk7XG5cdHRoaXMucG9zaXRpb25zID0gbmV3IFBJWEkuRmxvYXQzMkFycmF5KHRoaXMudmVydGljZXMpO1xuXHR0aGlzLmNvbG9ycyA9IG5ldyBQSVhJLlVpbnQzMkFycmF5KHRoaXMudmVydGljZXMpO1xuXHR0aGlzLmluZGljZXMgPSBuZXcgUElYSS5VaW50MTZBcnJheShvKTtcblx0dGhpcy5sYXN0SW5kZXhDb3VudCA9IDA7XG5cdGZvciAodmFyIG4gPSAwLCBzID0gMDsgbyA+IG47IG4gKz0gNiwgcyArPSA0KSB7XG5cdFx0dGhpcy5pbmRpY2VzW24gKyAwXSA9IHMgKyAwO1xuXHRcdHRoaXMuaW5kaWNlc1tuICsgMV0gPSBzICsgMTtcblx0XHR0aGlzLmluZGljZXNbbiArIDJdID0gcyArIDI7XG5cdFx0dGhpcy5pbmRpY2VzW24gKyAzXSA9IHMgKyAwO1xuXHRcdHRoaXMuaW5kaWNlc1tuICsgNF0gPSBzICsgMjtcblx0XHR0aGlzLmluZGljZXNbbiArIDVdID0gcyArIDM7XG5cdH1cblx0dGhpcy5kcmF3aW5nID0gITE7XG5cdHRoaXMuY3VycmVudEJhdGNoU2l6ZSA9IDA7XG5cdHRoaXMuY3VycmVudEJhc2VUZXh0dXJlID0gbnVsbDtcblx0dGhpcy5kaXJ0eSA9ICEwO1xuXHR0aGlzLnRleHR1cmVzID0gW107XG5cdHRoaXMuYmxlbmRNb2RlcyA9IFtdO1xuXHR0aGlzLnNoYWRlcnMgPSBbXTtcblx0dGhpcy5zcHJpdGVzID0gW107XG5cdHRoaXMuZGVmYXVsdFNoYWRlciA9IG5ldyBQSVhJLkFic3RyYWN0RmlsdGVyKFtcInByZWNpc2lvbiBsb3dwIGZsb2F0O1wiLFxuXHRcdFwidmFyeWluZyB2ZWMyIHZUZXh0dXJlQ29vcmQ7XCIsXG5cdFx0XCJ2YXJ5aW5nIHZlYzQgdkNvbG9yO1wiLFxuXHRcdFwidW5pZm9ybSBzYW1wbGVyMkQgdVNhbXBsZXI7XCIsXG5cdFx0XCJ2b2lkIG1haW4odm9pZCkge1wiLFxuXHRcdFwiICAgZ2xfRnJhZ0NvbG9yID0gdGV4dHVyZTJEKHVTYW1wbGVyLCB2VGV4dHVyZUNvb3JkKSAqIHZDb2xvciA7XCIsXG5cdFx0XCJ9XCJcblx0XSk7XG59XG5cbkxpZ2h0U3ByaXRlQmF0Y2gucHJvdG90eXBlLnNldENvbnRleHQgPSBmdW5jdGlvbihnbCkge1xuXHR0aGlzLmdsID0gZ2w7XG5cdHRoaXMudmVydGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG5cdHRoaXMuaW5kZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcblx0Z2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgdGhpcy5pbmRleEJ1ZmZlcik7XG5cdGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIHRoaXMuaW5kaWNlcywgZ2wuU1RBVElDX0RSQVcpO1xuXHRnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy52ZXJ0ZXhCdWZmZXIpO1xuXHRnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy52ZXJ0aWNlcywgZ2wuRFlOQU1JQ19EUkFXKTtcblx0dGhpcy5jdXJyZW50QmxlbmRNb2RlID0gOTk5OTk7XG5cdHRoaXMubGlnaHRTaGFkZXIgPSBuZXcgTGlnaHRTaGFkZXIoZ2wpO1xuXHR0aGlzLmRpZmZ1c2VTaGFkZXIgPSBuZXcgRGlmZnVzZVNoYWRlcihnbCk7XG5cdC8vIFRPRE8gb2NjbHVkZXJzRkJPXG5cdC8vdGhpcy5vY2NsdWRlcnNTaGFkZXIgPSBuZXcgT2NjU2hhZGVyKGdsKTtcbn1cblxuTGlnaHRTcHJpdGVCYXRjaC5wcm90b3R5cGUuYmVnaW4gPSBmdW5jdGlvbihyZW5kZXJTZXNzaW9uKSB7XG5cdHRoaXMucmVuZGVyU2Vzc2lvbiA9IHJlbmRlclNlc3Npb247XG5cdHRoaXMuc2hhZGVyID0gdGhpcy5yZW5kZXJTZXNzaW9uLnNoYWRlck1hbmFnZXIuZGVmYXVsdFNoYWRlcjtcblx0dGhpcy5zdGFydCgpXG59XG5cbkxpZ2h0U3ByaXRlQmF0Y2gucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLmZsdXNoKClcbn1cblxuTGlnaHRTcHJpdGVCYXRjaC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24odCkge1xuXHR2YXIgZSA9IHQudGV4dHVyZTtcblx0aWYgKHRoaXMuY3VycmVudEJhdGNoU2l6ZSA+PSB0aGlzLnNpemUpIHtcblx0XHR0aGlzLmZsdXNoKCk7XG5cdFx0dGhpcy5jdXJyZW50QmFzZVRleHR1cmUgPSBlLmJhc2VUZXh0dXJlO1xuXHR9XG5cdHZhciBpID0gZS5fdXZzO1xuXHRpZiAoaSkge1xuXHRcdHZhciByLCBvLCBuLCBzLFxuXHRcdFx0YSA9IHQuYW5jaG9yLngsXG5cdFx0XHRoID0gdC5hbmNob3IueTtcblx0XHRpZiAoZS50cmltKSB7XG5cdFx0XHR2YXIgbCA9IGUudHJpbTtcblx0XHRcdG8gPSBsLnggLSBhICogbC53aWR0aCwgciA9IG8gKyBlLmNyb3Aud2lkdGgsIHMgPSBsLnkgLSBoICogbC5oZWlnaHQsIG4gPSBzICsgZS5jcm9wLmhlaWdodFxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyID0gZS5mcmFtZS53aWR0aCAqICgxIC0gYSksIG8gPSBlLmZyYW1lLndpZHRoICogLWEsIG4gPSBlLmZyYW1lLmhlaWdodCAqICgxIC0gaCksIHMgPSBlLmZyYW1lLmhlaWdodCAqIC1oO1xuXHRcdH1cblx0XHR2YXIgdSA9IDQgKiB0aGlzLmN1cnJlbnRCYXRjaFNpemUgKiB0aGlzLnZlcnRTaXplLFxuXHRcdFx0YyA9IGUuYmFzZVRleHR1cmUucmVzb2x1dGlvbixcblx0XHRcdHAgPSB0LndvcmxkVHJhbnNmb3JtLFxuXHRcdFx0ZCA9IHAuYSAvIGMsXG5cdFx0XHRmID0gcC5iIC8gYyxcblx0XHRcdG0gPSBwLmMgLyBjLFxuXHRcdFx0diA9IHAuZCAvIGMsXG5cdFx0XHRnID0gcC50eCxcblx0XHRcdHkgPSBwLnR5LFxuXHRcdFx0eCA9IHRoaXMuY29sb3JzLFxuXHRcdFx0YiA9IHRoaXMucG9zaXRpb25zLFxuXHRcdFx0dyA9IHQudGludCxcblx0XHRcdF8gPSAodyA+PiAxNikgKyAoNjUyODAgJiB3KSArICgoMjU1ICYgdykgPDwgMTYpICsgKDI1NSAqIHQuYWxwaGEgPDwgMjQpLFxuXHRcdFx0VCA9IE1hdGguYXRhbjIoZiwgZCk7XG5cblx0XHRiW3UrK10gPSBkICogbyArIG0gKiBzICsgZztcblx0XHRiW3UrK10gPSB2ICogcyArIGYgKiBvICsgeTtcblx0XHRiW3UrK10gPSBpLngwO1xuXHRcdGJbdSsrXSA9IGkueTA7XG5cdFx0eFt1KytdID0gXztcblx0XHR0aGlzLnBvc2l0aW9uc1t1KytdID0gVDtcblx0XHRiW3UrK10gPSBkICogciArIG0gKiBzICsgZztcblx0XHRiW3UrK10gPSB2ICogcyArIGYgKiByICsgeTtcblx0XHRiW3UrK10gPSBpLngxO1xuXHRcdGJbdSsrXSA9IGkueTE7XG5cdFx0eFt1KytdID0gXztcblx0XHR0aGlzLnBvc2l0aW9uc1t1KytdID0gVDtcblx0XHRiW3UrK10gPSBkICogciArIG0gKiBuICsgZztcblx0XHRiW3UrK10gPSB2ICogbiArIGYgKiByICsgeTtcblx0XHRiW3UrK10gPSBpLngyO1xuXHRcdGJbdSsrXSA9IGkueTI7XG5cdFx0eFt1KytdID0gXztcblx0XHR0aGlzLnBvc2l0aW9uc1t1KytdID0gVDtcblx0XHRiW3UrK10gPSBkICogbyArIG0gKiBuICsgZztcblx0XHRiW3UrK10gPSB2ICogbiArIGYgKiBvICsgeTtcblx0XHRiW3UrK10gPSBpLngzO1xuXHRcdGJbdSsrXSA9IGkueTM7XG5cdFx0eFt1KytdID0gXztcblx0XHR0aGlzLnBvc2l0aW9uc1t1KytdID0gVDtcblx0XHR0aGlzLnNwcml0ZXNbdGhpcy5jdXJyZW50QmF0Y2hTaXplKytdID0gdFxuXHR9XG59XG5cbkxpZ2h0U3ByaXRlQmF0Y2gucHJvdG90eXBlLnJlbmRlclRpbGluZ1Nwcml0ZSA9IGZ1bmN0aW9uKHQpIHtcblx0dmFyIGUgPSB0LnRpbGluZ1RleHR1cmU7XG5cdHRoaXMuY3VycmVudEJhdGNoU2l6ZSA+PSB0aGlzLnNpemUgJiYgKHRoaXMuZmx1c2goKSwgdGhpcy5jdXJyZW50QmFzZVRleHR1cmUgPSBlLmJhc2VUZXh0dXJlKTtcblx0dC5fdXZzIHx8ICh0Ll91dnMgPSBuZXcgUElYSS5UZXh0dXJlVXZzKTtcblx0dmFyIGkgPSB0Ll91dnM7XG5cdHQudGlsZVBvc2l0aW9uLnggJT0gZS5iYXNlVGV4dHVyZS53aWR0aCAqIHQudGlsZVNjYWxlT2Zmc2V0Lng7XG5cdHQudGlsZVBvc2l0aW9uLnkgJT0gZS5iYXNlVGV4dHVyZS5oZWlnaHQgKiB0LnRpbGVTY2FsZU9mZnNldC55O1xuXHR2YXIgbyA9IHQudGlsZVBvc2l0aW9uLnggLyAoZS5iYXNlVGV4dHVyZS53aWR0aCAqIHQudGlsZVNjYWxlT2Zmc2V0LngpLFxuXHRcdG4gPSB0LnRpbGVQb3NpdGlvbi55IC8gKGUuYmFzZVRleHR1cmUuaGVpZ2h0ICogdC50aWxlU2NhbGVPZmZzZXQueSksXG5cdFx0cyA9IHQud2lkdGggLyBlLmJhc2VUZXh0dXJlLndpZHRoIC8gKHQudGlsZVNjYWxlLnggKiB0LnRpbGVTY2FsZU9mZnNldC54KSxcblx0XHRhID0gdC5oZWlnaHQgLyBlLmJhc2VUZXh0dXJlLmhlaWdodCAvICh0LnRpbGVTY2FsZS55ICogdC50aWxlU2NhbGVPZmZzZXQueSk7XG5cblx0aS54MCA9IDAgLSBvO1xuXHRpLnkwID0gMCAtIG47XG5cdGkueDEgPSAxICogcyAtIG87XG5cdGkueTEgPSAwIC0gbjtcblx0aS54MiA9IDEgKiBzIC0gbztcblx0aS55MiA9IDEgKiBhIC0gbjtcblx0aS54MyA9IDAgLSBvO1xuXHRpLnkzID0gMSAqIGEgLSBuO1xuXHR2YXIgaCA9IHQudGludCxcblx0XHRsID0gKGggPj4gMTYpICsgKDY1MjgwICYgaCkgKyAoKDI1NSAmIGgpIDw8IDE2KSArICgyNTUgKiB0LmFscGhhIDw8IDI0KSxcblx0XHR1ID0gdGhpcy5wb3NpdGlvbnMsXG5cdFx0YyA9IHRoaXMuY29sb3JzLFxuXHRcdHAgPSB0LndpZHRoLFxuXHRcdGQgPSB0LmhlaWdodCxcblx0XHRmID0gdC5hbmNob3IueCxcblx0XHRtID0gdC5hbmNob3IueSxcblx0XHR2ID0gcCAqICgxIC0gZiksXG5cdFx0ZyA9IHAgKiAtZixcblx0XHR5ID0gZCAqICgxIC0gbSksXG5cdFx0eCA9IGQgKiAtbSxcblx0XHRiID0gNCAqIHRoaXMuY3VycmVudEJhdGNoU2l6ZSAqIHRoaXMudmVydFNpemUsXG5cdFx0dyA9IGUuYmFzZVRleHR1cmUucmVzb2x1dGlvbixcblx0XHRfID0gdC53b3JsZFRyYW5zZm9ybSxcblx0XHRUID0gXy5hIC8gdyxcblx0XHRTID0gXy5iIC8gdyxcblx0XHRBID0gXy5jIC8gdyxcblx0XHRDID0gXy5kIC8gdyxcblx0XHRFID0gXy50eCxcblx0XHRNID0gXy50eTtcblxuXHR1W2IrK10gPSBUICogZyArIEEgKiB4ICsgRTtcblx0dVtiKytdID0gQyAqIHggKyBTICogZyArIE07XG5cdHVbYisrXSA9IGkueDA7XG5cdHVbYisrXSA9IGkueTA7XG5cdGNbYisrXSA9IGw7XG5cdHVbYisrXSA9IFQgKiB2ICsgQSAqIHggKyBFO1xuXHR1W2IrK10gPSBDICogeCArIFMgKiB2ICsgTTtcblx0dVtiKytdID0gaS54MTtcblx0dVtiKytdID0gaS55MTtcblx0Y1tiKytdID0gbDtcblx0dVtiKytdID0gVCAqIHYgKyBBICogeSArIEU7XG5cdHVbYisrXSA9IEMgKiB5ICsgUyAqIHYgKyBNO1xuXHR1W2IrK10gPSBpLngyO1xuXHR1W2IrK10gPSBpLnkyO1xuXHRjW2IrK10gPSBsO1xuXHR1W2IrK10gPSBUICogZyArIEEgKiB5ICsgRTtcblx0dVtiKytdID0gQyAqIHkgKyBTICogZyArIE07XG5cdHVbYisrXSA9IGkueDM7XG5cdHVbYisrXSA9IGkueTM7XG5cdGNbYisrXSA9IGw7XG5cdHRoaXMuc3ByaXRlc1t0aGlzLmN1cnJlbnRCYXRjaFNpemUrK10gPSB0XG59XG5cbkxpZ2h0U3ByaXRlQmF0Y2gucHJvdG90eXBlLmZsdXNoID0gZnVuY3Rpb24oKSB7XG5cdGlmICgwICE9PSB0aGlzLmN1cnJlbnRCYXRjaFNpemUpIHtcblx0XHR2YXIgdCxcblx0XHRcdGdsID0gdGhpcy5nbDtcblxuXHRcdGlmICh0aGlzLmRpcnR5KSB7XG5cdFx0XHR0aGlzLmRpcnR5ID0gITE7XG5cdFx0XHR0ID0gdGhpcy5saWdodFNoYWRlcjtcblx0XHRcdGdsLmFjdGl2ZVRleHR1cmUoZ2wuVEVYVFVSRTApOyBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy52ZXJ0ZXhCdWZmZXIpO1xuXHRcdFx0Z2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgdGhpcy5pbmRleEJ1ZmZlcik7XG5cblx0XHRcdHZhciBpID0gNCAqIHRoaXMudmVydFNpemU7XG5cdFx0XHRnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHQuYVZlcnRleFBvc2l0aW9uLCAyLCBnbC5GTE9BVCwgITEsIGksIDApO1xuXHRcdFx0Z2wudmVydGV4QXR0cmliUG9pbnRlcih0LmFUZXh0dXJlQ29vcmQsIDIsIGdsLkZMT0FULCAhMSwgaSwgOCk7XG5cdFx0XHRnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHQuY29sb3JBdHRyaWJ1dGUsIDQsIGdsLlVOU0lHTkVEX0JZVEUsICEwLCBpLCAxNik7XG5cdFx0XHRnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHQuYVJvdGF0aW9uLCAxLCBnbC5GTE9BVCwgITEsIGksIDIwKVxuXHRcdH1cblxuXHRcdGlmICh0aGlzLmN1cnJlbnRCYXRjaFNpemUgPiAuNSAqIHRoaXMuc2l6ZSkge1xuXHRcdFx0Z2wuYnVmZmVyU3ViRGF0YShnbC5BUlJBWV9CVUZGRVIsIDAsIHRoaXMudmVydGljZXMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgciA9IHRoaXMucG9zaXRpb25zLnN1YmFycmF5KDAsIDQgKiB0aGlzLmN1cnJlbnRCYXRjaFNpemUgKiB0aGlzLnZlcnRTaXplKTtcblx0XHRcdGdsLmJ1ZmZlclN1YkRhdGEoZ2wuQVJSQVlfQlVGRkVSLCAwLCByKVxuXHRcdH1cblxuXHRcdGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgdGhpcy5ub3JtYWxUZXh0dXJlLmZyYW1lQnVmZmVyKTtcblx0XHRnbC5jbGVhckNvbG9yKC41LCAuNSwgMSwgMSk7XG5cdFx0Z2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCk7XG5cdFx0dGhpcy5yZW5kZXJTcHJpdGUodGhpcy5saWdodFNoYWRlciwgdHJ1ZSk7XG5cblx0XHRnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIHRoaXMuZGlmZnVzZVRleHR1cmUuZnJhbWVCdWZmZXIpO1xuXHRcdGdsLmNsZWFyQ29sb3IoMCwgMCwgMCwgMCk7XG5cdFx0Z2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCk7XG5cdFx0dGhpcy5yZW5kZXJTcHJpdGUodGhpcy5kaWZmdXNlU2hhZGVyLCBmYWxzZSk7XG5cblx0XHQvKi8gVE9ET1xuXHRcdGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgdGhpcy5vY2NsdWRlcnNGQk8uZnJhbWVCdWZmZXIpO1xuXHRcdGdsLmNsZWFyQ29sb3IoMCwgMCwgMCwgMCk7XG5cdFx0Z2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCk7XG5cdFx0dGhpcy5yZW5kZXJTcHJpdGUodGhpcy5vY2NsdWRlcnNTaGFkZXIsIGZhbHNlKTtcblx0XHQqL1xuXG5cdFx0Z2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCB0aGlzLnJlbmRlclNlc3Npb24uYnVmZmVyKTtcblxuXHRcdHRoaXMuY3VycmVudEJhdGNoU2l6ZSA9IDA7XG5cdH1cbn1cblxuTGlnaHRTcHJpdGVCYXRjaC5wcm90b3R5cGUucmVuZGVyU3ByaXRlID0gZnVuY3Rpb24odCwgaXNOb3JtYWxNYXApIHtcblx0dmFyIGksIHIsIG8sIG4sXG5cdFx0Z2wgPSB0aGlzLmdsLFxuXHRcdGEgPSAwLFxuXHRcdGggPSAwLFxuXHRcdGwgPSBudWxsLFxuXHRcdHUgPSB0aGlzLnJlbmRlclNlc3Npb24uYmxlbmRNb2RlTWFuYWdlci5jdXJyZW50QmxlbmRNb2RlLFxuXHRcdGMgPSB0LFxuXHRcdHAgPSAhMSxcblx0XHRkID0gITE7XG5cblx0dGhpcy5yZW5kZXJTZXNzaW9uLnNoYWRlck1hbmFnZXIuc2V0U2hhZGVyKGMpO1xuXHRjLmRpcnR5ICYmIGMuc3luY1VuaWZvcm1zKCk7XG5cblx0dmFyIGYgPSB0aGlzLnJlbmRlclNlc3Npb24ucHJvamVjdGlvbjtcblx0Z2wudW5pZm9ybTJmKGMucHJvamVjdGlvblZlY3RvciwgZi54LCBmLnkpO1xuXG5cdHZhciBtID0gdGhpcy5yZW5kZXJTZXNzaW9uLm9mZnNldDtcblx0Z2wudW5pZm9ybTJmKGMub2Zmc2V0VmVjdG9yLCBtLngsIG0ueSk7XG5cdGdsLnVuaWZvcm0xZihjLmZsaXBZLCAtMSk7XG5cblx0Zm9yICh2YXIgdiA9IDAsIGcgPSB0aGlzLmN1cnJlbnRCYXRjaFNpemU7IGcgPiB2OyB2KyspIHtcblx0XHRuID0gdGhpcy5zcHJpdGVzW3ZdO1xuXHRcdGkgPSBpc05vcm1hbE1hcCA/IG4ubm9ybWFsTWFwLmJhc2VUZXh0dXJlIDogbi50ZXh0dXJlLmJhc2VUZXh0dXJlO1xuXHRcdHAgPSB1ICE9PSByO1xuXHRcdGQgPSBjICE9PSBvO1xuXHRcdGlmIChsICE9PSBpKSB7XG5cdFx0XHR0aGlzLnJlbmRlckJhdGNoKGwsIGEsIGgpO1xuXHRcdFx0aCA9IHY7XG5cdFx0XHRhID0gMDtcblx0XHRcdGwgPSBpO1xuXHRcdH1cblx0XHRhKys7XG5cdH1cblx0dGhpcy5yZW5kZXJCYXRjaChsLCBhLCBoKVxufVxuXG5MaWdodFNwcml0ZUJhdGNoLnByb3RvdHlwZS5yZW5kZXJCYXRjaCA9IGZ1bmN0aW9uKHQsIGUsIGkpIHtcblx0aWYgKDAgIT09IGUpIHtcblx0XHR2YXIgZ2wgPSB0aGlzLmdsO1xuXHRcdGlmICh0Ll9kaXJ0eVtnbC5pZF0pIHtcblx0XHRcdHRoaXMucmVuZGVyU2Vzc2lvbi5yZW5kZXJlci51cGRhdGVUZXh0dXJlKHQpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGdsLmFjdGl2ZVRleHR1cmUoZ2wuVEVYVFVSRTApO1xuXHRcdFx0Z2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdC5fZ2xUZXh0dXJlc1tnbC5pZF0pO1xuXHRcdH1cblx0XHRnbC5kcmF3RWxlbWVudHMoZ2wuVFJJQU5HTEVTLCA2ICogZSwgZ2wuVU5TSUdORURfU0hPUlQsIDYgKiBpICogMik7XG5cdFx0dGhpcy5yZW5kZXJTZXNzaW9uLmRyYXdDb3VudCsrXG5cdH1cbn1cblxuTGlnaHRTcHJpdGVCYXRjaC5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLmZsdXNoKCk7XG5cdHRoaXMuZGlydHkgPSAhMFxufVxuXG5MaWdodFNwcml0ZUJhdGNoLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLmRpcnR5ID0gITBcbn1cblxuTGlnaHRTcHJpdGVCYXRjaC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLnZlcnRpY2VzID0gbnVsbDtcblx0dGhpcy5pbmRpY2VzID0gbnVsbDsgdGhpcy5nbC5kZWxldGVCdWZmZXIodGhpcy52ZXJ0ZXhCdWZmZXIpOyB0aGlzLmdsLmRlbGV0ZUJ1ZmZlcih0aGlzLmluZGV4QnVmZmVyKTtcblx0dGhpcy5jdXJyZW50QmFzZVRleHR1cmUgPSBudWxsO1xuXHR0aGlzLmdsID0gbnVsbFxufVxuXG4vLyBtb2R1bGUuZXhwb3J0cyA9IExpZ2h0U3ByaXRlQmF0Y2hcbiIsIid1c2Ugc3RyaWN0JztcblxuLy92YXIgciA9IHQoXCJQSVhJXCIpO1xuXG52YXIgTm9ybWFsTWFwRmlsdGVyID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0KSB7XG5cdFBJWEkuQWJzdHJhY3RGaWx0ZXIuY2FsbCh0aGlzKTtcblx0dGhpcy5wYXNzZXMgPSBbdGhpc107XG5cdHRoaXMudW5pZm9ybXMgPSB7XG5cdFx0ZGlzcGxhY2VtZW50TWFwOiB7XG5cdFx0XHR0eXBlOiBcInNhbXBsZXIyRFwiLFxuXHRcdFx0dmFsdWU6IHRcblx0XHR9LFxuXHRcdHNjYWxlOiB7XG5cdFx0XHR0eXBlOiBcIjJmXCIsXG5cdFx0XHR2YWx1ZToge1xuXHRcdFx0XHR4OiAxLFxuXHRcdFx0XHR5OiAxXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRvZmZzZXQ6IHtcblx0XHRcdHR5cGU6IFwiMmZcIixcblx0XHRcdHZhbHVlOiB7XG5cdFx0XHRcdHg6IDAsXG5cdFx0XHRcdHk6IDBcblx0XHRcdH1cblx0XHR9LFxuXHRcdG1hcERpbWVuc2lvbnM6IHtcblx0XHRcdHR5cGU6IFwiMmZcIixcblx0XHRcdHZhbHVlOiB7XG5cdFx0XHRcdHg6IDEsXG5cdFx0XHRcdHk6IDFcblx0XHRcdH1cblx0XHR9LFxuXHRcdHpvb21TY2FsZToge1xuXHRcdFx0dHlwZTogXCIyZlwiLFxuXHRcdFx0dmFsdWU6IHtcblx0XHRcdFx0eDogMSxcblx0XHRcdFx0eTogMVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0ZGltZW5zaW9uczoge1xuXHRcdFx0dHlwZTogXCI0ZnZcIixcblx0XHRcdHZhbHVlOiBbMCwgMCwgMCwgMF1cblx0XHR9LFxuXHRcdExpZ2h0UG9zOiB7XG5cdFx0XHR0eXBlOiBcIjNmdlwiLFxuXHRcdFx0dmFsdWU6IFsxLCAxLCAuMV1cblx0XHR9XG5cdH07XG5cblx0aWYgKHQuYmFzZVRleHR1cmUuaGFzTG9hZGVkKSB7XG5cdFx0dGhpcy51bmlmb3Jtcy5tYXBEaW1lbnNpb25zLnZhbHVlLnggPSB0LndpZHRoO1xuXHRcdHRoaXMudW5pZm9ybXMubWFwRGltZW5zaW9ucy52YWx1ZS55ID0gdC5oZWlnaHQ7XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5ib3VuZExvYWRlZEZ1bmN0aW9uID0gdGhpcy5vblRleHR1cmVMb2FkZWQuYmluZCh0aGlzKTtcblx0XHR0LmJhc2VUZXh0dXJlLm9uKFwibG9hZGVkXCIsIHRoaXMuYm91bmRMb2FkZWRGdW5jdGlvbik7XG5cdH1cblxuXHR0aGlzLmZyYWdtZW50U3JjID0gW1xuXHRcdFwicHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XCIsXG5cdFx0XCJ2YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZDtcIixcblx0XHRcInZhcnlpbmcgdmVjNCB2Q29sb3I7XCIsXG5cdFx0XCJ1bmlmb3JtIHNhbXBsZXIyRCB1U2FtcGxlcjtcIixcblx0XHRcInVuaWZvcm0gc2FtcGxlcjJEIGRpc3BsYWNlbWVudE1hcDtcIixcblx0XHRcInVuaWZvcm0gdmVjNCBkaW1lbnNpb25zO1wiLFxuXHRcdFwiY29uc3QgdmVjMiBSZXNvbHV0aW9uID0gdmVjMigxLjAsMS4wKTtcIixcblx0XHRcInVuaWZvcm0gdmVjMyBMaWdodFBvcztcIixcblx0XHRcImNvbnN0IHZlYzQgTGlnaHRDb2xvciA9IHZlYzQoMC45LCAyNDEuMC8yNTUuMCwgMjI0LjAvMjU1LjAsIDEuMCk7XCIsXG5cdFx0XCJjb25zdCB2ZWM0IEFtYmllbnRDb2xvciA9IHZlYzQoMC45LCAyNDEuMC8yNTUuMCwgMjI0LjAvMjU1LjAsIDAuMyk7XCIsXG5cdFx0XCJjb25zdCB2ZWMzIEZhbGxvZmYgPSB2ZWMzKDAuMCwgMC4xLCAwLjQpO1wiLFxuXHRcdFwidW5pZm9ybSB2ZWMzIExpZ2h0RGlyO1wiLFxuXHRcdFwidW5pZm9ybSB2ZWMyIG1hcERpbWVuc2lvbnM7XCIsXG5cdFx0XCJ1bmlmb3JtIHZlYzIgem9vbVNjYWxlO1wiLFxuXHRcdFwidm9pZCBtYWluKHZvaWQpIHtcIixcblx0XHRcIiAgICB2ZWMyIG1hcENvcmRzID0gdlRleHR1cmVDb29yZC54eTtcIixcblx0XHRcIiAgICB2ZWM0IGNvbG9yID0gdGV4dHVyZTJEKHVTYW1wbGVyLCB2VGV4dHVyZUNvb3JkLnN0KTtcIixcblx0XHRcIiAgICB2ZWMzIG5Db2xvciA9IHRleHR1cmUyRChkaXNwbGFjZW1lbnRNYXAsIHZUZXh0dXJlQ29vcmQuc3QpLnJnYjtcIixcblx0XHRcIiAgICBtYXBDb3JkcyAqPSBkaW1lbnNpb25zLnh5L21hcERpbWVuc2lvbnM7XCIsXG5cdFx0XCIgICAgdmVjNCBEaWZmdXNlQ29sb3IgPSB0ZXh0dXJlMkQoZGlzcGxhY2VtZW50TWFwLCB2VGV4dHVyZUNvb3JkKTtcIixcblx0XHRcIiAgICB2ZWMzIE5vcm1hbE1hcCA9IHRleHR1cmUyRCh1U2FtcGxlciwgdlRleHR1cmVDb29yZCkucmdiO1wiLFxuXHRcdFwiICAgIHZlYzMgTGlnaHREaXIgPSB2ZWMzKChMaWdodFBvcy54eS9tYXBEaW1lbnNpb25zKSAtICh2VGV4dHVyZUNvb3JkLnh5KSwgTGlnaHRQb3Mueik7XCIsXG5cdFx0XCIgICAgZmxvYXQgRCA9IGxlbmd0aChMaWdodERpcik7XCIsXG5cdFx0XCIgICAgdmVjMyBOID0gbm9ybWFsaXplKE5vcm1hbE1hcCAqIDIuMCAtIDEuMCk7XCIsXG5cdFx0XCIgICAgdmVjMyBMID0gbm9ybWFsaXplKExpZ2h0RGlyKTtcIixcblx0XHRcIiAgICB2ZWMzIERpZmZ1c2UgPSAoTGlnaHRDb2xvci5yZ2IgKiBMaWdodENvbG9yLmEpICogbWF4KGRvdChOLCBMKSwgMC4wKSAqIDEuMDtcIixcblx0XHRcIiAgICB2ZWMzIEFtYmllbnQgPSBBbWJpZW50Q29sb3IucmdiICogQW1iaWVudENvbG9yLmE7XCIsXG5cdFx0XCIgICAgZmxvYXQgQXR0ZW51YXRpb24gPSAwLjIvRDtcIixcblx0XHRcIiAgICBBdHRlbnVhdGlvbiA9IG1pbihBdHRlbnVhdGlvbiwgMS4wKTtcIixcblx0XHRcIiAgICB2ZWMzIEludGVuc2l0eSA9IChEaWZmdXNlICogQXR0ZW51YXRpb24pICsgQW1iaWVudDtcIixcblx0XHRcIiAgICB2ZWMzIEZpbmFsQ29sb3IgPSBEaWZmdXNlQ29sb3IucmdiICogSW50ZW5zaXR5O1wiLFxuXHRcdFwiICAgIGdsX0ZyYWdDb2xvciA9IHZDb2xvciAqIHZlYzQoRmluYWxDb2xvciwgRGlmZnVzZUNvbG9yLmEpO1wiLFxuXHRcdFwifVwiXG5cdF07XG5cbn1cbk5vcm1hbE1hcEZpbHRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBJWEkuQWJzdHJhY3RGaWx0ZXIucHJvdG90eXBlKTtcbk5vcm1hbE1hcEZpbHRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOb3JtYWxNYXBGaWx0ZXI7XG5Ob3JtYWxNYXBGaWx0ZXIucHJvdG90eXBlLm9uVGV4dHVyZUxvYWRlZCA9IGZ1bmN0aW9uKCkge1xuXHR0aGlzLnVuaWZvcm1zLm1hcERpbWVuc2lvbnMudmFsdWUueCA9IHRoaXMudW5pZm9ybXMuZGlzcGxhY2VtZW50TWFwLnZhbHVlLndpZHRoO1xuXHR0aGlzLnVuaWZvcm1zLm1hcERpbWVuc2lvbnMudmFsdWUueSA9IHRoaXMudW5pZm9ybXMuZGlzcGxhY2VtZW50TWFwLnZhbHVlLmhlaWdodDtcblx0dGhpcy51bmlmb3Jtcy5kaXNwbGFjZW1lbnRNYXAudmFsdWUuYmFzZVRleHR1cmUub2ZmKFwibG9hZGVkXCIsIHRoaXMuYm91bmRMb2FkZWRGdW5jdGlvbik7XG59XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTm9ybWFsTWFwRmlsdGVyLnByb3RvdHlwZSwgXCJtYXBcIiwge1xuXHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLnVuaWZvcm1zLmRpc3BsYWNlbWVudE1hcC52YWx1ZVxuXHR9LFxuXHRzZXQ6IGZ1bmN0aW9uKHQpIHtcblx0XHR0aGlzLnVuaWZvcm1zLmRpc3BsYWNlbWVudE1hcC52YWx1ZSA9IHRcblx0fVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTm9ybWFsTWFwRmlsdGVyLnByb3RvdHlwZSwgXCJzY2FsZVwiLCB7XG5cdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMudW5pZm9ybXMuc2NhbGUudmFsdWVcblx0fSxcblx0c2V0OiBmdW5jdGlvbih0KSB7XG5cdFx0dGhpcy51bmlmb3Jtcy5zY2FsZS52YWx1ZSA9IHRcblx0fVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTm9ybWFsTWFwRmlsdGVyLnByb3RvdHlwZSwgXCJvZmZzZXRcIiwge1xuXHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLnVuaWZvcm1zLm9mZnNldC52YWx1ZVxuXHR9LFxuXHRzZXQ6IGZ1bmN0aW9uKHQpIHtcblx0XHR0aGlzLnVuaWZvcm1zLm9mZnNldC52YWx1ZSA9IHRcblx0fVxufSk7XG5cbi8vbW9kdWxlLmV4cG9ydHMgPSBOb3JtYWxNYXBGaWx0ZXJcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEJsb2NrID0gZnVuY3Rpb24oKSB7XG5cdC8qKiBAbWVtYmVyIHtGbG9hdH0gKi9cblx0dGhpcy54ID0gMC4wO1xuXHQvKiogQG1lbWJlciB7RmxvYXR9ICovXG5cdHRoaXMueSA9IDAuMDtcblx0LyoqIEBtZW1iZXIge0Zsb2F0fSAqL1xuXHR0aGlzLnIgPSAwLjA7XG59XG5cbnZhciBQb2ludCA9IGZ1bmN0aW9uKHgsIHkpIHtcblx0LyoqIEBtZW1iZXIge0Zsb2F0fSAqL1xuXHR0aGlzLnggPSB4O1xuXHQvKiogQG1lbWJlciB7RmxvYXR9ICovXG5cdHRoaXMueSA9IHk7XG59XG5cbnZhciBFbmRQb2ludCA9IGZ1bmN0aW9uKHgsIHkpIHtcblx0LyoqIEBtZW1iZXIge0Zsb2F0fSAqL1xuXHR0aGlzLnggPSB4O1xuXHQvKiogQG1lbWJlciB7RmxvYXR9ICovXG5cdHRoaXMueSA9IHk7XG5cdC8qKiBAbWVtYmVyIHtCb29sfSAqL1xuXHR0aGlzLmJlZ2luID0gZmFsc2U7XG5cdC8qKiBAbWVtYmVyIHtTZWdtZW50fSAqL1xuXHR0aGlzLnNlZ21lbnQgPSBudWxsO1xuXHQvKiogQG1lbWJlciB7RmxvYXR9ICovXG5cdHRoaXMuYW5nbGUgPSAwLjA7XG5cdC8qKiBAbWVtYmVyIHtCb29sfSAqL1xuXHR0aGlzLnZpc3VhbGl6ZSA9IGZhbHNlO1xufVxuXG52YXIgU2VnbWVudCA9IGZ1bmN0aW9uKCkge1xuXHQvKiogQG1lbWJlciB7RW5kUG9pbnR9ICovXG5cdHRoaXMucDEgPSBuZXcgRW5kUG9pbnQoMCwgMCk7XG5cdC8qKiBAbWVtYmVyIHtFbmRQb2ludH0gKi9cblx0dGhpcy5wMiA9IG5ldyBFbmRQb2ludCgwLCAwKTtcblx0LyoqIEBtZW1iZXIge0Zsb2F0fSAqL1xuXHR0aGlzLmQgPSAwLjA7XG59XG5cbi8qKiBAY29uc3RydWN0b3IgKi9cbnZhciBWaXNpYmlsaXR5ID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcblx0Ly8gVGhlc2UgcmVwcmVzZW50IHRoZSBtYXAgYW5kIHRoZSBsaWdodCBsb2NhdGlvbjpcblx0LyoqIEBtZW1iZXIge0FycmF5fSAtIEFycmF5IG9mIFNlZ21lbnQgKi9cblx0dGhpcy5zZWdtZW50cyA9IFtdO1xuXHQvKiogQG1lbWJlciB7QXJyYXl9IC0gQXJyYXkgb2YgRW5kUG9pbnQgKi9cblx0dGhpcy5lbmRwb2ludHMgPSBbXTtcblx0LyoqIEBtZW1iZXIge1BvaW50fSAqL1xuXHR0aGlzLmNlbnRlciA9IG5ldyBQb2ludCgwLCAwKTtcblxuXHQvLyBUaGVzZSBhcmUgY3VycmVudGx5ICdvcGVuJyBsaW5lIHNlZ21lbnRzLCBzb3J0ZWQgc28gdGhhdCB0aGUgbmVhcmVzdFxuXHQvLyBzZWdtZW50IGlzIGZpcnN0LiBJdCdzIHVzZWQgb25seSBkdXJpbmcgdGhlIHN3ZWVwIGFsZ29yaXRobSwgYW5kIGV4cG9zZWRcblx0Ly8gYXMgYSBwdWJsaWMgZmllbGQgaGVyZSBzbyB0aGF0IHRoZSBkZW1vIGNhbiBkaXNwbGF5IGl0LlxuXHQvKiogQG1lbWJlciB7QXJyYXl9IC0gQXJyYXkgb2YgU2VnbWVudCovXG5cdHRoaXMub3BlbiA9IG5ldyBkZV9wb2x5Z29uYWxfZHNfRExMKCk7XG5cblx0Ly8gVGhlIG91dHB1dCBpcyBhIHNlcmllcyBvZiBwb2ludHMgdGhhdCBmb3JtcyBhIHZpc2libGUgYXJlYSBwb2x5Z29uXG5cdC8qKiBAbWVtYmVyIHtBcnJheX0gLSBBcnJheSBvZiBQb2ludCovXG5cdHRoaXMub3V0cHV0ID0gW107XG5cblx0Ly8gRm9yIHRoZSBkZW1vLCBrZWVwIHRyYWNrIG9mIHdhbGwgaW50ZXJzZWN0aW9uc1xuXHQvKiogQG1lbWJlciB7QXJyYXl9IC0gQXJyYXkgb2YgQXJyYXkgb2YgUG9pbnQqL1xuXHR0aGlzLmRlbW9faW50ZXJzZWN0aW9uc0RldGVjdGVkID0gW107XG59O1xuXG4vKipcbiAqIEhlbHBlcjogY29tcGFyaXNvbiBmdW5jdGlvbiBmb3Igc29ydGluZyBwb2ludHMgYnkgYW5nbGVcbiAqIEBwYXJhbSB7RW5kUG9pbnR9IGFcbiAqIEBwYXJhbSB7RW5kUG9pbnR9IGJcbiAqIEByZXR1cm4ge0ludH1cbiAqIEBzdGF0aWNcbiAqIEBwcml2YXRlXG4gKi9cblZpc2liaWxpdHkuX2VuZHBvaW50X2NvbXBhcmUgPSBmdW5jdGlvbihhLCBiKSB7XG5cdC8vIFRyYXZlcnNlIGluIGFuZ2xlIG9yZGVyXG5cdGlmIChhLmFuZ2xlID4gYi5hbmdsZSkgcmV0dXJuIDE7XG5cdGlmIChhLmFuZ2xlIDwgYi5hbmdsZSkgcmV0dXJuIC0xO1xuXHQvLyBCdXQgZm9yIHRpZXMgKGNvbW1vbiksIHdlIHdhbnQgQmVnaW4gbm9kZXMgYmVmb3JlIEVuZCBub2Rlc1xuXHRpZiAoIWEuYmVnaW4gJiYgYi5iZWdpbikgcmV0dXJuIDE7XG5cdGlmIChhLmJlZ2luICYmICFiLmJlZ2luKSByZXR1cm4gLTE7XG5cdHJldHVybiAwO1xufTtcblxuLyoqXG4gKiBIZWxwZXI6IGxlZnRPZihzZWdtZW50LCBwb2ludCkgcmV0dXJucyB0cnVlIGlmIHBvaW50IGlzIFwibGVmdFwiXG4gKiBvZiBzZWdtZW50IHRyZWF0ZWQgYXMgYSB2ZWN0b3IuIE5vdGUgdGhhdCB0aGlzIGFzc3VtZXMgYSAyRFxuICogY29vcmRpbmF0ZSBzeXN0ZW0gaW4gd2hpY2ggdGhlIFkgYXhpcyBncm93cyBkb3dud2FyZHMsIHdoaWNoXG4gKiBtYXRjaGVzIGNvbW1vbiAyRCBncmFwaGljcyBsaWJyYXJpZXMsIGJ1dCBpcyB0aGUgb3Bwb3NpdGUgb2ZcbiAqIHRoZSB1c3VhbCBjb252ZW50aW9uIGZyb20gbWF0aGVtYXRpY3MgYW5kIGluIDNEIGdyYXBoaWNzXG4gKiBsaWJyYXJpZXMuXG4gKiBAcGFyYW0ge1NlZ21lbnR9IHNcbiAqIEBwYXJhbSB7UG9pbnR9IHBcbiAqIEByZXR1cm4ge0Jvb2x9XG4gKiBAc3RhdGljXG4gKiBAcHJpdmF0ZVxuICovXG5WaXNpYmlsaXR5LmxlZnRPZiA9IGZ1bmN0aW9uKHMsIHApIHtcblx0Ly8gVGhpcyBpcyBiYXNlZCBvbiBhIDNkIGNyb3NzIHByb2R1Y3QsIGJ1dCB3ZSBkb24ndCBuZWVkIHRvXG5cdC8vIHVzZSB6IGNvb3JkaW5hdGUgaW5wdXRzICh0aGV5J3JlIDApLCBhbmQgd2Ugb25seSBuZWVkIHRoZVxuXHQvLyBzaWduLiBJZiB5b3UncmUgYW5ub3llZCB0aGF0IGNyb3NzIHByb2R1Y3QgaXMgb25seSBkZWZpbmVkXG5cdC8vIGluIDNkLCBzZWUgXCJvdXRlciBwcm9kdWN0XCIgaW4gR2VvbWV0cmljIEFsZ2VicmEuXG5cdC8vIDxodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0dlb21ldHJpY19hbGdlYnJhPlxuXHR2YXIgY3Jvc3MgPSAocy5wMi54IC0gcy5wMS54KSAqIChwLnkgLSBzLnAxLnkpIC0gKHMucDIueSAtIHMucDEueSkgKiAocC54IC0gcy5wMS54KTtcblx0cmV0dXJuIGNyb3NzIDwgMDtcblx0Ly8gQWxzbyBub3RlIHRoYXQgdGhpcyBpcyB0aGUgbmFpdmUgdmVyc2lvbiBvZiB0aGUgdGVzdCBhbmRcblx0Ly8gaXNuJ3QgbnVtZXJpY2FsbHkgcm9idXN0LiBTZWVcblx0Ly8gPGh0dHBzOi8vZ2l0aHViLmNvbS9taWtvbGFseXNlbmtvL3JvYnVzdC1hcml0aG1ldGljPiBmb3IgYVxuXHQvLyBkZW1vIG9mIGhvdyB0aGlzIGZhaWxzIHdoZW4gYSBwb2ludCBpcyB2ZXJ5IGNsb3NlIHRvIHRoZVxuXHQvLyBsaW5lLlxufTtcblxuLyoqXG4gKiBSZXR1cm4gcCooMS1mKSArIHEqZlxuICogQHBhcmFtIHtQb2ludH0gcFxuICogQHBhcmFtIHtQb2ludH0gcVxuICogQHBhcmFtIHtGbG9hdH0gZlxuICogQHJldHVybiB7UG9pbnR9XG4gKiBAcHJpdmF0ZVxuICogQHN0YXRpY1xuICovXG5WaXNpYmlsaXR5LmludGVycG9sYXRlID0gZnVuY3Rpb24ocCwgcSwgZikge1xuXHRyZXR1cm4gbmV3IFBvaW50KHAueCAqICgxIC0gZikgKyBxLnggKiBmLCBwLnkgKiAoMSAtIGYpICsgcS55ICogZik7XG59O1xuXG5WaXNpYmlsaXR5LnByb3RvdHlwZSA9IHtcblx0LyoqXG5cdCAqIEhlbHBlciBmdW5jdGlvbiB0byBjb25zdHJ1Y3Qgc2VnbWVudHMgYWxvbmcgdGhlIG91dHNpZGUgcGVyaW1ldGVyXG5cdCAqIEBwYXJhbSB7SW50fSBzaXplXG5cdCAqIEBwYXJhbSB7SW50fSBtYXJnaW5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdGxvYWRFZGdlT2ZNYXA6IGZ1bmN0aW9uKHNpemUsIG1hcmdpbikge1xuXHRcdHRoaXMuYWRkU2VnbWVudChtYXJnaW4sIG1hcmdpbiwgbWFyZ2luLCBzaXplIC0gbWFyZ2luKTtcblx0XHR0aGlzLmFkZFNlZ21lbnQobWFyZ2luLCBzaXplIC0gbWFyZ2luLCBzaXplIC0gbWFyZ2luLCBzaXplIC0gbWFyZ2luKTtcblx0XHR0aGlzLmFkZFNlZ21lbnQoc2l6ZSAtIG1hcmdpbiwgc2l6ZSAtIG1hcmdpbiwgc2l6ZSAtIG1hcmdpbiwgbWFyZ2luKTtcblx0XHR0aGlzLmFkZFNlZ21lbnQoc2l6ZSAtIG1hcmdpbiwgbWFyZ2luLCBtYXJnaW4sIG1hcmdpbik7XG5cdFx0Ly8gTk9URTogaWYgdXNpbmcgdGhlIHNpbXBsZXIgZGlzdGFuY2UgZnVuY3Rpb24gKGEuZCA8IGIuZClcblx0XHQvLyB0aGVuIHdlIG5lZWQgc2VnbWVudHMgdG8gYmUgc2ltaWxhcmx5IHNpemVkLCBzbyB0aGUgZWRnZSBvZlxuXHRcdC8vIHRoZSBtYXAgbmVlZHMgdG8gYmUgYnJva2VuIHVwIGludG8gc21hbGxlciBzZWdtZW50cy5cblx0fSxcblxuXG5cdC8qKlxuXHQgKiBMb2FkIGEgc2V0IG9mIHNxdWFyZSBibG9ja3MsIHBsdXMgYW55IG90aGVyIGxpbmUgc2VnbWVudHNcblx0ICogQHBhcmFtIHNpemVcblx0ICogQHBhcmFtIG1hcmdpblxuXHQgKiBAcGFyYW0ge0FycmF5fSBibG9ja3MgLSBBcnJheSBvZiBCbG9ja1xuXHQgKiBAcGFyYW0ge0FycmF5fSB3YWxscyAtIEFycmF5IG9mIFNlZ21lbnRcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0bG9hZE1hcDogZnVuY3Rpb24oc2l6ZSwgbWFyZ2luLCBibG9ja3MsIHdhbGxzKSB7XG5cdFx0dGhpcy5zZWdtZW50cyA9IFtdO1xuXHRcdHRoaXMuZW5kcG9pbnRzID0gW107XG5cdFx0dGhpcy5sb2FkRWRnZU9mTWFwKHNpemUsIG1hcmdpbik7XG5cblx0XHRmb3IgKHZhciBpID0gMCwgbCA9IGJsb2Nrcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0XHRcdHZhciBibG9jayA9IGJsb2Nrc1tpXTtcblx0XHRcdHZhciB4ID0gYmxvY2sueDtcblx0XHRcdHZhciB5ID0gYmxvY2sueTtcblx0XHRcdHZhciB3ID0gYmxvY2suciB8fCBibG9jay53aWR0aDtcblx0XHRcdHZhciBoID0gYmxvY2suciB8fCBibG9jay5oZWlnaHQ7XG5cblx0XHRcdC8qXG5cdFx0XHR0aGlzLmFkZFNlZ21lbnQoeCAtIHIsIHkgLSByLCB4IC0gciwgeSArIHIpO1xuXHRcdFx0dGhpcy5hZGRTZWdtZW50KHggLSByLCB5ICsgciwgeCArIHIsIHkgKyByKTtcblx0XHRcdHRoaXMuYWRkU2VnbWVudCh4ICsgciwgeSArIHIsIHggKyByLCB5IC0gcik7XG5cdFx0XHR0aGlzLmFkZFNlZ21lbnQoeCArIHIsIHkgLSByLCB4IC0gciwgeSAtIHIpO1xuXHRcdFx0Ki9cblx0XHRcdC8qXG5cdFx0XHR0aGlzLmFkZFNlZ21lbnQoeCAtIHcsIHkgLSBoLCB4IC0gdywgeSArIGgpO1xuXHRcdFx0dGhpcy5hZGRTZWdtZW50KHggLSB3LCB5ICsgaCwgeCArIHcsIHkgKyBoKTtcblx0XHRcdHRoaXMuYWRkU2VnbWVudCh4ICsgdywgeSArIGgsIHggKyB3LCB5IC0gaCk7XG5cdFx0XHR0aGlzLmFkZFNlZ21lbnQoeCArIHcsIHkgLSBoLCB4IC0gdywgeSAtIGgpO1xuXHRcdFx0Ki9cblx0XHRcdHRoaXMuYWRkU2VnbWVudCh4LCB5LCB4LCB5ICsgaCk7XG5cdFx0XHR0aGlzLmFkZFNlZ21lbnQoeCwgeSArIGgsIHggKyB3LCB5ICsgaCk7XG5cdFx0XHR0aGlzLmFkZFNlZ21lbnQoeCArIHcsIHkgKyBoLCB4ICsgdywgeSk7XG5cdFx0XHR0aGlzLmFkZFNlZ21lbnQoeCArIHcsIHksIHgsIHkpO1xuXHRcdH1cblxuXHRcdGZvciAodmFyIGkgPSAwLCBsID0gd2FsbHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdFx0XHR2YXIgd2FsbCA9IHdhbGxzW2ldO1xuXHRcdFx0dGhpcy5hZGRTZWdtZW50KHdhbGwucDEueCwgd2FsbC5wMS55LCB3YWxsLnAyLngsIHdhbGwucDIueSk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBBZGQgYSBzZWdtZW50LCB3aGVyZSB0aGUgZmlyc3QgcG9pbnQgc2hvd3MgdXAgaW4gdGhlXG5cdCAqIHZpc3VhbGl6YXRpb24gYnV0IHRoZSBzZWNvbmQgb25lIGRvZXMgbm90LiAoRXZlcnkgZW5kcG9pbnQgaXNcblx0ICogcGFydCBvZiB0d28gc2VnbWVudHMsIGJ1dCB3ZSB3YW50IHRvIG9ubHkgc2hvdyB0aGVtIG9uY2UuKVxuXHQgKiBAcGFyYW0ge0Zsb2F0fSB4MVxuXHQgKiBAcGFyYW0ge0Zsb2F0fSB5MVxuXHQgKiBAcGFyYW0ge0Zsb2F0fSB4MlxuXHQgKiBAcGFyYW0ge0Zsb2F0fSB5MlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0YWRkU2VnbWVudDogZnVuY3Rpb24oeDEsIHkxLCB4MiwgeTIpIHtcblx0XHR2YXIgc2VnbWVudCA9IG5ldyBTZWdtZW50KCk7XG5cblx0XHR2YXIgcDEgPSBuZXcgRW5kUG9pbnQoMC4wLCAwLjApO1xuXHRcdHAxLnNlZ21lbnQgPSBzZWdtZW50O1xuXHRcdHAxLnZpc3VhbGl6ZSA9IHRydWU7XG5cblx0XHR2YXIgcDIgPSBuZXcgRW5kUG9pbnQoMC4wLCAwLjApO1xuXHRcdHAyLnNlZ21lbnQgPSBzZWdtZW50O1xuXHRcdHAyLnZpc3VhbGl6ZSA9IGZhbHNlO1xuXG5cdFx0cDEueCA9IHgxO1xuXHRcdHAxLnkgPSB5MTtcblx0XHRwMi54ID0geDI7XG5cdFx0cDIueSA9IHkyO1xuXG5cdFx0c2VnbWVudC5wMSA9IHAxO1xuXHRcdHNlZ21lbnQucDIgPSBwMjtcblx0XHRzZWdtZW50LmQgPSAwLjA7XG5cblx0XHR0aGlzLnNlZ21lbnRzLnB1c2goc2VnbWVudCk7XG5cdFx0dGhpcy5lbmRwb2ludHMucHVzaChwMSk7XG5cdFx0dGhpcy5lbmRwb2ludHMucHVzaChwMik7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFNldCB0aGUgbGlnaHQgbG9jYXRpb24uIFNlZ21lbnQgYW5kIEVuZFBvaW50IGRhdGEgY2FuJ3QgYmVcblx0ICogcHJvY2Vzc2VkIHVudGlsIHRoZSBsaWdodCBsb2NhdGlvbiBpcyBrbm93bi5cblx0ICogQHBhcmFtIHtGbG9hdH0geFxuXHQgKiBAcGFyYW0ge0Zsb2F0fSB5XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHNldExpZ2h0TG9jYXRpb246IGZ1bmN0aW9uKHgsIHkpIHtcblx0XHR0aGlzLmNlbnRlci54ID0geDtcblx0XHR0aGlzLmNlbnRlci55ID0geTtcblxuXHRcdGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5zZWdtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0XHRcdHZhciBzZWdtZW50ID0gdGhpcy5zZWdtZW50c1tpXTtcblxuXHRcdFx0dmFyIGR4ID0gMC41ICogKHNlZ21lbnQucDEueCArIHNlZ21lbnQucDIueCkgLSB4O1xuXHRcdFx0dmFyIGR5ID0gMC41ICogKHNlZ21lbnQucDEueSArIHNlZ21lbnQucDIueSkgLSB5O1xuXHRcdFx0Ly8gTk9URTogd2Ugb25seSB1c2UgdGhpcyBmb3IgY29tcGFyaXNvbiBzbyB3ZSBjYW4gdXNlXG5cdFx0XHQvLyBkaXN0YW5jZSBzcXVhcmVkIGluc3RlYWQgb2YgZGlzdGFuY2UuIEhvd2V2ZXIgaW5cblx0XHRcdC8vIHByYWN0aWNlIHRoZSBzcXJ0IGlzIHBsZW50eSBmYXN0IGFuZCB0aGlzIGRvZXNuJ3Rcblx0XHRcdC8vIHJlYWxseSBoZWxwIGluIHRoaXMgc2l0dWF0aW9uLlxuXHRcdFx0c2VnbWVudC5kID0gZHggKiBkeCArIGR5ICogZHk7XG5cblx0XHRcdC8vIE5PVEU6IGZ1dHVyZSBvcHRpbWl6YXRpb246IHdlIGNvdWxkIHJlY29yZCB0aGUgcXVhZHJhbnRcblx0XHRcdC8vIGFuZCB0aGUgeS94IG9yIHgveSByYXRpbywgYW5kIHNvcnQgYnkgKHF1YWRyYW50LFxuXHRcdFx0Ly8gcmF0aW8pLCBpbnN0ZWFkIG9mIGNhbGxpbmcgYXRhbjIuIFNlZVxuXHRcdFx0Ly8gPGh0dHBzOi8vZ2l0aHViLmNvbS9taWtvbGFseXNlbmtvL2NvbXBhcmUtc2xvcGU+IGZvciBhXG5cdFx0XHQvLyBsaWJyYXJ5IHRoYXQgZG9lcyB0aGlzLiBBbHRlcm5hdGl2ZWx5LCBjYWxjdWxhdGUgdGhlXG5cdFx0XHQvLyBhbmdsZXMgYW5kIHVzZSBidWNrZXQgc29ydCB0byBnZXQgYW4gTyhOKSBzb3J0LlxuXHRcdFx0c2VnbWVudC5wMS5hbmdsZSA9IE1hdGguYXRhbjIoc2VnbWVudC5wMS55IC0geSwgc2VnbWVudC5wMS54IC0geCk7XG5cdFx0XHRzZWdtZW50LnAyLmFuZ2xlID0gTWF0aC5hdGFuMihzZWdtZW50LnAyLnkgLSB5LCBzZWdtZW50LnAyLnggLSB4KTtcblxuXHRcdFx0dmFyIGRBbmdsZSA9IHNlZ21lbnQucDIuYW5nbGUgLSBzZWdtZW50LnAxLmFuZ2xlO1xuXHRcdFx0aWYgKGRBbmdsZSA8PSAtTWF0aC5QSSkge1xuXHRcdFx0XHRkQW5nbGUgKz0gMiAqIE1hdGguUEk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoZEFuZ2xlID4gTWF0aC5QSSkge1xuXHRcdFx0XHRkQW5nbGUgLT0gMiAqIE1hdGguUEk7XG5cdFx0XHR9XG5cdFx0XHRzZWdtZW50LnAxLmJlZ2luID0gKGRBbmdsZSA+IDAuMCk7XG5cdFx0XHRzZWdtZW50LnAyLmJlZ2luID0gIXNlZ21lbnQucDEuYmVnaW47XG5cdFx0fVxuXHR9LFxuXG5cblxuXG5cblxuXHQvKipcblx0ICogUnVuIHRoZSBhbGdvcml0aG0sIHN3ZWVwaW5nIG92ZXIgYWxsIG9yIHBhcnQgb2YgdGhlIGNpcmNsZSB0byBmaW5kXG5cdCAqIHRoZSB2aXNpYmxlIGFyZWEsIHJlcHJlc2VudGVkIGFzIGEgc2V0IG9mIHRyaWFuZ2xlc1xuXHQgKiBAcHVibGljXG5cdCAqIEBwYXJhbSB7RmxvYXR9IG1heEFuZ2xlXG5cdCAqL1xuXHRzd2VlcDogZnVuY3Rpb24obWF4QW5nbGUpIHtcblx0XHRpZiAobWF4QW5nbGUgPT0gbnVsbCkge1xuXHRcdFx0bWF4QW5nbGUgPSA5OTkuMDtcblx0XHR9XG5cdFx0dGhpcy5vdXRwdXQgPSBbXTtcblx0XHR0aGlzLmRlbW9faW50ZXJzZWN0aW9uc0RldGVjdGVkID0gW107XG5cdFx0dGhpcy5lbmRwb2ludHMuc29ydChWaXNpYmlsaXR5Ll9lbmRwb2ludF9jb21wYXJlLCB0cnVlKTtcblx0XHR0aGlzLm9wZW4uY2xlYXIoKTtcblx0XHR2YXIgYmVnaW5BbmdsZSA9IDAuMDtcblxuXHRcdC8vdmFyIG9wZW4gPSB0aGlzLm9wZW4udG9BcnJheSgpO1xuXHRcdC8vdmFyIG9wZW4gPSB0aGlzLm9wZW4gPSBbXTtcblxuXG5cdFx0Ly8gQXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgc3dlZXAgd2Ugd2FudCB0byBrbm93IHdoaWNoXG5cdFx0Ly8gc2VnbWVudHMgYXJlIGFjdGl2ZS4gVGhlIHNpbXBsZXN0IHdheSB0byBkbyB0aGlzIGlzIHRvIG1ha2Vcblx0XHQvLyBhIHBhc3MgY29sbGVjdGluZyB0aGUgc2VnbWVudHMsIGFuZCBtYWtlIGFub3RoZXIgcGFzcyB0b1xuXHRcdC8vIGJvdGggY29sbGVjdCBhbmQgcHJvY2VzcyB0aGVtLiBIb3dldmVyIGl0IHdvdWxkIGJlIG1vcmVcblx0XHQvLyBlZmZpY2llbnQgdG8gZ28gdGhyb3VnaCBhbGwgdGhlIHNlZ21lbnRzLCBmaWd1cmUgb3V0IHdoaWNoXG5cdFx0Ly8gb25lcyBpbnRlcnNlY3QgdGhlIGluaXRpYWwgc3dlZXAgbGluZSwgYW5kIHRoZW4gc29ydCB0aGVtLlxuXHRcdGZvciAodmFyIHBhc3MgPSAwOyBwYXNzIDwgMjsgcGFzcysrKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMuZW5kcG9pbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuXHRcdFx0XHR2YXIgcCA9IHRoaXMuZW5kcG9pbnRzW2ldO1xuXG5cdFx0XHRcdC8vIEVhcmx5IGV4aXQgZm9yIHRoZSB2aXN1YWxpemF0aW9uIHRvIHNob3cgdGhlIHN3ZWVwIHByb2Nlc3Ncblx0XHRcdFx0aWYgKHBhc3MgPT0gMSAmJiBwLmFuZ2xlID4gbWF4QW5nbGUpIGJyZWFrO1xuXG5cdFx0XHRcdHZhciBjdXJyZW50X29sZCA9IG51bGw7XG5cdFx0XHRcdGlmICh0aGlzLm9wZW4uX3NpemUgIT09IDApIHtcblx0XHRcdFx0XHRjdXJyZW50X29sZCA9IHRoaXMub3Blbi5oZWFkLnZhbDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChwLmJlZ2luKSB7XG5cdFx0XHRcdFx0Ly8gSW5zZXJ0IGludG8gdGhlIHJpZ2h0IHBsYWNlIGluIHRoZSBsaXN0XG5cdFx0XHRcdFx0dmFyIG5vZGUgPSB0aGlzLm9wZW4uaGVhZDtcblx0XHRcdFx0XHQvL3ZhciBub2RlID0gb3BlblswXTtcblxuXHRcdFx0XHRcdGZvciAoOyBub2RlICE9IG51bGw7IG5vZGUgPSBub2RlLm5leHQpIHtcblx0XHRcdFx0XHRcdGlmICghdGhpcy5fc2VnbWVudF9pbl9mcm9udF9vZihwLnNlZ21lbnQsIG5vZGUudmFsLCB0aGlzLmNlbnRlcikpIHtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCFub2RlKSB7XG5cdFx0XHRcdFx0XHR0aGlzLm9wZW4uYXBwZW5kKHAuc2VnbWVudCk7XG5cdFx0XHRcdFx0Ly9vcGVuLnB1c2gocC5zZWdtZW50KTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhpcy5vcGVuLmluc2VydEJlZm9yZShub2RlLCBwLnNlZ21lbnQpO1xuXHRcdFx0XHRcdFx0Ly9vcGVuLnNwbGljZShvcGVuLmluZGV4T2Yobm9kZSksIDAsIHAuc2VnbWVudCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMub3Blbi5yZW1vdmUocC5zZWdtZW50KTtcblx0XHRcdFx0XHQvL29wZW4uc3BsaWNlKG9wZW4uaW5kZXhPZihwLnNlZ21lbnQpLCAxKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHZhciBjdXJyZW50X25ldyA9IG51bGw7XG5cdFx0XHRcdGlmICh0aGlzLm9wZW4uX3NpemUgIT09IDApIHtcblx0XHRcdFx0XHRjdXJyZW50X25ldyA9IHRoaXMub3Blbi5oZWFkLnZhbDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChjdXJyZW50X29sZCAhPSBjdXJyZW50X25ldykge1xuXHRcdFx0XHRcdGlmIChwYXNzID09IDEpIHtcblx0XHRcdFx0XHRcdHRoaXMuYWRkVHJpYW5nbGUoYmVnaW5BbmdsZSwgcC5hbmdsZSwgY3VycmVudF9vbGQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRiZWdpbkFuZ2xlID0gcC5hbmdsZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXG5cdC8qKlxuXHQgKiBIZWxwZXI6IGRvIHdlIGtub3cgdGhhdCBzZWdtZW50IGEgaXMgaW4gZnJvbnQgb2YgYj9cblx0ICogSW1wbGVtZW50YXRpb24gbm90IGFudGktc3ltbWV0cmljICh0aGF0IGlzIHRvIHNheSxcblx0ICogX3NlZ21lbnRfaW5fZnJvbnRfb2YoYSwgYikgIT0gKCFfc2VnbWVudF9pbl9mcm9udF9vZihiLCBhKSkuXG5cdCAqIEFsc28gbm90ZSB0aGF0IGl0IG9ubHkgaGFzIHRvIHdvcmsgaW4gYSByZXN0cmljdGVkIHNldCBvZiBjYXNlc1xuXHQgKiBpbiB0aGUgdmlzaWJpbGl0eSBhbGdvcml0aG07IEkgZG9uJ3QgdGhpbmsgaXQgaGFuZGxlcyBhbGxcblx0ICogY2FzZXMuIFNlZSBodHRwOi8vd3d3LnJlZGJsb2JnYW1lcy5jb20vYXJ0aWNsZXMvdmlzaWJpbGl0eS9zZWdtZW50LXNvcnRpbmcuaHRtbFxuXHQgKiBAcGFyYW0ge1NlZ21lbnR9IGFcblx0ICogQHBhcmFtIHtTZWdtZW50fSBiXG5cdCAqIEBwYXJhbSB7UG9pbnR9IHJlbGF0aXZlVG9cblx0ICogQHJldHVybiB7Qm9vbH1cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9zZWdtZW50X2luX2Zyb250X29mOiBmdW5jdGlvbihhLCBiLCByZWxhdGl2ZVRvKSB7XG5cdFx0dmFyIGxlZnRPZiA9IFZpc2liaWxpdHkubGVmdE9mO1xuXHRcdHZhciBpbnRlcnBvbGF0ZSA9IFZpc2liaWxpdHkuaW50ZXJwb2xhdGU7XG5cblx0XHQvLyBOT1RFOiB3ZSBzbGlnaHRseSBzaG9ydGVuIHRoZSBzZWdtZW50cyBzbyB0aGF0XG5cdFx0Ly8gaW50ZXJzZWN0aW9ucyBvZiB0aGUgZW5kcG9pbnRzIChjb21tb24pIGRvbid0IGNvdW50IGFzXG5cdFx0Ly8gaW50ZXJzZWN0aW9ucyBpbiB0aGlzIGFsZ29yaXRobVxuXHRcdHZhciBBMSA9IGxlZnRPZihhLCBpbnRlcnBvbGF0ZShiLnAxLCBiLnAyLCAwLjAxKSk7XG5cdFx0dmFyIEEyID0gbGVmdE9mKGEsIGludGVycG9sYXRlKGIucDIsIGIucDEsIDAuMDEpKTtcblx0XHR2YXIgQTMgPSBsZWZ0T2YoYSwgcmVsYXRpdmVUbyk7XG5cdFx0dmFyIEIxID0gbGVmdE9mKGIsIGludGVycG9sYXRlKGEucDEsIGEucDIsIDAuMDEpKTtcblx0XHR2YXIgQjIgPSBsZWZ0T2YoYiwgaW50ZXJwb2xhdGUoYS5wMiwgYS5wMSwgMC4wMSkpO1xuXHRcdHZhciBCMyA9IGxlZnRPZihiLCByZWxhdGl2ZVRvKTtcblxuXHRcdC8vIE5PVEU6IHRoaXMgYWxnb3JpdGhtIGlzIHByb2JhYmx5IHdvcnRoeSBvZiBhIHNob3J0IGFydGljbGVcblx0XHQvLyBidXQgZm9yIG5vdywgZHJhdyBpdCBvbiBwYXBlciB0byBzZWUgaG93IGl0IHdvcmtzLiBDb25zaWRlclxuXHRcdC8vIHRoZSBsaW5lIEExLUEyLiBJZiBib3RoIEIxIGFuZCBCMiBhcmUgb24gb25lIHNpZGUgYW5kXG5cdFx0Ly8gcmVsYXRpdmVUbyBpcyBvbiB0aGUgb3RoZXIgc2lkZSwgdGhlbiBBIGlzIGluIGJldHdlZW4gdGhlXG5cdFx0Ly8gdmlld2VyIGFuZCBCLiBXZSBjYW4gZG8gdGhlIHNhbWUgd2l0aCBCMS1CMjogaWYgQTEgYW5kIEEyXG5cdFx0Ly8gYXJlIG9uIG9uZSBzaWRlLCBhbmQgcmVsYXRpdmVUbyBpcyBvbiB0aGUgb3RoZXIgc2lkZSwgdGhlblxuXHRcdC8vIEIgaXMgaW4gYmV0d2VlbiB0aGUgdmlld2VyIGFuZCBBLlxuXHRcdGlmIChCMSA9PSBCMiAmJiBCMiAhPSBCMykgcmV0dXJuIHRydWU7XG5cdFx0aWYgKEExID09IEEyICYmIEEyID09IEEzKSByZXR1cm4gdHJ1ZTtcblx0XHRpZiAoQTEgPT0gQTIgJiYgQTIgIT0gQTMpIHJldHVybiBmYWxzZTtcblx0XHRpZiAoQjEgPT0gQjIgJiYgQjIgPT0gQjMpIHJldHVybiBmYWxzZTtcblxuXHRcdC8vIElmIEExICE9IEEyIGFuZCBCMSAhPSBCMiB0aGVuIHdlIGhhdmUgYW4gaW50ZXJzZWN0aW9uLlxuXHRcdC8vIEV4cG9zZSBpdCBmb3IgdGhlIEdVSSB0byBzaG93IGEgbWVzc2FnZS4gQSBtb3JlIHJvYnVzdFxuXHRcdC8vIGltcGxlbWVudGF0aW9uIHdvdWxkIHNwbGl0IHNlZ21lbnRzIGF0IGludGVyc2VjdGlvbnMgc29cblx0XHQvLyB0aGF0IHBhcnQgb2YgdGhlIHNlZ21lbnQgaXMgaW4gZnJvbnQgYW5kIHBhcnQgaXMgYmVoaW5kLlxuXHRcdHRoaXMuZGVtb19pbnRlcnNlY3Rpb25zRGV0ZWN0ZWQucHVzaChbYS5wMSwgYS5wMiwgYi5wMSwgYi5wMl0pO1xuXHRcdHJldHVybiBmYWxzZTtcblxuXHRcdC8vIE5PVEU6IHByZXZpb3VzIGltcGxlbWVudGF0aW9uIHdhcyBhLmQgPCBiLmQuIFRoYXQncyBzaW1wbGVyXG5cdFx0Ly8gYnV0IHRyb3VibGUgd2hlbiB0aGUgc2VnbWVudHMgYXJlIG9mIGRpc3NpbWlsYXIgc2l6ZXMuIElmXG5cdFx0Ly8geW91J3JlIG9uIGEgZ3JpZCBhbmQgdGhlIHNlZ21lbnRzIGFyZSBzaW1pbGFybHkgc2l6ZWQsIHRoZW5cblx0XHQvLyB1c2luZyBkaXN0YW5jZSB3aWxsIGJlIGEgc2ltcGxlciBhbmQgZmFzdGVyIGltcGxlbWVudGF0aW9uLlxuXHR9LFxuXG5cblx0LyoqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7RmxvYXR9IGFuZ2xlMVxuXHQgKiBAcGFyYW0ge0Zsb2F0fSBhbmdsZTJcblx0ICogQHBhcmFtIHtTZWdtZW50fSBzZWdtZW50XG5cdCAqL1xuXHRhZGRUcmlhbmdsZTogZnVuY3Rpb24oYW5nbGUxLCBhbmdsZTIsIHNlZ21lbnQpIHtcblx0XHR2YXIgY2VudGVyID0gdGhpcy5jZW50ZXI7XG5cblx0XHR2YXIgcDEgPSBjZW50ZXI7XG5cdFx0dmFyIHAyID0gbmV3IFBvaW50KGNlbnRlci54ICsgTWF0aC5jb3MoYW5nbGUxKSwgY2VudGVyLnkgKyBNYXRoLnNpbihhbmdsZTEpKTtcblx0XHR2YXIgcDMgPSBuZXcgUG9pbnQoMC4wLCAwLjApO1xuXHRcdHZhciBwNCA9IG5ldyBQb2ludCgwLjAsIDAuMCk7XG5cblx0XHRpZiAoc2VnbWVudCAhPSBudWxsKSB7XG5cdFx0XHQvLyBTdG9wIHRoZSB0cmlhbmdsZSBhdCB0aGUgaW50ZXJzZWN0aW5nIHNlZ21lbnRcblx0XHRcdHAzLnggPSBzZWdtZW50LnAxLng7XG5cdFx0XHRwMy55ID0gc2VnbWVudC5wMS55O1xuXHRcdFx0cDQueCA9IHNlZ21lbnQucDIueDtcblx0XHRcdHA0LnkgPSBzZWdtZW50LnAyLnk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIFN0b3AgdGhlIHRyaWFuZ2xlIGF0IGEgZml4ZWQgZGlzdGFuY2U7IHRoaXMgcHJvYmFibHkgaXNcblx0XHRcdC8vIG5vdCB3aGF0IHdlIHdhbnQsIGJ1dCBpdCBuZXZlciBnZXRzIHVzZWQgaW4gdGhlIGRlbW9cblx0XHRcdHAzLnggPSBjZW50ZXIueCArIE1hdGguY29zKGFuZ2xlMSkgKiA1MDA7XG5cdFx0XHRwMy55ID0gY2VudGVyLnkgKyBNYXRoLnNpbihhbmdsZTEpICogNTAwO1xuXHRcdFx0cDQueCA9IGNlbnRlci54ICsgTWF0aC5jb3MoYW5nbGUyKSAqIDUwMDtcblx0XHRcdHA0LnkgPSBjZW50ZXIueSArIE1hdGguc2luKGFuZ2xlMikgKiA1MDA7XG5cdFx0fVxuXG5cdFx0dmFyIHBCZWdpbiA9IHRoaXMubGluZUludGVyc2VjdGlvbihwMywgcDQsIHAxLCBwMik7XG5cblx0XHRwMi54ID0gY2VudGVyLnggKyBNYXRoLmNvcyhhbmdsZTIpO1xuXHRcdHAyLnkgPSBjZW50ZXIueSArIE1hdGguc2luKGFuZ2xlMik7XG5cdFx0dmFyIHBFbmQgPSB0aGlzLmxpbmVJbnRlcnNlY3Rpb24ocDMsIHA0LCBwMSwgcDIpO1xuXG5cdFx0dGhpcy5vdXRwdXQucHVzaChwQmVnaW4pO1xuXHRcdHRoaXMub3V0cHV0LnB1c2gocEVuZCk7XG5cdH0sXG5cblxuXHQvKipcblx0ICogQHB1YmxpY1xuXHQgKiBAcGFyYW0ge1BvaW50fSBwMVxuXHQgKiBAcGFyYW0ge1BvaW50fSBwMlxuXHQgKiBAcGFyYW0ge1BvaW50fSBwM1xuXHQgKiBAcGFyYW0ge1BvaW50fSBwNFxuXHQgKiBAcmV0dXJuIHtQb2ludH1cblx0ICovXG5cdGxpbmVJbnRlcnNlY3Rpb246IGZ1bmN0aW9uKHAxLCBwMiwgcDMsIHA0KSB7XG5cdFx0Ly8gRnJvbSBodHRwOi8vcGF1bGJvdXJrZS5uZXQvZ2VvbWV0cnkvbGluZWxpbmUyZC9cblx0XHR2YXIgcyA9ICgocDQueCAtIHAzLngpICogKHAxLnkgLSBwMy55KSAtIChwNC55IC0gcDMueSkgKiAocDEueCAtIHAzLngpKSAvICgocDQueSAtIHAzLnkpICogKHAyLnggLSBwMS54KSAtIChwNC54IC0gcDMueCkgKiAocDIueSAtIHAxLnkpKTtcblx0XHRyZXR1cm4gbmV3IFBvaW50KHAxLnggKyBzICogKHAyLnggLSBwMS54KSwgcDEueSArIHMgKiAocDIueSAtIHAxLnkpKTtcblx0fSxcblxufTtcblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxudmFyIGRlX3BvbHlnb25hbF9kc19ETEwgPSBmdW5jdGlvbihyZXNlcnZlZFNpemUsIG1heFNpemUpIHtcblx0aWYgKG1heFNpemUgPT0gbnVsbCkge1xuXHRcdG1heFNpemUgPSAtMTtcblx0fVxuXHRpZiAocmVzZXJ2ZWRTaXplID09IG51bGwpIHtcblx0XHRyZXNlcnZlZFNpemUgPSAwO1xuXHR9XG5cdHRoaXMubWF4U2l6ZSA9IC0xO1xuXHR0aGlzLl9yZXNlcnZlZFNpemUgPSByZXNlcnZlZFNpemU7XG5cdHRoaXMuX3NpemUgPSAwO1xuXHR0aGlzLl9wb29sU2l6ZSA9IDA7XG5cdHRoaXMuX2NpcmN1bGFyID0gZmFsc2U7XG5cdHRoaXMuX2l0ZXJhdG9yID0gbnVsbDtcblx0aWYgKHJlc2VydmVkU2l6ZSA+IDApIHtcblx0XHR0aGlzLl9oZWFkUG9vbCA9IHRoaXMuX3RhaWxQb29sID0gbmV3IGRlX3BvbHlnb25hbF9kc19ETExOb2RlKG51bGwsIHRoaXMpO1xuXHR9XG5cdHRoaXMuaGVhZCA9IHRoaXMudGFpbCA9IG51bGw7XG5cdHRoaXMua2V5ID0gZGVfcG9seWdvbmFsX2RzX0hhc2hLZXkuX2NvdW50ZXIrKztcblx0dGhpcy5yZXVzZUl0ZXJhdG9yID0gZmFsc2U7XG59O1xuZGVfcG9seWdvbmFsX2RzX0RMTC5wcm90b3R5cGUgPSB7XG5cdGFwcGVuZDogZnVuY3Rpb24oeCkge1xuXHRcdHZhciBub2RlID0gdGhpcy5fZ2V0Tm9kZSh4KTtcblx0XHRpZiAodGhpcy50YWlsICE9IG51bGwpIHtcblx0XHRcdHRoaXMudGFpbC5uZXh0ID0gbm9kZTtcblx0XHRcdG5vZGUucHJldiA9IHRoaXMudGFpbDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5oZWFkID0gbm9kZTtcblx0XHR9XG5cdFx0dGhpcy50YWlsID0gbm9kZTtcblx0XHRpZiAodGhpcy5fY2lyY3VsYXIpIHtcblx0XHRcdHRoaXMudGFpbC5uZXh0ID0gdGhpcy5oZWFkO1xuXHRcdFx0dGhpcy5oZWFkLnByZXYgPSB0aGlzLnRhaWw7XG5cdFx0fVxuXHRcdHRoaXMuX3NpemUrKztcblx0XHRyZXR1cm4gbm9kZTtcblx0fSxcblx0aW5zZXJ0QmVmb3JlOiBmdW5jdGlvbihub2RlLCB4KSB7XG5cdFx0dmFyIHQgPSB0aGlzLl9nZXROb2RlKHgpO1xuXHRcdG5vZGUuX2luc2VydEJlZm9yZSh0KTtcblx0XHRpZiAobm9kZSA9PSB0aGlzLmhlYWQpIHtcblx0XHRcdHRoaXMuaGVhZCA9IHQ7XG5cdFx0XHRpZiAodGhpcy5fY2lyY3VsYXIpIHtcblx0XHRcdFx0dGhpcy5oZWFkLnByZXYgPSB0aGlzLnRhaWw7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRoaXMuX3NpemUrKztcblx0XHRyZXR1cm4gdDtcblx0fSxcblx0dW5saW5rOiBmdW5jdGlvbihub2RlKSB7XG5cdFx0dmFyIGhvb2sgPSBub2RlLm5leHQ7XG5cdFx0aWYgKG5vZGUgPT0gdGhpcy5oZWFkKSB7XG5cdFx0XHR0aGlzLmhlYWQgPSB0aGlzLmhlYWQubmV4dDtcblx0XHRcdGlmICh0aGlzLl9jaXJjdWxhcikge1xuXHRcdFx0XHRpZiAodGhpcy5oZWFkID09IHRoaXMudGFpbCkge1xuXHRcdFx0XHRcdHRoaXMuaGVhZCA9IG51bGw7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy50YWlsLm5leHQgPSB0aGlzLmhlYWQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLmhlYWQgPT0gbnVsbCkge1xuXHRcdFx0XHR0aGlzLnRhaWwgPSBudWxsO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAobm9kZSA9PSB0aGlzLnRhaWwpIHtcblx0XHRcdHRoaXMudGFpbCA9IHRoaXMudGFpbC5wcmV2O1xuXHRcdFx0aWYgKHRoaXMuX2NpcmN1bGFyKSB7XG5cdFx0XHRcdHRoaXMuaGVhZC5wcmV2ID0gdGhpcy50YWlsO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMudGFpbCA9PSBudWxsKSB7XG5cdFx0XHRcdHRoaXMuaGVhZCA9IG51bGw7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdG5vZGUuX3VubGluaygpO1xuXHRcdHRoaXMuX3B1dE5vZGUobm9kZSk7XG5cdFx0dGhpcy5fc2l6ZS0tO1xuXHRcdHJldHVybiBob29rO1xuXHR9LFxuXHRzb3J0OiBmdW5jdGlvbihjb21wYXJlLCB1c2VJbnNlcnRpb25Tb3J0KSB7XG5cdFx0aWYgKHVzZUluc2VydGlvblNvcnQgPT0gbnVsbCkge1xuXHRcdFx0dXNlSW5zZXJ0aW9uU29ydCA9IGZhbHNlO1xuXHRcdH1cblx0XHRpZiAodGhpcy5fc2l6ZSA+IDEpIHtcblx0XHRcdGlmICh0aGlzLl9jaXJjdWxhcikge1xuXHRcdFx0XHR0aGlzLnRhaWwubmV4dCA9IG51bGw7XG5cdFx0XHRcdHRoaXMuaGVhZC5wcmV2ID0gbnVsbDtcblx0XHRcdH1cblx0XHRcdGlmIChjb21wYXJlID09IG51bGwpXG5cdFx0XHRcdGlmICh1c2VJbnNlcnRpb25Tb3J0KSB7XG5cdFx0XHRcdFx0dGhpcy5oZWFkID0gdGhpcy5faW5zZXJ0aW9uU29ydENvbXBhcmFibGUodGhpcy5oZWFkKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLmhlYWQgPSB0aGlzLl9tZXJnZVNvcnRDb21wYXJhYmxlKHRoaXMuaGVhZCk7XG5cdFx0XHR9ZWxzZSBpZiAodXNlSW5zZXJ0aW9uU29ydCkge1xuXHRcdFx0XHR0aGlzLmhlYWQgPSB0aGlzLl9pbnNlcnRpb25Tb3J0KHRoaXMuaGVhZCwgY29tcGFyZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmhlYWQgPSB0aGlzLl9tZXJnZVNvcnQodGhpcy5oZWFkLCBjb21wYXJlKTtcblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLl9jaXJjdWxhcikge1xuXHRcdFx0XHR0aGlzLnRhaWwubmV4dCA9IHRoaXMuaGVhZDtcblx0XHRcdFx0dGhpcy5oZWFkLnByZXYgPSB0aGlzLnRhaWw7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRyZW1vdmU6IGZ1bmN0aW9uKHgpIHtcblx0XHR2YXIgcyA9IHRoaXMuX3NpemU7XG5cdFx0aWYgKHMgPT0gMCkgcmV0dXJuIGZhbHNlO1xuXHRcdHZhciBub2RlID0gdGhpcy5oZWFkO1xuXHRcdHdoaWxlIChub2RlICE9IG51bGwpXG5cdFx0aWYgKG5vZGUudmFsID09IHgpIHtcblx0XHRcdFx0bm9kZSA9IHRoaXMudW5saW5rKG5vZGUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bm9kZSA9IG5vZGUubmV4dDtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX3NpemUgPCBzO1xuXHR9LFxuXHRjbGVhcjogZnVuY3Rpb24ocHVyZ2UpIHtcblx0XHRpZiAocHVyZ2UgPT0gbnVsbCkge1xuXHRcdFx0cHVyZ2UgPSBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKHB1cmdlIHx8IHRoaXMuX3Jlc2VydmVkU2l6ZSA+IDApIHtcblx0XHRcdHZhciBub2RlID0gdGhpcy5oZWFkO1xuXHRcdFx0dmFyIF9nMSA9IDA7XG5cdFx0XHR2YXIgX2cgPSB0aGlzLl9zaXplO1xuXHRcdFx0d2hpbGUgKF9nMSA8IF9nKSB7XG5cdFx0XHRcdHZhciBpID0gX2cxKys7XG5cdFx0XHRcdHZhciBuZXh0ID0gbm9kZS5uZXh0O1xuXHRcdFx0XHRub2RlLnByZXYgPSBudWxsO1xuXHRcdFx0XHRub2RlLm5leHQgPSBudWxsO1xuXHRcdFx0XHR0aGlzLl9wdXROb2RlKG5vZGUpO1xuXHRcdFx0XHRub2RlID0gbmV4dDtcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5oZWFkID0gdGhpcy50YWlsID0gbnVsbDtcblx0XHR0aGlzLl9zaXplID0gMDtcblx0fSxcblx0aXRlcmF0b3I6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICh0aGlzLnJldXNlSXRlcmF0b3IpIHtcblx0XHRcdGlmICh0aGlzLl9pdGVyYXRvciA9PSBudWxsKSB7XG5cdFx0XHRcdGlmICh0aGlzLl9jaXJjdWxhcikgcmV0dXJuIG5ldyBkZV9wb2x5Z29uYWxfZHNfQ2lyY3VsYXJETExJdGVyYXRvcih0aGlzKTsgZWxzZSByZXR1cm4gbmV3IGRlX3BvbHlnb25hbF9kc19ETExJdGVyYXRvcih0aGlzKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuX2l0ZXJhdG9yLnJlc2V0KCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGhpcy5faXRlcmF0b3I7XG5cdFx0fSBlbHNlIGlmICh0aGlzLl9jaXJjdWxhcikgcmV0dXJuIG5ldyBkZV9wb2x5Z29uYWxfZHNfQ2lyY3VsYXJETExJdGVyYXRvcih0aGlzKTsgZWxzZSByZXR1cm4gbmV3IGRlX3BvbHlnb25hbF9kc19ETExJdGVyYXRvcih0aGlzKTtcblx0fSxcblx0dG9BcnJheTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGEgPSBuZXcgQXJyYXkodGhpcy5fc2l6ZSk7XG5cdFx0dmFyIG5vZGUgPSB0aGlzLmhlYWQ7XG5cdFx0dmFyIF9nMSA9IDA7XG5cdFx0dmFyIF9nID0gdGhpcy5fc2l6ZTtcblx0XHR3aGlsZSAoX2cxIDwgX2cpIHtcblx0XHRcdHZhciBpID0gX2cxKys7XG5cdFx0XHRhW2ldID0gbm9kZS52YWw7XG5cdFx0XHRub2RlID0gbm9kZS5uZXh0O1xuXHRcdH1cblx0XHRyZXR1cm4gYTtcblx0fSxcblx0X21lcmdlU29ydDogZnVuY3Rpb24obm9kZSwgY21wKSB7XG5cdFx0dmFyIGggPSBub2RlO1xuXHRcdHZhciBwO1xuXHRcdHZhciBxO1xuXHRcdHZhciBlO1xuXHRcdHZhciB0YWlsID0gbnVsbDtcblx0XHR2YXIgaW5zaXplID0gMTtcblx0XHR2YXIgbm1lcmdlcztcblx0XHR2YXIgcHNpemU7XG5cdFx0dmFyIHFzaXplO1xuXHRcdHZhciBpO1xuXHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHRwID0gaDtcblx0XHRcdGggPSB0YWlsID0gbnVsbDtcblx0XHRcdG5tZXJnZXMgPSAwO1xuXHRcdFx0d2hpbGUgKHAgIT0gbnVsbCkge1xuXHRcdFx0XHRubWVyZ2VzKys7XG5cdFx0XHRcdHBzaXplID0gMDtcblx0XHRcdFx0cSA9IHA7XG5cdFx0XHRcdHZhciBfZyA9IDA7XG5cdFx0XHRcdHdoaWxlIChfZyA8IGluc2l6ZSkge1xuXHRcdFx0XHRcdHZhciBpMSA9IF9nKys7XG5cdFx0XHRcdFx0cHNpemUrKztcblx0XHRcdFx0XHRxID0gcS5uZXh0O1xuXHRcdFx0XHRcdGlmIChxID09IG51bGwpIGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHFzaXplID0gaW5zaXplO1xuXHRcdFx0XHR3aGlsZSAocHNpemUgPiAwIHx8IHFzaXplID4gMCAmJiBxICE9IG51bGwpIHtcblx0XHRcdFx0XHRpZiAocHNpemUgPT0gMCkge1xuXHRcdFx0XHRcdFx0ZSA9IHE7XG5cdFx0XHRcdFx0XHRxID0gcS5uZXh0O1xuXHRcdFx0XHRcdFx0cXNpemUtLTtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHFzaXplID09IDAgfHwgcSA9PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRlID0gcDtcblx0XHRcdFx0XHRcdHAgPSBwLm5leHQ7XG5cdFx0XHRcdFx0XHRwc2l6ZS0tO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoY21wKHEudmFsLCBwLnZhbCkgPj0gMCkge1xuXHRcdFx0XHRcdFx0ZSA9IHA7XG5cdFx0XHRcdFx0XHRwID0gcC5uZXh0O1xuXHRcdFx0XHRcdFx0cHNpemUtLTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZSA9IHE7XG5cdFx0XHRcdFx0XHRxID0gcS5uZXh0O1xuXHRcdFx0XHRcdFx0cXNpemUtLTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHRhaWwgIT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0dGFpbC5uZXh0ID0gZTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0aCA9IGU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGUucHJldiA9IHRhaWw7XG5cdFx0XHRcdFx0dGFpbCA9IGU7XG5cdFx0XHRcdH1cblx0XHRcdFx0cCA9IHE7XG5cdFx0XHR9XG5cdFx0XHR0YWlsLm5leHQgPSBudWxsO1xuXHRcdFx0aWYgKG5tZXJnZXMgPD0gMSkgYnJlYWs7XG5cdFx0XHRpbnNpemUgPDw9IDE7XG5cdFx0fVxuXHRcdGgucHJldiA9IG51bGw7XG5cdFx0dGhpcy50YWlsID0gdGFpbDtcblx0XHRyZXR1cm4gaDtcblx0fSxcblx0X2luc2VydGlvblNvcnQ6IGZ1bmN0aW9uKG5vZGUsIGNtcCkge1xuXHRcdHZhciBoID0gbm9kZTtcblx0XHR2YXIgbiA9IGgubmV4dDtcblx0XHR3aGlsZSAobiAhPSBudWxsKSB7XG5cdFx0XHR2YXIgbSA9IG4ubmV4dDtcblx0XHRcdHZhciBwID0gbi5wcmV2O1xuXHRcdFx0dmFyIHYgPSBuLnZhbDtcblx0XHRcdGlmIChjbXAodiwgcC52YWwpIDwgMCkge1xuXHRcdFx0XHR2YXIgaSA9IHA7XG5cdFx0XHRcdHdoaWxlIChpLnByZXYgIT0gbnVsbClcblx0XHRcdFx0aWYgKGNtcCh2LCBpLnByZXYudmFsKSA8IDApIHtcblx0XHRcdFx0XHRcdGkgPSBpLnByZXY7XG5cdFx0XHRcdFx0fSBlbHNlIGJyZWFrO1xuXHRcdFx0XHRpZiAobSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0cC5uZXh0ID0gbTtcblx0XHRcdFx0XHRtLnByZXYgPSBwO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHAubmV4dCA9IG51bGw7XG5cdFx0XHRcdFx0dGhpcy50YWlsID0gcDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoaSA9PSBoKSB7XG5cdFx0XHRcdFx0bi5wcmV2ID0gbnVsbDtcblx0XHRcdFx0XHRuLm5leHQgPSBpO1xuXHRcdFx0XHRcdGkucHJldiA9IG47XG5cdFx0XHRcdFx0aCA9IG47XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bi5wcmV2ID0gaS5wcmV2O1xuXHRcdFx0XHRcdGkucHJldi5uZXh0ID0gbjtcblx0XHRcdFx0XHRuLm5leHQgPSBpO1xuXHRcdFx0XHRcdGkucHJldiA9IG47XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdG4gPSBtO1xuXHRcdH1cblx0XHRyZXR1cm4gaDtcblx0fSxcblx0X2dldE5vZGU6IGZ1bmN0aW9uKHgpIHtcblx0XHRpZiAodGhpcy5fcmVzZXJ2ZWRTaXplID09IDAgfHwgdGhpcy5fcG9vbFNpemUgPT0gMCkgcmV0dXJuIG5ldyBkZV9wb2x5Z29uYWxfZHNfRExMTm9kZSh4LCB0aGlzKTsgZWxzZSB7XG5cdFx0XHR2YXIgbiA9IHRoaXMuX2hlYWRQb29sO1xuXHRcdFx0dGhpcy5faGVhZFBvb2wgPSB0aGlzLl9oZWFkUG9vbC5uZXh0O1xuXHRcdFx0dGhpcy5fcG9vbFNpemUtLTtcblx0XHRcdG4ubmV4dCA9IG51bGw7XG5cdFx0XHRuLnZhbCA9IHg7XG5cdFx0XHRyZXR1cm4gbjtcblx0XHR9XG5cdH0sXG5cdF9wdXROb2RlOiBmdW5jdGlvbih4KSB7XG5cdFx0dmFyIHZhbCA9IHgudmFsO1xuXHRcdGlmICh0aGlzLl9yZXNlcnZlZFNpemUgPiAwICYmIHRoaXMuX3Bvb2xTaXplIDwgdGhpcy5fcmVzZXJ2ZWRTaXplKSB7XG5cdFx0XHR0aGlzLl90YWlsUG9vbCA9IHRoaXMuX3RhaWxQb29sLm5leHQgPSB4O1xuXHRcdFx0eC52YWwgPSBudWxsO1xuXHRcdFx0dGhpcy5fcG9vbFNpemUrKztcblx0XHR9IGVsc2Uge1xuXHRcdFx0eC5fbGlzdCA9IG51bGw7XG5cdFx0fVxuXHRcdHJldHVybiB2YWw7XG5cdH0sXG5cdF9fY2xhc3NfXzogZGVfcG9seWdvbmFsX2RzX0RMTFxufTtcblxudmFyIGRlX3BvbHlnb25hbF9kc19ETExJdGVyYXRvciA9IGZ1bmN0aW9uKGYpIHtcblx0dGhpcy5fZiA9IGY7e1xuXHR0aGlzLl93YWxrZXIgPSB0aGlzLl9mLmhlYWQ7XG5cdHRoaXMuX2hvb2sgPSBudWxsO1xuXHR0aGlzO1xuXHR9XG59O1xuZGVfcG9seWdvbmFsX2RzX0RMTEl0ZXJhdG9yLnByb3RvdHlwZSA9IHtcblx0cmVzZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuX3dhbGtlciA9IHRoaXMuX2YuaGVhZDtcblx0XHR0aGlzLl9ob29rID0gbnVsbDtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0aGFzTmV4dDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuX3dhbGtlciAhPSBudWxsO1xuXHR9LFxuXHRuZXh0OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgeCA9IHRoaXMuX3dhbGtlci52YWw7XG5cdFx0dGhpcy5faG9vayA9IHRoaXMuX3dhbGtlcjtcblx0XHR0aGlzLl93YWxrZXIgPSB0aGlzLl93YWxrZXIubmV4dDtcblx0XHRyZXR1cm4geDtcblx0fSxcblx0X19jbGFzc19fOiBkZV9wb2x5Z29uYWxfZHNfRExMSXRlcmF0b3Jcbn07XG5cbnZhciBkZV9wb2x5Z29uYWxfZHNfQ2lyY3VsYXJETExJdGVyYXRvciA9IGZ1bmN0aW9uKGYpIHtcblx0dGhpcy5fZiA9IGY7e1xuXHR0aGlzLl93YWxrZXIgPSB0aGlzLl9mLmhlYWQ7XG5cdHRoaXMuX3MgPSB0aGlzLl9mLl9zaXplO1xuXHR0aGlzLl9pID0gMDtcblx0dGhpcy5faG9vayA9IG51bGw7XG5cdHRoaXM7XG5cdH1cbn07XG5kZV9wb2x5Z29uYWxfZHNfQ2lyY3VsYXJETExJdGVyYXRvci5wcm90b3R5cGUgPSB7XG5cdHJlc2V0OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLl93YWxrZXIgPSB0aGlzLl9mLmhlYWQ7XG5cdFx0dGhpcy5fcyA9IHRoaXMuX2YuX3NpemU7XG5cdFx0dGhpcy5faSA9IDA7XG5cdFx0dGhpcy5faG9vayA9IG51bGw7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdGhhc05leHQ6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLl9pIDwgdGhpcy5fcztcblx0fSxcblx0bmV4dDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHggPSB0aGlzLl93YWxrZXIudmFsO1xuXHRcdHRoaXMuX2hvb2sgPSB0aGlzLl93YWxrZXI7XG5cdFx0dGhpcy5fd2Fsa2VyID0gdGhpcy5fd2Fsa2VyLm5leHQ7XG5cdFx0dGhpcy5faSsrO1xuXHRcdHJldHVybiB4O1xuXHR9LFxuXHRfX2NsYXNzX186IGRlX3BvbHlnb25hbF9kc19DaXJjdWxhckRMTEl0ZXJhdG9yXG59O1xuXG52YXIgZGVfcG9seWdvbmFsX2RzX0RMTE5vZGUgPSBmdW5jdGlvbih4LCBsaXN0KSB7XG5cdHRoaXMudmFsID0geDtcblx0dGhpcy5fbGlzdCA9IGxpc3Q7XG59O1xuZGVfcG9seWdvbmFsX2RzX0RMTE5vZGUucHJvdG90eXBlID0ge1xuXHRfdW5saW5rOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgdCA9IHRoaXMubmV4dDtcblx0XHRpZiAodGhpcy5wcmV2ICE9IG51bGwpIHtcblx0XHRcdHRoaXMucHJldi5uZXh0ID0gdGhpcy5uZXh0O1xuXHRcdH1cblx0XHRpZiAodGhpcy5uZXh0ICE9IG51bGwpIHtcblx0XHRcdHRoaXMubmV4dC5wcmV2ID0gdGhpcy5wcmV2O1xuXHRcdH1cblx0XHR0aGlzLm5leHQgPSB0aGlzLnByZXYgPSBudWxsO1xuXHRcdHJldHVybiB0O1xuXHR9LFxuXHRfaW5zZXJ0QWZ0ZXI6IGZ1bmN0aW9uKG5vZGUpIHtcblx0XHRub2RlLm5leHQgPSB0aGlzLm5leHQ7XG5cdFx0bm9kZS5wcmV2ID0gdGhpcztcblx0XHRpZiAodGhpcy5uZXh0ICE9IG51bGwpIHtcblx0XHRcdHRoaXMubmV4dC5wcmV2ID0gbm9kZTtcblx0XHR9XG5cdFx0dGhpcy5uZXh0ID0gbm9kZTtcblx0fSxcblx0X2luc2VydEJlZm9yZTogZnVuY3Rpb24obm9kZSkge1xuXHRcdG5vZGUubmV4dCA9IHRoaXM7XG5cdFx0bm9kZS5wcmV2ID0gdGhpcy5wcmV2O1xuXHRcdGlmICh0aGlzLnByZXYgIT0gbnVsbCkge1xuXHRcdFx0dGhpcy5wcmV2Lm5leHQgPSBub2RlO1xuXHRcdH1cblx0XHR0aGlzLnByZXYgPSBub2RlO1xuXHR9LFxuXHRfX2NsYXNzX186IGRlX3BvbHlnb25hbF9kc19ETExOb2RlXG59O1xuXG5cbnZhciBkZV9wb2x5Z29uYWxfZHNfSGFzaEtleSA9IGZ1bmN0aW9uKCkge307XG5kZV9wb2x5Z29uYWxfZHNfSGFzaEtleS5fY291bnRlciA9IDA7XG4iXX0=
