import { injectable } from "tsyringe";
import { Router } from "express";
//import { authController } from "../auth";
import StatusController from "../components/status/StatusController";

@injectable()
export default class RouteService {
  constructor(protected statusController: StatusController) {}

  public registerRoutes() {
    const app = Router();

    //authController(app);
    this.statusController.registerRoutes(app);

    return app;
  }
}
