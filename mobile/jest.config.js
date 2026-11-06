// babel-preset-expo comes with expo rather than at the top of node_modules
const babelPresetExpo = require.resolve("babel-preset-expo", {
  paths: [require.resolve("expo/package.json")],
});

module.exports = {
  projects: [
    {
      displayName: "app",
      preset: "jest-expo",
      testPathIgnorePatterns: ["/node_modules/", "\\.dom\\.test\\.ts$"],
    },
    // The script injected into the page runs in a browser, not in React Native
    {
      displayName: "page",
      testEnvironment: "jsdom",
      testMatch: ["<rootDir>/src/**/*.dom.test.ts"],
      transform: { "\\.[jt]sx?$": ["babel-jest", { presets: [babelPresetExpo] }] },
    },
  ],
};
