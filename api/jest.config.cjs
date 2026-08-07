// jest.config.cjs

module.exports = {
	roots: ["<rootDir>/tests"],
	testMatch: [
		"**/__tests__/**/*.+(ts|tsx|js)",
		"**/?(*.)+(spec|test).+(ts|tsx|js)",
	],
	extensionsToTreatAsEsm: [".ts"],
	transform: {
		"^.+\\.(ts|tsx|js)$": [
			"ts-jest",
			{
				useESM: true,
				// TS151002 asks for isolatedModules alongside module: nodenext.
				// Setting it makes ts-jest emit an `export {}` marker into files
				// jest then executes as CJS, which breaks the unit suite. Ignore
				// the advice until jest is replaced by `node --test`.
				diagnostics: { ignoreCodes: [151002] },
			},
		],
	},
	transformIgnorePatterns: ["node_modules/(?!(uuid)/)"],
	// Source files import with explicit .ts extensions so that `node` can run
	// them directly; tsc and ts-jest rewrite those to .js on emit. Jest resolves
	// against the on-disk source tree, where only the .ts files exist, so strip
	// the extension back off and let jest's own resolver find them.
	moduleNameMapper: {
		"^(\\.{1,2}/.*)\\.js$": "$1",
	},
	// moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
	//   prefix: "<rootDir>/",
	// }),
};
