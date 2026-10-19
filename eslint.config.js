import eslintJs from '@eslint/js';
import eslintPluginReact from 'eslint-plugin-react';

export default [
  eslintJs.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        Audio: 'readonly',
        React: 'readonly',
        PaystackPop: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      react: eslintPluginReact,
    },
    settings: {
      react: { version: '18' },
    },
    rules: {
      // --- React #62 prevention: style must be an object, never a string ---
      'react/style-prop-object': 'error',
      // --- Catch raw HTML attributes React does not accept ---
      'react/no-unknown-property': 'error',
      // --- Warn on missing keys in lists ---
      'react/jsx-key': 'error',
      // --- Warn on string refs / other common mistakes ---
      'react/no-string-refs': 'warn',
      'react/no-deprecated': 'error',
      'react/jsx-no-bind': 'warn',
      'react/no-unescaped-entities': 'warn',
      // --- General JS hygiene ---
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'no-console': 'off',
      'eqeqeq': 'warn',
      'prefer-const': 'warn',
    },
  },
  {
    ignores: ['node_modules', 'dist', 'build', '.git', 'reference'],
  },
];