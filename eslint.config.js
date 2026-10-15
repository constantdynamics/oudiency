import js from '@eslint/js';
import eslintReact from '@eslint-react/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Vaste projectregels (zie CLAUDE.md §12, valkuilen uit het prototype):
 * - geen componenten binnen componenten (focusverlies bij elke toetsaanslag);
 * - geen dynamisch samengestelde Tailwind-classnames (`bg-${kleur}-500`);
 * - nooit Date.now()/new Date() in domeinlogica: gebruik clock.now();
 * - nooit dangerouslySetInnerHTML (AI-tekst gaat via de sanitizende renderer).
 */
const restrictedSyntax = [
  {
    selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
    message: 'Gebruik clock.now() uit @/lib/clock in plaats van Date.now().',
  },
  {
    selector: "NewExpression[callee.name='Date'][arguments.length=0]",
    message: 'Gebruik clock.date() uit @/lib/clock in plaats van new Date().',
  },
  {
    selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
    message: 'Render (AI-)tekst via <RichText> uit @/components/RichText, nooit als HTML.',
  },
  {
    selector: "JSXAttribute[name.name='className'] TemplateLiteral > TemplateElement[value.raw=/-$/]",
    message:
      'Geen dynamisch samengestelde Tailwind-classnames: Tailwind genereert die niet. Gebruik CSS-variabelen of volledige classnames.',
  },
];

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules', 'public'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2023,
      globals: { ...globals.browser },
    },
    rules: {
      'no-restricted-syntax': ['error', ...restrictedSyntax],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      eqeqeq: ['error', 'smart'],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },
  {
    files: ['src/**/*.tsx'],
    extends: [
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
      eslintReact.configs['recommended-typescript'],
    ],
    rules: {
      '@eslint-react/no-nested-component-definitions': 'error',
      '@eslint-react/no-nested-lazy-component-declarations': 'error',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    // De klok zelf mag de echte tijd lezen; scripts en tests ook.
    files: ['src/lib/clock.ts', 'scripts/**', 'tests/**', '*.config.ts'],
    rules: { 'no-restricted-syntax': 'off', 'no-console': 'off' },
  },
  {
    files: ['scripts/**', '*.config.{ts,js}'],
    languageOptions: { globals: { ...globals.node } },
  },
  eslintConfigPrettier,
);
