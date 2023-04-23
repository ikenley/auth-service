import "reflect-metadata";
import "express-async-errors";
//import "source-map-support/register";
import serverlessExpress from "@vendia/serverless-express";
import { ALBEvent, Context } from "aws-lambda";
import config from "./config";
import express from "express";
import Logger from "./loaders/logger";
import loadGlobalDependencies from "./loaders/loadGlobalDependencies";
import loadExpress from "./loaders/loadExpress";

let serverlessExpressInstance: any = null;

const setup = async (event: ALBEvent, context: Context) => {
  const app = express();

  // Register dependencies
  await loadGlobalDependencies();
  // Configure Express
  await loadExpress({ app });

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
  console.log("event", event)
  
  if (serverlessExpressInstance) {
    return serverlessExpressInstance(event, context);
  }

  return setup(event, context);
};

export default handler;