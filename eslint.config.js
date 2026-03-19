import eslintJs from '@eslint/js'
import stylisticPlugin from '@stylistic/eslint-plugin'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import importPlugin from 'eslint-plugin-import'
import unusedImportsPlugin from 'eslint-plugin-unused-imports'

export default [
  // Global ignores (replaces .eslintignore)
  {
    ignores: [
      'node_modules',
      'dist',
      'bin/test',
    ],
  },

  // Base recommended configs
  eslintJs.configs.recommended,
  stylisticPlugin.configs.recommended,

  // Import plugin recommended + typescript configs (converted from legacy)
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      ...importPlugin.configs.recommended.rules,
      ...importPlugin.configs.typescript.rules,
    },
    settings: importPlugin.configs.typescript.settings,
  },

  // TypeScript strict rules (converted from legacy config)
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: tsPlugin.configs.strict.rules,
  },

  // TypeScript and import plugin configuration
  {
    files: ['**/*.ts', '**/*.js'],
    plugins: {
      '@typescript-eslint': tsPlugin,
      '@stylistic': stylisticPlugin,
      'import': importPlugin,
      'unused-imports': unusedImportsPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './bin/tsconfig.json',
        extraFileExtensions: [],
        warnOnUnsupportedTypeScriptVersion: false,
      },
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
      },
    },
    settings: {
      react: {
        version: '999.999.999',
      },
    },
    rules: {
      // Import plugin overrides (recommended is used above)
      'import/no-unresolved': 'off',

      // Disabled base rules that are covered by TypeScript or stylistic
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-redeclare': 'off',
      'indent': 'off',
      'semi': 'off',

      // Stylistic rules (moved from @typescript-eslint in v6)
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/indent': ['error', 2, { SwitchCase: 1 }],
      '@stylistic/member-delimiter-style': ['error', {
        multiline: { delimiter: 'none' },
        singleline: { delimiter: 'semi' },
      }],
      // Stylistic rules overrides (others come from recommended-flat)
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1, maxBOF: 0 }],
      '@stylistic/brace-style': ['error', '1tbs'],
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: 'always' }],
      '@stylistic/no-extra-semi': 'error', // Not in recommended

      // Disable stylistic rules that conflict with codebase patterns
      '@stylistic/no-mixed-operators': 'off',
      '@stylistic/max-statements-per-line': 'off',
      '@stylistic/multiline-ternary': 'off',

      // TypeScript rules (override strict where needed)
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],
      
      // Unused imports (warn level, auto-fixable)
      'unused-imports/no-unused-imports': 'warn',
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'], leadingUnderscore: 'allow' },
        { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'function', format: ['camelCase'], leadingUnderscore: 'forbid' },
        { selector: ['classProperty'], format: ['camelCase', 'UPPER_CASE'], leadingUnderscore: 'forbid' },
        { selector: ['classMethod'], format: ['camelCase'], leadingUnderscore: 'forbid' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/no-useless-constructor': 'off',

      // Style rules
      'arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
      'object-curly-newline': ['error', { consistent: true }],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1, maxBOF: 0 }],
      'require-await': 'off', // Disabled in favor of TypeScript version
      '@typescript-eslint/require-await': 'off', // Only flags truly unnecessary async (no await, no Promise return)

      // Disable base ESLint rules that are too strict for this codebase
      'no-empty': 'off',
      'no-fallthrough': 'off',
      'no-case-declarations': 'off',
      'no-control-regex': 'off', // Control characters are intentionally matched for path sanitization
    },
  },
  // Test files: allow chai-style assertions
  {
    files: ['**/*.test.ts'],
    rules: {
      'no-unused-expressions': 'off', // Chai assertions are expressions
      '@typescript-eslint/no-unused-expressions': 'off', // Chai assertions are expressions
    },
  },
]

