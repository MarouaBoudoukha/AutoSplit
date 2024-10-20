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
    plugins: [
        // Work around for Buffer is undefined:
        // https://github.com/webpack/changelog-v5/issues/10
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ],
  };
