import "reflect-metadata";
import express from "express";
import request from "supertest";
import { getConfigOptions } from "../../../../src/config/index";
//import { closeDataSource } from "../../../../src/data_source";
import loaders from "../../../../src/loaders/index";

// beforeAll(async () => {
//   await connection.create();
// });

afterAll(async () => {
	// await closeDataSource();
});

// beforeEach(async () => {
//   await connection.clear();
// });

describe("Test the root path", () => {
	const config = getConfigOptions();
	const apiPrefix = `${config.api.prefix}/status`;

	test("It should response the GET method", async () => {
		const app = express();
		await loaders({ expressApp: app });

		const response = await request(app).get(apiPrefix);

		expect(response.statusCode).toBe(200);
	});
});
