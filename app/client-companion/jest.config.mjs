const config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  roots: ["<rootDir>/src", "<rootDir>/redux", "<rootDir>/sagas", "<rootDir>/components"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "./tsconfig.jest.json",
      },
    ],
  },
};

export default config;
