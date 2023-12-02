// eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['jest', '@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:jest/recommended', 'plugin:@typescript-eslint/recommended'],
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  globals: {
    gsap: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'arrow-spacing': 'error',
    'eqeqeq': 'error',
    'indent': ['error', 2],
    'no-alert': 'error',
    'no-console': 'warn',
    'no-multiple-empty-lines': ['error', { max: 1 }],
    'no-multi-assign': 'error',
    'no-trailing-spaces': 'error',
    'no-var': 'error',
    'object-curly-spacing': ['error', 'always'],
    'prefer-const': 'error',
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'space-before-function-paren': ['error', 'never']
  },
};
