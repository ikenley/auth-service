import { container } from "tsyringe";
import loadGlobalDependencies from "./loadGlobalDependencies.js";
import ExpressLoader from "./ExpressLoader.js";
import express from "express";

interface LoaderOptions {
  expressApp: express.Application;
}

export default async ({ expressApp }: LoaderOptions) => {
  await loadGlobalDependencies();
  const expressLoader = container.resolve(ExpressLoader);
  expressLoader.load(expressApp);
};
