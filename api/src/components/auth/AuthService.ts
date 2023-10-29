import { injectable } from "tsyringe";
import winston from "winston";
import axios from "axios";
import { URLSearchParams } from "url";
import { ConfigOptions } from "../../config";
import LoggerProvider from "../../utils/LoggerProvider";

@injectable()
export default class AuthService {
  private logger: winston.Logger;

  constructor(
    protected loggerProvider: LoggerProvider,
    protected config: ConfigOptions
  ) {
    this.logger = loggerProvider.provide("AuthService");
  }

  /** Initiate login for Cognito hosted UI:
   * https://docs.aws.amazon.com/cognito/latest/developerguide/login-endpoint.html
   * This is an Oauth 2.0 Authorization Code flow:
   * https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow
   * This will return a redirect to the Amazon Cognito hosted UI.
   */
  public async initiateLogin() {
    const { oathUrlPrefix, oauthRedirectUri, clientId } = this.config.cognito;

    const redirectUri = encodeURIComponent(oauthRedirectUri);

    return `${oathUrlPrefix}/login?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
  }

  /** Exchange authorization code for id/access/refresh token.
   * https://docs.aws.amazon.com/cognito/latest/developerguide/token-endpoint.html
   */
  public async handleOathCallback(code: string) {
    this.logger.info("handleOathCallback", { code });

    const requestBody = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: this.config.cognito.clientId,
      client_secret: this.config.cognito.clientSecret,
      code: code,
      redirect_uri: this.config.cognito.oauthRedirectUri,
    });
    const tokenResponse = await axios.post(
      `${this.config.cognito.oathUrlPrefix}/oauth2/token`,
      requestBody
    );

    const refreshToken = tokenResponse.data.refresh_token;

    return refreshToken;
  }
}
