/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  displayName: "lean-web-utils",
  preset: "ts-jest",
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleNameMapper: {
    "^@tests/(.*)$": "<rootDir>/tests/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.(mt|t|cj|j)s$": [
      "ts-jest",
      { tsconfig: "<rootDir>/tsconfig.test.json", useESM: true },
    ],
  },
  collectCoverageFrom: ["<rootDir>/src/"],
  testMatch: [
    "<rootDir>/tests/unit/**/*.test.ts",
    "<rootDir>/tests/integration/**/*.test.ts",
    "<rootDir>/tests/unit/**/*.test.tsx",
    "<rootDir>/tests/integration/**/*.test.tsx",
  ],
  prettierPath: require.resolve("prettier-2"),
};
