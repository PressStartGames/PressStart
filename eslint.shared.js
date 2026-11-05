// Shared ESLint flat-config pieces for client/, admin/ and server/. One plain module at the workspace root
// (no internal package): the plugins are root devDependencies, so every package resolves the same versions.
// Usage in a package: `import { reactConfig } from '../eslint.shared.js'; export default reactConfig({ ignores: [...] });`
import js from '@eslint/js';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { importX } from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const unused = [
  'error',
  { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
];

// Barrel files re-export and defeat tree-shaking and route-level splitting (Vercel bundle-barrel-imports).
// Import the module that defines the thing, not a folder's index.
const noBarrels = {
  patterns: [
    {
      regex: '^\\.{1,2}/?$|/index(\\.[a-z]+)?$',
      message: 'Import the defining module directly, not a barrel or index file.',
    },
  ],
};

const shared = {
  extends: [js.configs.recommended, ...tseslint.configs.recommended],
  plugins: { 'import-x': importX },
  settings: {
    'import-x/resolver-next': [createTypeScriptImportResolver({ alwaysTryTypes: true })],
  },
  rules: {
    '@typescript-eslint/no-unused-vars': unused,
    'import-x/no-cycle': ['error', { maxDepth: 4 }],
    'import-x/no-self-import': 'error',
    'import-x/no-duplicates': 'error',
    'no-restricted-imports': ['error', noBarrels],
  },
};

/**
 * React + browser apps (client, admin).
 * @param {{ ignores?: string[], rules?: Record<string, unknown>, refresh?: boolean, globals?: object }} [opts]
 *   `rules` are extra/overriding rules for that package (use sparingly, with a TODO).
 */
export function reactConfig({
  ignores = [],
  rules = {},
  refresh = true,
  globals: extra = {},
} = {}) {
  return tseslint.config(
    { ignores: ['dist', 'playwright-report', 'test-results', ...ignores] },
    {
      files: ['**/*.{ts,tsx}'],
      extends: [...shared.extends, jsxA11y.flatConfigs.recommended],
      languageOptions: {
        ecmaVersion: 2022,
        globals: { ...globals.browser, ...globals.node, ...extra },
      },
      plugins: {
        ...shared.plugins,
        'react-hooks': reactHooks,
        ...(refresh ? { 'react-refresh': reactRefresh } : {}),
      },
      settings: shared.settings,
      rules: {
        ...shared.rules,
        // `recommended` of react-hooks 7 = rules-of-hooks, exhaustive-deps and the React Compiler rules
        // (purity, set-state-in-effect, refs, immutability, static-components, ...).
        ...reactHooks.configs.recommended.rules,
        // Scrollable regions need a tab stop (axe scrollable-region-focusable): allowed on role=region only.
        'jsx-a11y/no-noninteractive-tabindex': ['error', { roles: ['region'], tags: [] }],
        ...(refresh
          ? { 'react-refresh/only-export-components': ['warn', { allowConstantExport: true }] }
          : {}),
        ...rules,
      },
    },
  );
}

/** Non-React TypeScript (server worker, scripts). No React, no DOM globals. */
export function nodeConfig({
  ignores = [],
  rules = {},
  globals: g = { ...globals.serviceworker, ...globals.node },
} = {}) {
  return tseslint.config(
    { ignores: ['dist', '.wrangler', ...ignores] },
    {
      files: ['**/*.ts'],
      extends: shared.extends,
      languageOptions: { ecmaVersion: 2022, globals: g },
      plugins: shared.plugins,
      settings: shared.settings,
      rules: { ...shared.rules, ...rules },
    },
  );
}
