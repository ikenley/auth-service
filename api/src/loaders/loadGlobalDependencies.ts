import { container } from "tsyringe";
import { NIL } from "uuid";
import { DataSource } from "typeorm";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import LoggerInstance from "./logger";
//import CognitoExpress from "cognito-express";
import { ConfigOptions, getConfigOptions } from "../config";
import { LoggerToken } from "./logger";
import { RequestIdToken } from "../middleware/dependencyInjectionMiddleware";
import { initializeDataSource } from "../data_source";

export default async () => {
  try {
    const config = getConfigOptions();
    container.register(ConfigOptions, { useValue: config });

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

    const cognitoIdpClient = new CognitoIdentityProviderClient() as any;
    container.register(CognitoIdentityProviderClient, {
      useValue: cognitoIdpClient,
    });

    // Register database connection
    const dataSource = await initializeDataSource(LoggerInstance, config.db);
    container.register(DataSource, { useValue: dataSource });
  } catch (e) {
    LoggerInstance.error("🔥 Error on dependency injector loader: %o", e);
    throw e;
  }
};
