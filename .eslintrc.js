module.exports = {
    parser: "@typescript-eslint/parser", // Specifies the ESLint parser
    parserOptions: {
      ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
      sourceType: "module", // Allows for the use of imports
    },
    "plugins": ['@typescript-eslint', 'unused-imports'],
    "extends": ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    rules: {
      "no-unused-vars": "off", // or "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-var-requires": "off",
      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/no-non-null-assertion": "off",
      "unused-imports/no-unused-vars": [
        "warn",
        { "vars": "all", "varsIgnorePattern": "^_", "args": "after-used", "argsIgnorePattern": "^_" }
      ]
      // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
      // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    },
    env: {
      "browser": true,
      "amd": true,
      "node": true
    },
  };