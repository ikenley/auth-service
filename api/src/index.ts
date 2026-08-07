import express from "express";
import { getConfigOptions } from "./config/index.ts";
import container from "./loaders/container.ts";
import loadGlobalDependencies from "./loaders/loadGlobalDependencies.ts";
import Logger from "./loaders/logger.ts";

async function startServer() {
	const config = getConfigOptions();
	const app = express();

	// Register dependencies
	await loadGlobalDependencies();
	// Configure Express
	const expressLoader = container.cradle.expressLoader;
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
