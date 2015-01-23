var gulp = require('gulp'),
	source = require('vinyl-source-stream'),
	transform = require('vinyl-transform'),
	browserify = require('browserify'),
	watchify = require('watchify'),
	jsdoc = require('gulp-jsdoc');


var app = {
	dest: 'demo.js',
	source: './demo.src.js'
};
var dest = '.';

gulp.task('browserify', fn(app, false));
gulp.task('watchify', fn(app, true));

gulp.task('jsdoc', function() {
	gulp.src('./src/*.js')
		.pipe(jsdoc('./docs', {
			path: 'ink-docstrap',
			navType: 'vertical',
			theme: 'simplex',
			linenums: true,
			inverseNav: false,
		}));
})

function fn(app, isWatching) {
	return function() {
		var bundler = browserify({
			cache: {},
			packageCache: {},
			fullPaths: true,
			entries: [app.source],
			debug: true
		});
		var bundle = function() {
			return bundler
				.bundle().on('error', handleErrors)
				.pipe(source(app.dest))
				.pipe(gulp.dest(dest));
		};

		if (isWatching) {
			bundler = watchify(bundler);
			bundler.on('update', bundle);
		}

		return bundle();
	}
}

function handleErrors(err) {
	var args = Array.prototype.slice.call(arguments);
	console.error(err.toString());
	this.emit('end');
}
