import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["build", "dist", "node_modules"],
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      "no-console": "off",
    },
  },
  {
    files: ["tests/**/*.test.js"],
    languageOptions: {
      globals: {
        process: "readonly",
      },
    },
  },
];
