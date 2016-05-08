var through = require("through2-concurrent"),
    request = require("request"),
    Kraken  = require("kraken"),
    pretty  = require("pretty-bytes"),
    gutil   = require("gulp-util"),
    chalk   = require("chalk"),
    path    = require("path"),
    fs      = require("fs");

module.exports = function (options) {
    options = options || {};

    if (!options.key || !options.secret) {
        throw new gutil.PluginError("gulp-kraken", "Please provide a valid Kraken API key and secret");
    }

    var total = {
        bytes: 0,
        kraked: 0,
        files: 0
    };

    var supportedExts = ['.jpg', '.jpeg', '.png', '.gif', '.svg'],
        concurrency = options.concurrency || 4;

    if (concurrency < 1) {
        concurrency = 1;
    }

    if (concurrency > 16) {
        concurrency = 16;
    }

    return through.obj({
        maxConcurrency: concurrency
    }, function (file, enc, cb) {
        if (file.isNull()) {
            return cb(null, file);
        }

        if (file.isStream()) {
            this.emit("error", new gutil.PluginError("gulp-kraken", "Streaming not supported"));
            return cb();
        }

        var isSupported = ~supportedExts.indexOf(path.extname(file.path).toLowerCase());

        if (!isSupported) {
            gutil.log("gulp-kraken: Skipping unsupported image " + chalk.blue(file.relative));
            return cb(null, file);
        }

        if (!isSupported) {
            gutil.log("gulp-kraken: Skipping unsupported image " + chalk.blue(file.relative));
            return cb(null, file);
        }

        var kraken = new Kraken({
            api_key: options.key,
            api_secret: options.secret
        });

        var opts = {
            file: file.path,
            lossy: options.lossy || true,
            wait: true
        };

        kraken.upload(opts, function (data) {
            if (!data.success) {
                return cb(new gutil.PluginError("gulp-kraken:", data.message));
            }

            var originalSize = data.original_size,
                krakedSize = data.kraked_size,
                savings = data.saved_bytes;

            var percent = (((savings) * 100) / originalSize).toFixed(2),
                savedMsg = "saved " + pretty(savings) + " - " + percent + "%",
                msg = savings > 0 ? savedMsg : "already optimized";

            total.bytes += originalSize;
            total.kraked += krakedSize;
            total.files++;

            request(data.kraked_url, function (err) {
                if (err) {
                    return cb(new gutil.PluginError("gulp-kraken:", err));
                }

                gutil.log("gulp-kraken:", chalk.green("✔ ") + file.relative + chalk.gray(" (" + msg + ")"));
                cb(null, file);
            }).pipe(fs.createWriteStream(file.path));
        });
    }, function (cb) {
        var percent = (((total.bytes - total.kraked) * 100) / total.bytes).toFixed(2),
            savings = total.bytes - total.kraked,
            msg = "All done. Kraked " + total.files + " image";

        msg += total.files === 1 ? "" : "s";
        msg += chalk.gray(" (saved " + pretty(savings) + " - " + percent + "%)");

        gutil.log("gulp-kraken:", msg);
        cb();
    });
};