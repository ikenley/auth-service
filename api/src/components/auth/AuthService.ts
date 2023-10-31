import { injectable } from "tsyringe";
import winston from "winston";
import axios from "axios";
import { DataSource, Repository } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { jwtDecode } from "jwt-decode";
import { URLSearchParams } from "url";
import { ConfigOptions } from "../../config";
import { CallbackRequestParams, LoginRequestParams } from "../../types";
import LoggerProvider from "../../utils/LoggerProvider";
import OauthStateEntity from "./OauthStateEntity";
import UserEntity from "./UserEntity";
import LoginRequest from "./LoginRequest";

@injectable()
export default class AuthService {
  private logger: winston.Logger;
  private userRepo: Repository<UserEntity>;
  private oauthStateRepo: Repository<OauthStateEntity>;

  constructor(
    protected loggerProvider: LoggerProvider,
    protected config: ConfigOptions,
    protected dataSource: DataSource
  ) {
    this.logger = loggerProvider.provide("AuthService");
    this.oauthStateRepo = dataSource.getRepository(OauthStateEntity);
    this.userRepo = dataSource.getRepository(UserEntity);
  }

  /** Initiate login for Cognito hosted UI:
   * https://docs.aws.amazon.com/cognito/latest/developerguide/login-endpoint.html
   * This is an Oauth 2.0 Authorization Code flow:
   * https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow
   * This will return a redirect to the Amazon Cognito hosted UI.
   */
  public async initiateLogin(params: LoginRequestParams) {
    const req = new LoginRequest(params, this.config.baseDomain);
    const { oathUrlPrefix, oauthRedirectUri, clientId } = this.config.cognito;
    this.logger.info("initiateLogin", { req });

    // Create oauth state
    const oauthState = await this.createOauthState(req.redirectUrl);

    // Create redirect URI
    const redirectUri = encodeURIComponent(oauthRedirectUri);
    return `${oathUrlPrefix}/login?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${oauthState.id}`;
  }

  /** Create and store OAuth state record */
  private async createOauthState(redirectUrl: string) {
    const oauthState: OauthStateEntity = {
      id: uuidv4(),
      redirectUrl: redirectUrl,
      startedAt: new Date(),
      completedAt: null,
      userId: null,
    };
    await this.oauthStateRepo.save(oauthState);
    this.logger.info("createOauthState", {
      state: oauthState.id,
      redirectUrl: "TODO",
    });
    return oauthState;
  }

  /** Exchange authorization code for id/access/refresh token.
   * https://docs.aws.amazon.com/cognito/latest/developerguide/token-endpoint.html
   */
  public async handleOathCallback(params: CallbackRequestParams) {
    this.logger.info("handleOathCallback", { params });
    const { code, state } = params;

    const requestBody = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: this.config.cognito.clientId,
      client_secret: this.config.cognito.clientSecret,
      code: code,
      redirect_uri: this.config.cognito.oauthRedirectUri,
    });
    const response = await axios.post(
      `${this.config.cognito.oathUrlPrefix}/oauth2/token`,
      requestBody
    );

    const idToken = response.data.id_token;
    const refreshToken = response.data.refresh_token;

    // Ensure OAuth state exists and has not been used
    const oauthState = await this.oauthStateRepo.findOneOrFail({
      where: { id: state },
    });
    if (oauthState.completedAt !== null) {
      this.logger.warn("Invalid OAuth state", { oauthState });
      throw new Error("Invalid OAuth state");
    }

    // Upsert user
    const user = await this.upsertUser(idToken);

    // Complete OAuth state
    oauthState.userId = user.id;
    oauthState.completedAt = new Date();
    await this.oauthStateRepo.save(oauthState);

    return { refreshToken, redirectUrl: oauthState.redirectUrl };
  }

  /** Upserts user in identity token into auth.user table. */
  private async upsertUser(encodedIdToken: string) {
    const idToken = jwtDecode(encodedIdToken) as any; // TODO
    const now = new Date();

    // Find user if exists
    let user = await this.userRepo.findOne({ where: { id: idToken.sub } });

    // If user exists, update last accessed
    if (user) {
      this.logger.info("User exists, updating lastAccessed", { user });
      user.lastAccessed = now;
      await this.userRepo.save(user);
    }
    // Else create new user record
    else {
      user = {
        id: idToken.sub,
        firstName: idToken.given_name,
        lastName: idToken.family_name,
        email: idToken.email,
        created: now,
        lastAccessed: now,
      };
      this.logger.info("Creating new user", { user });
      await this.userRepo.save(user);
    }

    return user;
  }
}
