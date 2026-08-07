import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { optionalEnv } from "../config/env.ts";
import LoggerInstance from "../loaders/logger.ts";

/** This middleware deliberately reads NODE_ENV straight from the environment
 * rather than going through getConfigOptions(). Same reasoning as logger.ts:
 * getConfigOptions() builds the whole config eagerly and throws on any missing
 * required var, so calling it here would let a configuration problem kill the
 * handler whose job is to report errors — masking the original failure. The
 * accessor comes from config/env.ts so that importing it also guarantees the
 * dotenv bootstrap and the NODE_ENV default have run.
 */
export const exceptionMiddleware = (
	err: any,
	_req: Request,
	res: Response,
	_next: any,
) => {
	const nodeEnv = optionalEnv("NODE_ENV");
	const isProduction = nodeEnv !== "development";
	const errorId = randomUUID();
	const defaultMessage = `An error occurred. Error code: ${errorId}`;

	const { message, stack } = err;

	const status = err.status || 500;

	if (status === 500) {
		LoggerInstance.info(`nodeEnv=${nodeEnv}`, nodeEnv);
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
