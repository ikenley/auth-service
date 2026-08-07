import type express from "express";
import { container } from "tsyringe";
import ExpressLoader from "./ExpressLoader.js";
import loadGlobalDependencies from "./loadGlobalDependencies.js";

interface LoaderOptions {
	expressApp: express.Application;
}

export default async ({ expressApp }: LoaderOptions) => {
	await loadGlobalDependencies();
	const expressLoader = container.resolve(ExpressLoader);
	expressLoader.load(expressApp);
};
