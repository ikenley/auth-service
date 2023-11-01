import { DependencyContainer, injectable } from "tsyringe";
import { Request, Response, Router } from "express";
import { LoginRequestParams, LoginCallbackRequestParams } from "../../types";
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
      "/login/callback",
      async (req: Request<{}, {}, {}, LoginCallbackRequestParams>, res) => {
        const service = getService(res);
        const { redirectUrl, refreshToken } = await service.handleLoginCallback(
          req.query
        );

        // Set cookie
        const expiryDate = new Date();
        expiryDate.setTime(new Date().getTime() + 30 * 60 * 60 * 1000); // +30 days
        const isLocal = this.config.app.env === "local";
        const domain = isLocal ? undefined : `.${this.config.baseDomain}`;
        res.cookie(RefreshCookieName, refreshToken, {
          expires: expiryDate,
          httpOnly: true,
          sameSite: "strict",
          // enable http for localhost only
          secure: isLocal ? false : true,
          domain: domain,
        });

        res.redirect(redirectUrl);
      }
    );

    route.get(
      "/logout",
      async (req: Request<{}, {}, {}, LoginRequestParams>, res) => {
        const service = getService(res);
        const redirectUrl = await service.initiateLogout(req.query);
        res.redirect(redirectUrl);
      }
    );
  }
}
