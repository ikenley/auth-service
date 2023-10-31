import { DependencyContainer, injectable } from "tsyringe";
import { Request, Response, Router } from "express";
import { LoginRequestParams, CallbackRequestParams } from "../../types";
import { ConfigOptions } from "../../config";
import AuthService from "./AuthService";

const RefreshCookieName = "refresh";

const route = Router();

@injectable()
export default class AuthController {
  constructor(protected config: ConfigOptions) {}

  public registerRoutes(app: Router) {
    app.use(route); // Auth controller uses top-level path prefix

    const getService = (res: Response) => {
      const container = res.locals.container as DependencyContainer;
      return container.resolve(AuthService);
    };

    route.get(
      "/login",
      async (req: Request<{}, {}, {}, LoginRequestParams>, res) => {
        const service = getService(res);
        const redirectUrl = await service.initiateLogin(req.query);
        res.redirect(redirectUrl);
      }
    );

    route.get(
      "/callback",
      async (req: Request<{}, {}, {}, CallbackRequestParams>, res) => {
        const service = getService(res);
        const { redirectUrl, refreshToken } = await service.handleOathCallback(
          req.query
        );

        // Set cookie
        const expiryDate = new Date();
        expiryDate.setTime(new Date().getTime() + 30 * 60 * 60 * 1000); // +30 days
        const domain = this.config.baseDomain
          ? `.${this.config.baseDomain}`
          : undefined;
        res.cookie(RefreshCookieName, refreshToken, {
          expires: expiryDate,
          httpOnly: true,
          sameSite: "strict",
          // enable http for localhost only
          secure: this.config.baseDomain ? true : false,
          domain: domain,
        });

        res.redirect(redirectUrl);
      }
    );
  }
}
