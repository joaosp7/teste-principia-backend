// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      'semi': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',//for dev purposes
      '@typescript-eslint/no-unsafe-assignment': 'off', //for dev purposes
      '@typescript-eslint/no-unused-vars': 'off', //for dev purposes
      '@typescript-eslint/no-unsafe-member-access': 'off', //for dev purposes
      '@typescript-eslint/no-unsafe-argument': 'off', //for dev purposes
      '@typescript-eslint/no-unsafe-return': 'off', //for dev purposes
      '@typescript-eslint/no-unsafe-call': 'off', //for dev purposes
      'prettier/prettier': ['off', { singleQuote: true, semi: true }],
    },
  },
  {
    files: ['**/.spec.ts', '**/*.e2e-spec.ts'],
    rules: {
      'no-invalid-this': 'off'
    }
  }
);