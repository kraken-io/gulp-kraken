const gulp = require("gulp");
const fs = require("fs");
const path = require("path");
require("./gulpfile");
require("dotenv").config();

describe("Gulp Kraken Task", () => {
	const inputPath = path.join(__dirname, "/fixtures/original.png");
	const inputSizeInBytes = fs.statSync(inputPath).size;

	afterAll(() => {
		fs.rmdirSync(path.join(__dirname, "/optimized_images"), {
			recursive: true,
		});
	});

	test("should optimize image", (done) => {
		gulp.series("kraken")(function (err) {
			const outputPath = path.join(__dirname, "/optimized_images/original.png");

			fs.access(outputPath, fs.constants.F_OK, (err) => {
				expect(err).toBeFalsy();

				const stats = fs.statSync(outputPath);
				const fileSizeInBytes = stats.size;

				expect(fileSizeInBytes).toBeLessThan(inputSizeInBytes);

				done();
			});
		});
	});
});
