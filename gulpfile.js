const gulp = require("gulp");
const kraken = require("./index");
// This is an integration test task that will run the kraken task
gulp.task("kraken", function () {
	return gulp
		.src("./fixtures/*.*")
		.pipe(
			kraken({
				key: process.env.KRAKEN_API_KEY,
				secret: process.env.KRAKEN_API_SECRET,
				lossy: true,
				concurrency: 6,
			})
		)
		.pipe(gulp.dest("optimized_images"));
});
