gulp-kraken
===========

Gulp plugin to optimize all your images with the powerful [Kraken.io API](https://kraken.io)


## Installation

````
$ npm install gulp-kraken --save-dev
````

## Options

* `key` - your Kraken API Key
* `secret` - your Kraken API Secret
* `lossy` - enable/disable intelligent lossy optimization. Defaults to `true`
* `concurrency` - image processing concurrency (1 - 16). Defaults to `4`

## Example

````
var gulp = require('gulp'),
    kraken = require('gulp-kraken');

gulp.task('kraken', function () {
    gulp.src('images/**/*.*')
        .pipe(kraken({
            key: 'kraken-api-key-here',
            secret: 'kraken-api-secret-here',
            lossy: true,
            concurrency: 6
        }));
});

gulp.task('default', function() {
    gulp.start('kraken');
});
````