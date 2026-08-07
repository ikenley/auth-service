import type express from "express";
import container from "./container.ts";
import loadGlobalDependencies from "./loadGlobalDependencies.ts";

interface LoaderOptions {
	expressApp: express.Application;
}

export default async ({ expressApp }: LoaderOptions) => {
	await loadGlobalDependencies();
	const expressLoader = container.cradle.expressLoader;
	expressLoader.load(expressApp);
};
