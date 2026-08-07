import type { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type winston from "winston";
import type AuthController from "../components/auth/AuthController.ts";
import type AuthService from "../components/auth/AuthService.ts";
import type OauthStateRepo from "../components/auth/OauthStateRepo.ts";
import type UserRepo from "../components/auth/UserRepo.ts";
import type StatusController from "../components/status/StatusController.ts";
import type { ConfigOptions } from "../config/index.ts";
import type RouteService from "../routes/RouteService.ts";
import type LoggerProvider from "../utils/LoggerProvider.ts";
import type ExpressLoader from "./ExpressLoader.ts";

/** The full set of dependencies resolvable from the container.
 *
 * Awilix runs in PROXY injection mode, so a class receives this object
 * (the "cradle") as its single constructor argument and destructures the
 * dependencies it needs. Property names here are the registration names
 * used in `loadGlobalDependencies`.
 *
 * This module imports types only, so it never participates in a runtime
 * import cycle with the classes it describes.
 */
export interface Cradle {
	// Values
	config: ConfigOptions;
	logger: winston.Logger;
	requestId: string;
	cognitoIdpClient: CognitoIdentityProviderClient;
	docClient: DynamoDBDocumentClient;

	// Request-scoped
	loggerProvider: LoggerProvider;
	authService: AuthService;
	oauthStateRepo: OauthStateRepo;
	userRepo: UserRepo;

	// Singletons
	authController: AuthController;
	statusController: StatusController;
	routeService: RouteService;
	expressLoader: ExpressLoader;
}
