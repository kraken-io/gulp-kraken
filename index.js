const through = require("through2-concurrent");
const request = require("request");
const Kraken = require("kraken");
const log = require("fancy-log");
const path = require("path");
const fs = require("fs");
const util = require("util");
const { red, blue, gray, green } = require("kleur");

function pretty(num) {
	const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	let unitIndex = 0;

	while (num >= 1024 && ++unitIndex) {
		num = num / 1024;
	}

	return `${num.toFixed(1)} ${units[unitIndex]}`;
}

async function downloadFile(url, destination) {
	return new Promise((resolve, reject) => {
		request(url)
			.on("error", reject)
			.pipe(fs.createWriteStream(destination))
			.on("finish", resolve)
			.on("error", reject);
	});
}

module.exports = function (options = {}, errorCallback) {
	if (!options.key || !options.secret) {
		throw new Error("Please provide a valid Kraken API key and secret");
	}

	const total = {
		bytes: 0,
		kraked: 0,
		files: 0,
	};

	const supportedExts = [".jpg", ".jpeg", ".png", ".gif", ".svg"];
	const concurrency = Math.min(16, Math.max(1, options.concurrency || 4));

	const stream = through.obj(
		{ maxConcurrency: concurrency },
		async function (file, enc, cb) {
			try {
				if (file.isNull()) return cb(null, file);
				if (file.isStream()) throw new Error("Streaming not supported");

				const isSupported = supportedExts.includes(
					path.extname(file.path).toLowerCase()
				);
				if (!isSupported) {
					log("Skipping unsupported image " + blue(file.relative));
					return cb(null, file);
				}

				const kraken = new Kraken({
					api_key: options.key,
					api_secret: options.secret,
				});

				const opts = {
					file: file.path,
					lossy: options.lossy || true,
					wait: true,
				};

				kraken.upload(opts, async (err, data) => {
					if (err || !data?.success) {
						cb(new Error(data?.message || err?.message)); // Propagate the error to the stream
						return;
					}

					const { original_size, kraked_size, saved_bytes } = data;
					total.bytes += original_size;
					total.kraked += kraked_size;
					total.files++;

					await downloadFile(data.kraked_url, file.path);
					const msg =
						saved_bytes > 0
							? `saved ${pretty(saved_bytes)} - ${(
									(saved_bytes * 100) /
									original_size
							  ).toFixed(2)}%`
							: "already optimized";

					log(green("✔ ") + file.relative + gray(` (${msg})`));
					cb(null, file);
				});
			} catch (error) {
				cb(error);
			}
		},
		function (cb) {
			const percent = (
				((total.bytes - total.kraked) * 100) /
				total.bytes
			).toFixed(2);
			const savings = total.bytes - total.kraked;
			log(
				`All done. Kraked ${total.files} image${
					total.files === 1 ? "" : "s"
				} ${gray(`(saved ${pretty(savings)} - ${percent}%)`)}`
			);
			cb();
		}
	);

	stream.on("error", (err) => {
		log(red(`✖ ${err?.message}`));
		if (typeof errorCallback === "function") {
			errorCallback(err);
		}
	});

	return stream;
};
