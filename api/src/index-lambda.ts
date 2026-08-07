import "reflect-metadata";
import { SSMClient } from "@aws-sdk/client-ssm";
import serverlessExpress from "@vendia/serverless-express";
import type { ALBEvent, Context } from "aws-lambda";
import express from "express";
import { container } from "tsyringe";
import { getConfigOptions } from "./config/index.js";
import ExpressLoader from "./loaders/ExpressLoader.js";
import loadGlobalDependencies from "./loaders/loadGlobalDependencies.js";
import Logger from "./loaders/logger.js";
import SsmParamLoader from "./loaders/SsmParamLoader.js";
import { requireEnv } from "./config/env.js";

let serverlessExpressInstance: any = null;

const setup = async (event: ALBEvent, context: Context) => {
	// Inject SSM param configuration into env vars
	const ssmClient = new SSMClient();
	const ssmParamLoader = new SsmParamLoader(ssmClient);
	const configParamName = requireEnv("CONFIG_SSM_PARAM_NAME");
	await ssmParamLoader.loadToEnv(configParamName);

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

	serverlessExpressInstance = serverlessExpress({ app });
	return serverlessExpressInstance(event, context);
};

/** Main entrypoint for Lambda function version of express app */
export const handler = (event: ALBEvent, context: Context) => {
	console.log("event", event);

	if (serverlessExpressInstance) {
		return serverlessExpressInstance(event, context);
	}

	return setup(event, context);
};

export default handler;
