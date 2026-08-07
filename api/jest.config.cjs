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
			},
		],
	},
	transformIgnorePatterns: ["node_modules/(?!(uuid)/)"],
	// moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
	//   prefix: "<rootDir>/",
	// }),
};
