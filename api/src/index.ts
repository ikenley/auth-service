import "reflect-metadata";
import express from "express";
import { container } from "tsyringe";
import { getConfigOptions } from "./config/index.js";
import ExpressLoader from "./loaders/ExpressLoader.js";
import loadGlobalDependencies from "./loaders/loadGlobalDependencies.js";
import Logger from "./loaders/logger.js";

async function startServer() {
	const config = getConfigOptions();
	const app = express();

	// Register dependencies
	await loadGlobalDependencies();
	// Configure Express
	const expressLoader = container.resolve(ExpressLoader);
	await expressLoader.load(app);

	app
		.listen(config.port, () => {
			Logger.info(`
#####################################
🤖  Server listening on port: ${config.port} 🤖
#####################################
    `);
		})
		.on("error", (err) => {
			Logger.error(err);
			process.exit(1);
		});
}

startServer();
