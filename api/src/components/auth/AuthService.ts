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

  public async handleOathCallback(code: string) {
    this.logger.info("handleOathCallback", { code });

    const requestBody = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: this.config.cognito.userPoolClientId,
      client_secret: this.config.cognito.userPoolClientSecret,
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
