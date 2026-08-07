import { Router } from "express";
import type { ConfigOptions } from "../../config/index.ts";
import type { Cradle } from "../../loaders/cradle.ts";

const route = Router();

export default class StatusController {
	protected config: ConfigOptions;

	constructor({ config }: Cradle) {
		this.config = config;
	}

	public registerRoutes(app: Router) {
		app.use("/status", route);

		route.get("/", (_req, res) => {
			res.send({ status: "ok" });
		});

		route.get("/health", (_req, res) => {
			res.send({ status: "ok" });
		});

		route.get("/info", (_req, res) => {
			res.send(this.config.app);
		});
	}
}
