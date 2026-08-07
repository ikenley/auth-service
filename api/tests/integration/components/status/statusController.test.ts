import assert from "node:assert";
import { describe, it } from "node:test";
import express from "express";
import request from "supertest";
import { getConfigOptions } from "../../../../src/config/index.ts";
import loaders from "../../../../src/loaders/index.ts";

describe("Test the root path", () => {
	const config = getConfigOptions();
	const apiPrefix = `${config.api.prefix}/status`;

	it("It should response the GET method", async () => {
		const app = express();
		await loaders({ expressApp: app });

		const response = await request(app).get(apiPrefix);

		assert.strictEqual(response.statusCode, 200);
	});
});
