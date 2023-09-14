const through = require("through2-concurrent");
const request = require("request");
const Kraken = require("kraken");
const log = require("fancy-log");
const path = require("path");
const fs = require("fs");
const { blue, gray, green } = require("kleur");

function pretty(num) {
	const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	let unitIndex = 0;

	while (num >= 1024 && ++unitIndex) {
		num = num / 1024;
	}

	return `${num.toFixed(1)} ${units[unitIndex]}`;
}

module.exports = function (options) {
	options = options || {};

	if (!options.key || !options.secret) {
		throw new Error("Please provide a valid Kraken API key and secret");
	}

	const total = {
		bytes: 0,
		kraked: 0,
		files: 0,
	};

	const supportedExts = [".jpg", ".jpeg", ".png", ".gif", ".svg"];
	let concurrency = options.concurrency || 4;

	concurrency = Math.min(16, Math.max(1, concurrency));

	return through.obj(
		{
			maxConcurrency: concurrency,
		},
		function (file, enc, cb) {
			if (file.isNull()) {
				return cb(null, file);
			}

			if (file.isStream()) {
				this.emit("error", new Error("Streaming not supported"));
				return cb();
			}

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

			kraken.upload(opts, function (err, data) {
				if (err || !data?.success) {
					console.error("Kraken API Error: ", err);
					return cb(new Error(data?.message || err?.message || err));
				}

				const { original_size, kraked_size, saved_bytes } = data;
				const percent = ((saved_bytes * 100) / original_size).toFixed(2);
				const msg =
					saved_bytes > 0
						? `saved ${pretty(saved_bytes)} - ${percent}%`
						: "already optimized";

				total.bytes += original_size;
				total.kraked += kraked_size;
				total.files++;

				request(data.kraked_url, function (err) {
					if (err) {
						console.error("Kraken URL Error: ", err);
						return cb(new Error(err));
					}

					log(green("✔ ") + file.relative + gray(` (${msg})`));
					cb(null, file);
				}).pipe(fs.createWriteStream(file.path));
			});
		},
		function (cb) {
			const percent = (
				((total.bytes - total.kraked) * 100) /
				total.bytes
			).toFixed(2);
			const savings = total.bytes - total.kraked;
			let msg = `All done. Kraked ${total.files} image${
				total.files === 1 ? "" : "s"
			}`;
			msg += gray(` (saved ${pretty(savings)} - ${percent}%)`);

			log(msg);
			cb();
		}
	);
};
