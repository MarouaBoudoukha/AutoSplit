// .eslintrc.js

module.exports = {
    env: {
      browser: true,
      es2020: true, // Ensures BigInt and other ES2020 features are recognized
    },
    extends: [
      'react-app',
      'eslint:recommended',
      'plugin:react/recommended',
    ],
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {
      // Your custom rules
    },
  };
