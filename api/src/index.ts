import "reflect-metadata";
import "express-async-errors";
import config from "./config";
import express from "express";
import Logger from "./loaders/logger";
import loadGlobalDependencies from "./loaders/loadGlobalDependencies";
import loadExpress from "./loaders/loadExpress";

async function startServer() {
  const app = express();

  // Register dependencies
  await loadGlobalDependencies();
  // Configure Express
  await loadExpress({app})

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
