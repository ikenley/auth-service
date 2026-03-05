import { container } from "tsyringe";
import { NIL } from "uuid";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import LoggerInstance from "./logger.js";
import { ConfigOptions, getConfigOptions } from "../config/index.js";
import { LoggerToken } from "./logger.js";
import { RequestIdToken } from "../middleware/dependencyInjectionMiddleware.js";
import { createDynamoDocumentClient } from "../data_source/index.js";

export const DynamoClientToken = "DynamoDBDocumentClient";

export default async () => {
  try {
    const config = getConfigOptions();
    container.register(ConfigOptions, { useValue: config });

    container.register(LoggerToken, { useValue: LoggerInstance });

    // Register default request Id.
    // This will be replaced by request-level dependency container in most cases
    container.register(RequestIdToken, { useValue: NIL });

    const cognitoIdpClient = new CognitoIdentityProviderClient({
      region: config.aws.region,
    }) as any;
    container.register(CognitoIdentityProviderClient, {
      useValue: cognitoIdpClient,
    });

    // Register DynamoDB DocumentClient
    const docClient = createDynamoDocumentClient(config.aws.region);
    container.register(DynamoClientToken, { useValue: docClient });
  } catch (e) {
    LoggerInstance.error("🔥 Error on dependency injector loader: %o", e);
    throw e;
  }
};
