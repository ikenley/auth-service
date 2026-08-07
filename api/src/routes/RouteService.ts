import { Router } from "express";
import type AuthController from "../components/auth/AuthController.ts";
import type StatusController from "../components/status/StatusController.ts";
import type { Cradle } from "../loaders/cradle.ts";

export default class RouteService {
	protected authController: AuthController;
	protected statusController: StatusController;

	constructor({ authController, statusController }: Cradle) {
		this.authController = authController;
		this.statusController = statusController;
	}

	public registerRoutes() {
		const app = Router();

		this.authController.registerRoutes(app);
		this.statusController.registerRoutes(app);

		return app;
	}
}
