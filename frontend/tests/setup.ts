/**
 * Vitest setup file
 * Configures the testing environment for Svelte 5
 *
 * @see specs/002-settings-i18n-currency/tasks.md
 */

import { expect, afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/svelte';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock localStorage for tests
const localStorageMock = (() => {
	let store: Record<string, string> = {};

	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value.toString();
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		}
	};
})();

Object.defineProperty(window, 'localStorage', {
	value: localStorageMock
});

// Suppress console warnings in tests
const originalWarn = console.warn;
const originalError = console.error;

beforeEach(() => {
	// Clear localStorage before each test
	localStorageMock.clear();
});

afterEach(() => {
	// Cleanup after each test
	cleanup();

	// Restore console methods
	console.warn = originalWarn;
	console.error = originalError;
});
