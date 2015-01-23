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
