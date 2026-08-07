import type winston from "winston";
import type { Cradle } from "../loaders/cradle.ts";

/** Provides a module-specific Logger instance.
 * Includes additional container-provides context values
 */
export default class LoggerProvider {
	private logger: winston.Logger;
	private requestId: string;

	constructor({ logger, requestId }: Cradle) {
		this.logger = logger;
		this.requestId = requestId;
	}

	/** Creates a child logger module */
	public provide(moduleName: string) {
		return this.logger.child({ module: moduleName, requestId: this.requestId });
	}
}
