import { SSMClient } from "@aws-sdk/client-ssm";
// Imported by name rather than as a default: the package ships an ESM-shaped
// .d.ts (`export default configure`) for a CJS module, so under nodenext
// resolution TS types the default export as a namespace and reads it as
// non-callable. `configure` is the same function and is typed correctly.
// Present in every version checked (4.17.1 and 5.0.0), so this is not a
// leftover of the older @vendia wrapper.
import { configure as serverlessExpress } from "@codegenie/serverless-express";
import type { ALBEvent, Context } from "aws-lambda";
import express from "express";
import { requireEnv } from "./config/env.ts";
import { getConfigOptions } from "./config/index.ts";
import container from "./loaders/container.ts";
import loadGlobalDependencies from "./loaders/loadGlobalDependencies.ts";
import Logger from "./loaders/logger.ts";
import SsmParamLoader from "./loaders/SsmParamLoader.ts";

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
