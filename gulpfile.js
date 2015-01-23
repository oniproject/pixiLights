var gulp = require('gulp'),
	jsdoc = require('gulp-jsdoc');

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
