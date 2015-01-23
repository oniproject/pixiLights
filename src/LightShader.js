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
