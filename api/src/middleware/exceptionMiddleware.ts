import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { getConfigOptions } from "../config/index.ts";
import LoggerInstance from "../loaders/logger.ts";

const config = getConfigOptions();

export const exceptionMiddleware = (
	err: any,
	_req: Request,
	res: Response,
	_next: any,
) => {
	const nodeEnv = config.nodeEnv;
	const isProduction = nodeEnv !== "development";
	const errorId = randomUUID();
	const defaultMessage = `An error occurred. Error code: ${errorId}`;

	const { message, stack } = err;

	const status = err.status || 500;

	if (status === 500) {
		LoggerInstance.info(`config.nodeEnv=${config.nodeEnv}`, config.nodeEnv);
		LoggerInstance.error(defaultMessage, {
			errorMessage: message,
			stack,
			module: "exceptionMiddleware",
		});

		res.status(err.status || 500);
		res.json({
			errors: { errorId, message: isProduction ? defaultMessage : err.message },
		});
	}
	// For non-500 errors, return message content
	else {
		res.status(status);
		res.json(err.message);
	}
};

export default exceptionMiddleware;
