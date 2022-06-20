module.exports = {
  plugins: ['cypress'],
  env: {
    'cypress/globals': true
  },
  extends: ['plugin:cypress/recommended'],
  rules: {
    'cypress/no-unnecessary-waiting': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off'
  }
};
