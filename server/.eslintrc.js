module.exports = {
    env: {
      es6: true,
      node: true,
    },
    extends: ["google","plugin:prettier/recommended"],
    globals: {
      Atomics: "readonly",
      SharedArrayBuffer: "readonly",
    },
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: "module",
    },
    rules: {
      'require-jsdoc': 'off',
      "prettier/prettier": "error"
    },
  };
  