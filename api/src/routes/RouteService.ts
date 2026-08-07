import { Router } from "express";
import { injectable } from "tsyringe";
import type AuthController from "../components/auth/AuthController.js";
import type StatusController from "../components/status/StatusController.js";

@injectable()
export default class RouteService {
	constructor(
		protected authController: AuthController,
		protected statusController: StatusController,
	) {}

	public registerRoutes() {
		const app = Router();

		this.authController.registerRoutes(app);
		this.statusController.registerRoutes(app);

		return app;
	}
}
