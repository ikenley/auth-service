import { asValue } from "awilix";
import type { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
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
	const requestId = uuidv4();

	const requestScope = container.createScope();
	requestScope.register({ requestId: asValue(requestId) });
	res.locals.container = requestScope;

	next();

	return;
};

export default dependencyInjectionMiddleware;
