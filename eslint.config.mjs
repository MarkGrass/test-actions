// @ts-check
import eslint from '@eslint/js';
import prettierPlugin from 'eslint-plugin-prettier';
import unusedPlugin from 'eslint-plugin-unused-imports';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const EXTERNAL_LIBS = [
    'express',
    '@nestjs/**',
    'rxjs',
    'typeorm',
    'passport',
    'argon2',
];
const DENIED_PATH_GROUPS = ['shared/*/*/**'];

export default tseslint.config(
    {
        ignores: ['eslint.config.mjs'],
    },
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
        extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
        plugins: {
            import: importPlugin,
            unused: unusedPlugin,
            prettier: prettierPlugin,
        },
        rules: {
            'no-shadow': 'error',
            'no-use-before-define': 'error',
            'no-useless-return': 'warn',
            'no-unused-vars': 'off',
            'newline-before-return': 'warn',
            'unused/no-unused-imports': 'error',
            'unused/no-unused-vars': [
                'error',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                },
            ],
            'import/no-duplicates': 'error',
            'import/prefer-default-export': 'off',
            'import/no-extraneous-dependencies': 'off',
            'import/no-default-export': 'off',
            'import/no-self-import': 'error',
            'import/no-named-as-default': 'error',
            'import/no-cycle': [
                'error',
                {
                    maxDepth: 3,
                    ignoreExternal: true,
                },
            ],
            'import/order': [
                'error',
                {
                    'alphabetize': {
                        order: 'asc',
                        caseInsensitive: true,
                    },
                    'newlines-between': 'always',
                    'pathGroups': [
                        ...EXTERNAL_LIBS.map((lib) => ({
                            pattern: `${lib}**`,
                            group: 'external',
                            position: 'before',
                        })),
                        {
                            pattern: '@shared/**',
                            group: 'internal',
                            position: 'before',
                        },
                        {
                            pattern: '@config/**',
                            group: 'internal',
                            position: 'before',
                        },
                        {
                            pattern: '@entities',
                            group: 'internal',
                            position: 'after',
                        },
                        {
                            pattern: '@guards',
                            group: 'internal',
                            position: 'before',
                        },
                        {
                            pattern: '@decorators',
                            group: 'internal',
                            position: 'before',
                        },
                    ],
                    'pathGroupsExcludedImportTypes': ['builtin'],
                    'groups': [
                        'builtin',
                        'external',
                        'internal',
                        'parent',
                        'sibling',
                        'index',
                    ],
                },
            ],
            'import/no-internal-modules': [
                'error',
                {
                    forbid: DENIED_PATH_GROUPS,
                },
            ],
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-floating-promises': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-empty-object-type': 'error',
            '@typescript-eslint/no-unsafe-function-type': 'error',
            '@typescript-eslint/no-wrapper-object-types': 'error',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-use-before-define': 'error',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-shadow': 'error',
            '@typescript-eslint/no-duplicate-enum-values': 'off',
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                    fixStyle: 'separate-type-imports',
                },
            ],
            'prettier/prettier': 'error',
        },
    },
);
