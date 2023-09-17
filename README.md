# gulp-kraken

Gulp plugin to optimize all your images with the powerful [Kraken.io API](https://kraken.io)

## Installation

```
$ npm install gulp-kraken --save-dev
```

## Options

- `key` - your Kraken API Key
- `secret` - your Kraken API Secret
- `lossy` - enable/disable intelligent lossy optimization. Defaults to `true`
- `concurrency` - image processing concurrency (1 - 16). Defaults to `4`

## Example

```
const gulp = require("gulp");
const kraken = require("gulp-kraken");

//optional task to copy images to a new folder
gulp.task("copy", function () {
	return gulp.src("./fixtures/*.*").pipe(gulp.dest("optimized_images"));
});

gulp.task(
	"kraken",
	gulp.series("copy", function () {
		return gulp.src("./optimized_images/*.*").pipe(
			kraken({
				key: process.env.KRAKEN_API_KEY,
				secret: process.env.KRAKEN_API_SECRET,
				lossy: true,
				concurrency: 6,
			})
		);
	})
);
```
