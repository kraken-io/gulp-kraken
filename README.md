gulp-kraken
===========

Gulp plugin to optimize all your images with the powerful Kraken.io API

````
var gulp = require('gulp'),
    kraken = require('gulp-kraken');

gulp.task('kraken', function () {
    gulp.src('images/**/*.*')
        .pipe(kraken({
            key: 'kraken-api-key-here',
            secret: 'kraken-api-secret-here',
            lossy: true
        }));
});

gulp.task('default', function() {
    gulp.start('kraken');
});
````