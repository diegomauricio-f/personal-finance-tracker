import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import sveltePlugin from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import globals from 'globals';

export default [
	js.configs.recommended,
	{
		files: ['**/*.ts', '**/*.svelte'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: './tsconfig.json',
				extraFileExtensions: ['.svelte']
			},
			globals: {
				...globals.browser
			}
		},
		plugins: {
			'@typescript-eslint': tsPlugin
		},
		rules: {
			// Constitution rules
			'complexity': ['error', 15], // max cyclomatic complexity 15
			'max-lines-per-function': ['error', { max: 30, skipBlankLines: true, skipComments: true }], // max method length 30
			'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }], // max file size 300

			// TypeScript recommended rules
			...tsPlugin.configs.recommended.rules
		}
	},
	...sveltePlugin.configs['flat/recommended'],
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tsParser
			}
		},
		rules: {
			// Disable navigation resolve warnings for static links
			'svelte/no-navigation-without-resolve': 'off'
		}
	},
	{
		// Relaxed rules for test files
		files: ['tests/**/*.ts', 'tests/**/*.spec.ts'],
		rules: {
			'max-lines-per-function': 'off', // Allow longer test functions
			'@typescript-eslint/no-unused-vars': 'warn', // Warn instead of error for unused vars
			'@typescript-eslint/no-explicit-any': 'warn' // Warn instead of error for any types
		}
	},
	{
		ignores: [
			'.svelte-kit/**',
			'build/**',
			'node_modules/**',
			'*.config.js',
			'*.config.ts'
		]
	}
];
