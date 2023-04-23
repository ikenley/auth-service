import { Request, Response } from "express";
import config from "../config";
import LoggerInstance from "../loaders/logger";
import { v4 as uuidv4 } from "uuid";

export const exceptionMiddleware = (
  err: any,
  _req: Request,
  res: Response,
  _next: any
) => {
  const nodeEnv = config.nodeEnv;
  const isProduction = nodeEnv !== "development";
  const errorId = uuidv4();
  const defaultMessage = `An error occurred. Error code: ${errorId}`;

  const { message, stack } = err;

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
};

export default exceptionMiddleware;
