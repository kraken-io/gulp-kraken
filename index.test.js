import { jest } from "@jest/globals";
const File = require("vinyl");
const gulpKrakenPlugin = require("./index");
const fs = require("fs");

jest.mock("kraken", () => {
	return jest.fn().mockImplementation(() => {
		return {
			upload: jest.fn((options, callback) => {
				callback(null, {
					success: true,
					original_size: 1000,
					kraked_size: 900,
					saved_bytes: 100,
					kraked_url: "https://mocked-server.mock/kraked.png",
				});
			}),
		};
	});
});

describe("gulpKrakenPlugin", () => {
	it("should process images correctly", (done) => {
		const fileContents = fs.readFileSync("./fixtures/original.png");

		const fakeFile = new File({
			path: "./fixtures/original.png",
			contents: fileContents,
		});

		const krakenPlugin = gulpKrakenPlugin({
			key: "fakeKey",
			secret: "fakeSecret",
			lossy: true,
			concurrency: 6,
		});

		krakenPlugin.on("data", function (newFile) {
			expect(newFile).toBeDefined();
			expect(Buffer.isBuffer(newFile.contents)).toBeTruthy();
		});

		krakenPlugin.on("end", function () {
			done();
		});

		krakenPlugin.write(fakeFile);
		krakenPlugin.end();
	});
});
