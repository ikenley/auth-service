import { DependencyContainer, injectable } from "tsyringe";
import { Response, Router } from "express";
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

    route.get("/callback", async (req, res) => {
      const code = req.query.code as string;
      const service = getService(res);
      const result = await service.handleOathCallback(code);
      res.send(result);
    });
  }
}
