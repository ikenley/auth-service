import { optionalEnv, requireEnv } from "./env.js";

// dotenv moved to ./env becuase that module loads first

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
	dynamo: {
		userTableName: string;
		oauthStateTableName: string;
	};
	logs: { level: string };
	nodeEnv: string;
	port: number;
}

/** Get ConfigOptions from env vars.
 * (This is a function to lazy-load and
 *    give bootstrap services time to inject env vars)
 */
export const getConfigOptions = () => {
	const config: ConfigOptions = {
		api: { prefix: "/auth/api" },
		app: {
			env: process.env.APP_ENV as AppEnv,
			name: process.env.APP_NAME || "auth-service",
			version: requireEnv("APP_VERSION"),
		},
		aws: {
			region: requireEnv("AWS_REGION"),
		},
		baseDomain: optionalEnv("BASE_DOMAIN") || null,
		cognito: {
			oathUrlPrefix: requireEnv("COGNITO_OAUTH_URL_PREFIX"),
			oauthRedirectUrlPrefix: requireEnv("COGNITO_OAUTH_REDIRECT_URL_PREFIX"),
			userPoolId: requireEnv("COGNITO_USER_POOL_ID"),
			clientId: requireEnv("COGNITO_USER_POOL_CLIENT_ID"),
			clientSecret: requireEnv("COGNITO_USER_POOL_CLIENT_SECRET"),
		},
		dynamo: {
			userTableName: requireEnv("USER_TABLE_NAME"),
			oauthStateTableName: requireEnv("OAUTH_STATE_TABLE_NAME"),
		},
		logs: { level: optionalEnv("LOGS__LEVEL") || "http" },
		nodeEnv: requireEnv("NODE_ENV"),
		port: parseInt(optionalEnv("PORT") || "8080", 10),
	};

	return config;
};
