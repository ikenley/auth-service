import { injectable } from "tsyringe";
import { Router } from "express";
import AuthController from "../components/auth/AuthController.js";
import StatusController from "../components/status/StatusController.js";

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
