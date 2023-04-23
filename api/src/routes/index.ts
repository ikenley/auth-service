import { Router } from "express";
//import { authController } from "../auth";
import statusController from "../components/status/statusController";

// guaranteed to get dependencies
export default () => {
  const app = Router();

  //authController(app);
  statusController(app);

  return app;
};
