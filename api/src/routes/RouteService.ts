import { injectable } from "tsyringe";
import { Router } from "express";
import AuthController from "../components/auth/AuthController";
import StatusController from "../components/status/StatusController";

@injectable()
export default class RouteService {
  constructor(
    protected authController: AuthController,
    protected statusController: StatusController
  ) {}

  public registerRoutes() {
    const app = Router();

    this.authController.registerRoutes(app);
    this.statusController.registerRoutes(app);

    return app;
  }
}
