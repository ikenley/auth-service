import "reflect-metadata";
import "express-async-errors";
import { container } from "tsyringe";
import serverlessExpress from "@vendia/serverless-express";
import { ALBEvent, Context } from "aws-lambda";
import { getConfigOptions } from "./config";
import express from "express";
import Logger from "./loaders/logger";
import loadGlobalDependencies from "./loaders/loadGlobalDependencies";
import ExpressLoader from "./loaders/ExpressLoader";

let serverlessExpressInstance: any = null;

const setup = async (event: ALBEvent, context: Context) => {
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
