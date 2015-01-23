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
