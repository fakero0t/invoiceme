module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    // Design Token Enforcement
    'no-restricted-syntax': [
      'error',
      {
        selector: "Literal[value=/#[0-9A-Fa-f]{3,6}$/]",
        message: 'Hardcoded color values are not allowed. Use design tokens from CSS variables instead.',
      },
      {
        selector: "CallExpression[callee.name='rgb']",
        message: 'RGB color values are not allowed. Use design tokens from CSS variables instead.',
      },
      {
        selector: "CallExpression[callee.name='rgba']",
        message: 'RGBA color values are not allowed. Use design tokens from CSS variables instead.',
      },
    ],

    // Vue Rules
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/no-deprecated-slot-attribute': 'error',
    'vue/no-multiple-template-root': 'off',
    'vue/multi-word-component-names': 'off',

    // TypeScript Rules
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_' },
    ],

    // General Rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};

