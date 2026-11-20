module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react-hooks", "react-refresh"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  rules: {
    ...require("eslint-plugin-react-hooks").configs.recommended.rules,
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
  },
};
