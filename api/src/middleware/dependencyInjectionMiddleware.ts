import { randomUUID } from "node:crypto";
import { asValue } from "awilix";
import type { NextFunction, Request, Response } from "express";
import container from "../loaders/container.ts";

/** Create a request-level dependency injection scope.
 * Useful for request-scoped dependencies.
 * Also useful for log tracing, via the requestId
 */
export const dependencyInjectionMiddleware = async (
	_req: Request,
	res: Response,
	next: NextFunction,
) => {
	const requestId = randomUUID();

	const requestScope = container.createScope();
	requestScope.register({ requestId: asValue(requestId) });
	res.locals.container = requestScope;

	next();

	return;
};

export default dependencyInjectionMiddleware;
