import { type AwilixContainer, createContainer, InjectionMode } from "awilix";
import type { Cradle } from "./cradle.ts";

/** Root application container.
 *
 * Registrations are added by `loadGlobalDependencies`. Per-request scopes are
 * created from this container by `dependencyInjectionMiddleware`.
 *
 * `strict` makes Awilix reject a singleton that depends on a scoped
 * registration, which would otherwise silently capture the first request's
 * state for the lifetime of the process.
 */
export const container: AwilixContainer<Cradle> = createContainer<Cradle>({
	injectionMode: InjectionMode.PROXY,
	strict: true,
});

export default container;
