const gulp = require("gulp");
const kraken = require("./index");

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
