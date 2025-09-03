import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import pluginNext from "@next/eslint-plugin-next";
import configPrettier from "eslint-config-prettier";
import pluginImport from "eslint-plugin-import";
import pluginReact from "eslint-plugin-react";
import pluginUnicorn from "eslint-plugin-unicorn";
import globals from "globals";
import ts from "typescript-eslint";

const compat = new FlatCompat();

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // Base recommended configs
  js.configs.recommended,
  ...ts.configs.recommended,
  configPrettier,
  pluginImport.flatConfigs.recommended,
  ...compat.extends("plugin:import/typescript"),
  pluginUnicorn.configs["flat/recommended"],
  pluginReact.configs.flat.recommended,
  ...compat.extends("plugin:react-hooks/recommended"),
  ...compat.config(pluginNext.configs.recommended),

  // ✅ Always put your overrides LAST
  {
    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
        alias: {
          map: [["@", "./src"]],
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
      react: {
        version: "detect",
      },
    },
    rules: {
      // TypeScript
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",

      // Unicorn relaxations
	  "no-empty": "off",
	  "@next/next/no-img-element": "off",
	  "@next/next/no-html-link-for-pages": "off",
	  "react/no-unescaped-entities": "off",
	  "react/no-unstable-nested-components": "off",
	  "react-hooks/exhaustive-deps": "off",
	  "react-hooks/rules-of-hooks": "off",
	  "react/require-default-props": "off",
	  "react/require-optimization": "off",
      "unicorn/filename-case": "off",              // allow camelCase filenames
      "unicorn/no-empty-file": "off",              // allow empty placeholder files
      "unicorn/consistent-function-scoping": "off", // allow inner functions
      "unicorn/prefer-at": "off",
      "unicorn/prefer-query-selector": "off",
      "unicorn/prefer-add-event-listener": "off",
      "unicorn/prefer-number-properties": "off",
      "unicorn/prefer-global-this": "off",
      "unicorn/prefer-string-slice": "off",
      "unicorn/no-useless-promise-resolve-reject": "off",
      "unicorn/no-array-for-each": "off",
      "unicorn/prefer-dom-node-append": "off",
      "unicorn/prefer-dom-node-remove": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-null": "off",
      "unicorn/no-nested-ternary": "off",
      "unicorn/no-array-reduce": "off",

      // React
      "react/prop-types": "off",
    },
  },
];
