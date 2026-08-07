import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { asClass, asValue } from "awilix";
import { NIL } from "uuid";
import AuthController from "../components/auth/AuthController.ts";
import AuthService from "../components/auth/AuthService.ts";
import OauthStateRepo from "../components/auth/OauthStateRepo.ts";
import UserRepo from "../components/auth/UserRepo.ts";
import StatusController from "../components/status/StatusController.ts";
import { getConfigOptions } from "../config/index.ts";
import { createDynamoDocumentClient } from "../data_source/index.ts";
import RouteService from "../routes/RouteService.ts";
import LoggerProvider from "../utils/LoggerProvider.ts";
import container from "./container.ts";
import ExpressLoader from "./ExpressLoader.ts";
import LoggerInstance from "./logger.ts";

export default async () => {
	try {
		const config = getConfigOptions();

		container.register({
			config: asValue(config),
			logger: asValue(LoggerInstance),

			// Default request Id. Replaced per request by the request-level scope.
			requestId: asValue(NIL),

			cognitoIdpClient: asValue(
				new CognitoIdentityProviderClient({ region: config.aws.region }),
			),
			docClient: asValue(createDynamoDocumentClient(config.aws.region)),

			// Request-scoped: one instance per request, so the requestId woven into
			// log lines belongs to the request being handled.
			loggerProvider: asClass(LoggerProvider).scoped(),
			authService: asClass(AuthService).scoped(),
			oauthStateRepo: asClass(OauthStateRepo).scoped(),
			userRepo: asClass(UserRepo).scoped(),

			// Wired once at startup.
			authController: asClass(AuthController).singleton(),
			statusController: asClass(StatusController).singleton(),
			routeService: asClass(RouteService).singleton(),
			expressLoader: asClass(ExpressLoader).singleton(),
		});
	} catch (e) {
		LoggerInstance.error("🔥 Error on dependency injector loader: %o", e);
		throw e;
	}
};
