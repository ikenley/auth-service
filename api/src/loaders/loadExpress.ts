import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import logger from "./logger";
import routes from "../routes";
import config from "../config";
import dependencyInjectionMiddleware from "../middleware/dependencyInjectionMiddleware";
import exceptionMiddleware from "../middleware/exceptionMiddleware";

export default ({ app }: { app: express.Application }) => {
  // Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // It shows the real origin IP in the heroku or Cloudwatch logs
  app.enable("trust proxy");

  // Security against common threats
  app.use(helmet());

  app.use(cors());

  // "Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it."
  app.use(require("method-override")());

  // Transforms the raw string of req.body into json
  app.use(express.json());

  // Log HTTP requests
  app.use(
    morgan("combined", {
      stream: {
        // Configure Morgan to use our custom logger with the http severity
        write: (message) => logger.http(message.trim()),
      },
    })
  );

  // Load API routes
  app.use(config.api.prefix, dependencyInjectionMiddleware);
  app.use(config.api.prefix, routes());

  /// catch 404 and forward to error handler
  app.use((_req, _res, next) => {
    const err: any = new Error("Not Found");
    err["status"] = 404;
    next(err);
  });

  /// error handlers
  app.use((err: any, _req: any, res: any, next: any) => {
    /**
     * Handle 401 thrown by express-jwt library
     */
    if (err.name === "UnauthorizedError") {
      return res.status(err.status).send({ message: err.message }).end();
    }
    return next(err);
  });
  app.use(exceptionMiddleware);
};
