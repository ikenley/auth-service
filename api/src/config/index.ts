import dotenv from "dotenv";

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || "development";

dotenv.config();

type AppEnv = "local" | "test" | "dev" | "staging" | "prod";

export class ConfigOptions {
  api: { prefix: string };
  app: { env: AppEnv; name: string; version: string };
  aws: {
    region: string;
  };
  cognito: {
    oathUrlPrefix: string;
    oauthRedirectUri: string;
    userPoolId: string;
    clientId: string;
    clientSecret: string;
  };
  // db: {
  //   host: string;
  //   port: number;
  //   user: string;
  //   password: string;
  //   database: string;
  //   schema: string;
  // };
  logs: { level: string };
  nodeEnv: string;
  port: number;
}

const config: ConfigOptions = {
  api: { prefix: "/auth/api" },
  app: {
    env: process.env.APP_ENV as AppEnv,
    name: process.env.APP_NAME || "auth-service",
    version: process.env.APP_VERSION!,
  },
  aws: {
    region: process.env.AWS_REGION!,
  },
  cognito: {
    oathUrlPrefix: process.env.COGNITO_OAUTH_URL_PREFIX!,
    oauthRedirectUri: process.env.COGNITO_OAUTH_REDIRECT_URI!,
    userPoolId: process.env.COGNITO_USER_POOL_ID!,
    clientId: process.env.COGNITO_USER_POOL_CLIENT_ID!,
    clientSecret: process.env.COGNITO_USER_POOL_CLIENT_SECRET!,
  },
  // db: {
  //   host: process.env.DB_HOST!,
  //   port: parseInt(process.env.DB_PORT!),
  //   user: process.env.DB_USER!,
  //   password: process.env.DB_PASSWORD!,
  //   database: process.env.DB_DATABASE!,
  //   schema: process.env.DB_SCEHMA!,
  // },
  logs: { level: process.env.LOGS__LEVEL || "http" },
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT || "8080", 10),
};

export { config };

export default config;
