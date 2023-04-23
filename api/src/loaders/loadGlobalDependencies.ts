import { container } from "tsyringe";
import { NIL } from "uuid";
import LoggerInstance from "./logger";
//import CognitoExpress from "cognito-express";
//import config from "../config";
import { LoggerToken } from "./logger";
import { RequestIdToken } from "../middleware/dependencyInjectionMiddleware";

export default () => {
  try {
    container.register(LoggerToken, { useValue: LoggerInstance });

    // Register default request Id.
    // This will be replaced by request-level dependency container in most cases
    container.register(RequestIdToken, { useValue: NIL });

    // const cognitoExpress = new CognitoExpress({
    //   region: config.aws.region,
    //   cognitoUserPoolId: config.cognito.userPoolId,
    //   tokenUse: "id",
    //   tokenExpiration: 3600000,
    // });
    // container.register("CognitoExpress", { useValue: cognitoExpress });

  } catch (e) {
    LoggerInstance.error("🔥 Error on dependency injector loader: %o", e);
    throw e;
  }
};
