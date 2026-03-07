import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
	plugins: [
		svelte({
			hot: !process.env.VITEST,
			configFile: process.env.VITEST ? './svelte.config.test.js' : './svelte.config.js'
		})
	],
	test: {
		include: ['tests/unit/**/*.{test,spec}.{js,ts}', 'tests/integration/**/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./tests/setup.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'tests/',
				'*.config.*',
				'.svelte-kit/',
				'**/*.svelte',         // Svelte components require E2E (Svelte 5 runes incompatible with jsdom)
				'src/lib/services/**', // Storage service methods for other features covered by feature 001 tests
				'src/lib/models/**'    // Error models covered by their respective feature tests
			],
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 80,
				statements: 80
			}
		}
	},
	resolve: {
		alias: {
			$lib: resolve('./src/lib')
		}
	}
});
