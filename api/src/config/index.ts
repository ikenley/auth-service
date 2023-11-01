import dotenv from "dotenv";

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || "development";

dotenv.config({ path: "../.env" });

type AppEnv = "local" | "test" | "dev" | "staging" | "prod";

export class ConfigOptions {
  api: { prefix: string };
  app: { env: AppEnv; name: string; version: string };
  aws: {
    region: string;
  };
  baseDomain: string | null;
  cognito: {
    oathUrlPrefix: string;
    oauthRedirectUrlPrefix: string;
    userPoolId: string;
    clientId: string;
    clientSecret: string;
  };
  db: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
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
  baseDomain: process.env.BASE_DOMAIN || null,
  cognito: {
    oathUrlPrefix: process.env.COGNITO_OAUTH_URL_PREFIX!,
    oauthRedirectUrlPrefix: process.env.COGNITO_OAUTH_REDIRECT_URL_PREFIX!,
    userPoolId: process.env.COGNITO_USER_POOL_ID!,
    clientId: process.env.COGNITO_USER_POOL_CLIENT_ID!,
    clientSecret: process.env.COGNITO_USER_POOL_CLIENT_SECRET!,
  },
  db: {
    host: process.env.PGHOST!,
    port: parseInt(process.env.PGPORT!),
    user: process.env.PGUSER!,
    password: process.env.PGPASSWORD!,
    database: process.env.PGDATABASE!,
  },
  logs: { level: process.env.LOGS__LEVEL || "http" },
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT || "8080", 10),
};

export { config };

export default config;
