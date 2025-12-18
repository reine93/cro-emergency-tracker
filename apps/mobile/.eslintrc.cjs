module.exports = {
  extends: [
    '../../.eslintrc.cjs',
    'plugin:react/recommended',
  ],
  env: {
    browser: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
