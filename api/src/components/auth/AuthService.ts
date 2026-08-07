import { URLSearchParams } from "node:url";
import {
	AdminInitiateAuthCommand,
	type CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { injectable } from "tsyringe";
import { v4 as uuidv4 } from "uuid";
import type winston from "winston";
import type { ConfigOptions } from "../../config/index.js";
import UnauthorizedException from "../../middleware/UnauthorizedException.js";
import {
	type LoginCallbackRequestParams,
	type LoginRequestParams,
	WorkflowType,
} from "../../types/index.js";
import type LoggerProvider from "../../utils/LoggerProvider.js";
import LoginRequest from "./LoginRequest.js";
import OauthStateEntity from "./OauthStateEntity.js";
import type OauthStateRepo from "./OauthStateRepo.js";
import UserEntity from "./UserEntity.js";
import type UserRepo from "./UserRepo.js";

@injectable()
export default class AuthService {
	private logger: winston.Logger;

	constructor(
		protected loggerProvider: LoggerProvider,
		protected config: ConfigOptions,
		protected oauthStateRepo: OauthStateRepo,
		protected userRepo: UserRepo,
		protected cognitoIdpClient: CognitoIdentityProviderClient,
	) {
		this.logger = loggerProvider.provide("AuthService");
	}

	/** Initiate login for Cognito hosted UI:
	 * https://docs.aws.amazon.com/cognito/latest/developerguide/login-endpoint.html
	 * This is an Oauth 2.0 Authorization Code flow:
	 * https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow
	 * This will return a redirect to the Amazon Cognito hosted UI.
	 */
	public async initiateLogin(params: LoginRequestParams) {
		const req = new LoginRequest(params, this.config.baseDomain);
		const { oathUrlPrefix, clientId } = this.config.cognito;
		this.logger.info("initiateLogin", { req });

		// Create oauth state
		const oauthState = await this.createOauthState(
			req.redirectUrl,
			WorkflowType.login,
		);

		// Create redirect URI
		const oauthRedirectUrl = this.getRedirectUrl(WorkflowType.login);
		const redirectUri = encodeURIComponent(oauthRedirectUrl);
		return `${oathUrlPrefix}/login?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${oauthState.id}`;
	}

	private getRedirectUrl(workflowType: WorkflowType) {
		const { oauthRedirectUrlPrefix } = this.config.cognito;

		const action = workflowType === WorkflowType.login ? "login" : "logout";

		return `${oauthRedirectUrlPrefix}/auth/api/${action}/callback`;
	}

	/** Create and store OAuth state record */
	private async createOauthState(
		redirectUrl: string,
		workflowType: WorkflowType,
	) {
		const startedAt = new Date();
		const oauthState = new OauthStateEntity();
		oauthState.id = uuidv4();
		oauthState.redirectUrl = redirectUrl;
		oauthState.startedAt = startedAt;
		oauthState.completedAt = null;
		oauthState.userId = null;
		oauthState.workflowType = workflowType;
		oauthState.ttl = Math.floor(startedAt.getTime() / 1000) + 3600;

		await this.oauthStateRepo.create(oauthState);
		this.logger.info("createOauthState", {
			state: oauthState.id,
			redirectUrl: "TODO",
		});
		return oauthState;
	}

	/** Exchange authorization code for id/access/refresh token.
	 * https://docs.aws.amazon.com/cognito/latest/developerguide/token-endpoint.html
	 */
	public async handleLoginCallback(params: LoginCallbackRequestParams) {
		this.logger.info("handleLoginCallback", { params });
		const { code, state } = params;

		const redirectUri = this.getRedirectUrl(WorkflowType.login);

		const requestBody = new URLSearchParams({
			grant_type: "authorization_code",
			client_id: this.config.cognito.clientId,
			client_secret: this.config.cognito.clientSecret,
			code: code,
			redirect_uri: redirectUri,
		});
		const response = await axios.post(
			`${this.config.cognito.oathUrlPrefix}/oauth2/token`,
			requestBody,
		);

		const idToken = response.data.id_token;
		const refreshToken = response.data.refresh_token;

		// Ensure OAuth state exists and has not been used
		const oauthState = await this.oauthStateRepo.getById(state);
		if (oauthState.completedAt !== null) {
			this.logger.warn("Invalid OAuth state", { oauthState });
			throw new Error("Invalid OAuth state");
		}

		// Upsert user
		const user = await this.upsertUser(idToken);

		// Complete OAuth state
		const completedAt = new Date();
		await this.oauthStateRepo.complete(oauthState.id, user.id, completedAt);

		return { refreshToken, redirectUrl: oauthState.redirectUrl };
	}

	/** Upserts user in identity token into user table. */
	private async upsertUser(encodedIdToken: string) {
		const idToken = jwtDecode(encodedIdToken) as any; // TODO
		const now = new Date();

		// Find user if exists
		let user = await this.userRepo.findById(idToken.sub);

		// If user exists, update last accessed
		if (user) {
			this.logger.info("User exists, updating lastAccessed", { user });
			await this.userRepo.updateLastAccessed(user.id, now);
			user.lastAccessed = now;
		}
		// Else create new user record
		else {
			user = new UserEntity();
			user.id = idToken.sub;
			user.firstName = idToken.given_name;
			user.lastName = idToken.family_name;
			user.email = idToken.email;
			user.created = now;
			user.lastAccessed = now;
			this.logger.info("Creating new user", { user });
			await this.userRepo.create(user);
		}

		return user;
	}

	/** Initiate logout for Cognito hosted UI:
	 * https://docs.aws.amazon.com/cognito/latest/developerguide/logout-endpoint.html
	 * This will return a redirect to the Amazon Cognito hosted UI.
	 */
	public async initiateLogout(params: LoginRequestParams) {
		const req = new LoginRequest(params, this.config.baseDomain);
		const { oathUrlPrefix, clientId } = this.config.cognito;
		this.logger.info("initiateLogout", { req });

		// Create redirect URI
		const redirectUri = encodeURIComponent(req.redirectUrl);
		return `${oathUrlPrefix}/logout?client_id=${clientId}&logout_uri=${redirectUri}`;
	}

	/** Exchange a refresh token for an ID token. */
	public async refresh(refreshToken: string) {
		if (!refreshToken) {
			throw new UnauthorizedException();
		}

		const { userPoolId, clientId, clientSecret } = this.config.cognito;
		const command = new AdminInitiateAuthCommand({
			UserPoolId: userPoolId,
			ClientId: clientId,
			AuthFlow: "REFRESH_TOKEN_AUTH",
			AuthParameters: {
				REFRESH_TOKEN: refreshToken,
				SECRET_HASH: clientSecret,
			},
		});

		try {
			const response = await this.cognitoIdpClient.send(command);

			if (!response?.AuthenticationResult?.IdToken) {
				this.logger.info("empty AuthenticationResult");
				throw new UnauthorizedException();
			}

			const idToken = response.AuthenticationResult.IdToken;

			return idToken;
		} catch (e: any) {
			this.logger.info("refresh catch", { e });
			throw new UnauthorizedException();
		}
	}
}
