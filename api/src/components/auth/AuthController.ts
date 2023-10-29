import { DependencyContainer, injectable } from "tsyringe";
import { Request, Response, Router } from "express";
import { CallbackRequestParams } from "../../types";
import AuthService from "./AuthService";

const route = Router();

@injectable()
export default class AuthController {
  public registerRoutes(app: Router) {
    app.use("/auth", route);

    const getService = (res: Response) => {
      const container = res.locals.container as DependencyContainer;
      return container.resolve(AuthService);
    };

    route.get("/login", async (_req, res) => {
      const service = getService(res);
      const redirectUrl = await service.initiateLogin();
      res.redirect(redirectUrl);
    });

    route.get(
      "/callback",
      async (req: Request<{}, {}, {}, CallbackRequestParams>, res) => {
        const service = getService(res);
        const result = await service.handleOathCallback(req.query);
        res.send(result);
      }
    );
  }
}
