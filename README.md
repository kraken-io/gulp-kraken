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
gulp.task("kraken", function () {
	return gulp
		.src("./images/*.*")
		.pipe(
			kraken({
				key: "your-api-key",
				secret: "your-api-secret",
				lossy: true,
				concurrency: 6,
			})
		)
		.pipe(gulp.dest("./optimized_images")); // optional output folder for optimized images
});
```
