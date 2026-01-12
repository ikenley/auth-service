import { container } from "tsyringe";
import loadGlobalDependencies from "./loadGlobalDependencies";
import ExpressLoader from "./ExpressLoader";
import express from "express";

interface LoaderOptions {
  expressApp: express.Application;
}

export default async ({ expressApp }: LoaderOptions) => {
  await loadGlobalDependencies();
  const expressLoader = container.resolve(ExpressLoader);
  expressLoader.load(expressApp);
};
