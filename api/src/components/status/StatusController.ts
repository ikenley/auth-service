import { injectable } from "tsyringe";
import { Router } from "express";
import config from "../../config";

const route = Router();

@injectable()
export default class StatusController {
  public registerRoutes(app: Router) {
    app.use("/status", route);

    route.get("/", (_req, res) => {
      res.send({ status: "ok" });
    });

    route.get("/health", (_req, res) => {
      res.send({ status: "ok" });
    });

    route.get("/info", (_req, res) => {
      res.send(config.app);
    });
  }
}
