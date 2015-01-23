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
