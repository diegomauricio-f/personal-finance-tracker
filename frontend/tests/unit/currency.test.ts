/**
 * Unit tests for currency formatting utilities
 *
 * @see specs/002-settings-i18n-currency/tasks.md lines 189-197
 * @see specs/002-settings-i18n-currency/plan.md
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { formatCurrency, formatCurrencyCompact, CURRENCY_MAP } from '$lib/utils/currency';
import { settingsStore } from '$lib/stores/settings';
import type { Currency } from '$lib/i18n/types';

/* eslint-disable max-lines-per-function */
describe('Currency Formatting Utilities', () => {
	beforeEach(() => {
		// Reset settings store to defaults before each test
		settingsStore._resetInitialization();
		settingsStore.initializeSettings();
	});

	describe('T052: formatCurrency with Bolivianos (Bs.)', () => {
		it('should format amount in Bolivianos with correct locale (es-BO)', () => {
			// Arrange
			const amount = 1500.5;
			const currency: Currency = 'Bs.';

			// Act
			const result = formatCurrency(amount, currency);

			// Assert
			// Bolivianos should use es-BO locale: "Bs. 1.500,50"
			// The exact format depends on Intl.NumberFormat for es-BO
			expect(result).toContain('1');
			expect(result).toContain('500');
			expect(result).toContain('50');
		});

		it('should use comma as decimal separator for Bolivianos', () => {
			// Arrange
			const amount = 100.99;
			const currency: Currency = 'Bs.';

			// Act
			const result = formatCurrency(amount, currency);

			// Assert - es-BO uses comma for decimals
			expect(result).toMatch(/,99/);
		});

		it('should use dot as thousands separator for Bolivianos', () => {
			// Arrange
			const amount = 1234567.89;
			const currency: Currency = 'Bs.';

			// Act
			const result = formatCurrency(amount, currency);

			// Assert - es-BO uses dot for thousands
			// Format should be like: Bs. 1.234.567,89
			expect(result).toMatch(/1\.234\.567/);
		});
	});

	describe('T053: formatCurrency with US Dollars ($)', () => {
		it('should format amount in US Dollars with correct locale (en-US)', () => {
			// Arrange
			const amount = 1500.5;
			const currency: Currency = '$';

			// Act
			const result = formatCurrency(amount, currency);

			// Assert
			// Dollars should use en-US locale: "$1,500.50"
			expect(result).toContain('$');
			expect(result).toContain('1');
			expect(result).toContain('500');
			expect(result).toContain('50');
		});

		it('should use dot as decimal separator for US Dollars', () => {
			// Arrange
			const amount = 100.99;
			const currency: Currency = '$';

			// Act
			const result = formatCurrency(amount, currency);

			// Assert - en-US uses dot for decimals
			expect(result).toMatch(/\.99/);
		});

		it('should use comma as thousands separator for US Dollars', () => {
			// Arrange
			const amount = 1234567.89;
			const currency: Currency = '$';

			// Act
			const result = formatCurrency(amount, currency);

			// Assert - en-US uses comma for thousands
			// Format should be like: $1,234,567.89
			expect(result).toMatch(/1,234,567/);
		});
	});

	describe('T054: formatCurrency defaults to user setting from store', () => {
		it('should use Bs. when no currency parameter provided and store has Bs.', () => {
			// Arrange
			settingsStore.setCurrency('Bs.');
			const amount = 100;

			// Act
			const result = formatCurrency(amount);

			// Assert - Should format as Bolivianos
			expect(result).toMatch(/,00/); // Bolivianos use comma for decimals
		});

		it('should use $ when no currency parameter provided and store has $', () => {
			// Arrange
			settingsStore.setCurrency('$');
			const amount = 100;

			// Act
			const result = formatCurrency(amount);

			// Assert - Should format as US Dollars
			expect(result).toContain('$');
			expect(result).toMatch(/\.00/); // Dollars use dot for decimals
		});

		it('should override store setting when explicit currency provided', () => {
			// Arrange
			settingsStore.setCurrency('Bs.');
			const amount = 100;

			// Act
			const result = formatCurrency(amount, '$');

			// Assert - Should format as US Dollars despite store having Bs.
			expect(result).toContain('$');
			expect(result).toMatch(/\.00/); // Dollars use dot for decimals
		});
	});

	describe('T055: formatCurrencyCompact with Bolivianos', () => {
		it('should format large amounts in compact notation for Bolivianos', () => {
			// Arrange
			const amount = 1500;
			const currency: Currency = 'Bs.';

			// Act
			const result = formatCurrencyCompact(amount, currency);

			// Assert - Should be compact (e.g., "Bs. 1,5K" or similar)
			expect(result).toContain('1');
			// Compact notation varies by locale, just ensure it's shorter
			expect(result.length).toBeLessThan(15);
		});

		it('should format millions in compact notation for Bolivianos', () => {
			// Arrange
			const amount = 1500000;
			const currency: Currency = 'Bs.';

			// Act
			const result = formatCurrencyCompact(amount, currency);

			// Assert - Should contain M for millions
			expect(result).toMatch(/[MmKk]/);
		});
	});

	describe('T056: formatCurrencyCompact with US Dollars', () => {
		it('should format large amounts in compact notation for US Dollars', () => {
			// Arrange
			const amount = 1500;
			const currency: Currency = '$';

			// Act
			const result = formatCurrencyCompact(amount, currency);

			// Assert - Should be compact (e.g., "$1.5K")
			expect(result).toContain('$');
			expect(result).toMatch(/[1-9]/);
			expect(result.length).toBeLessThan(15);
		});

		it('should format millions in compact notation for US Dollars', () => {
			// Arrange
			const amount = 1500000;
			const currency: Currency = '$';

			// Act
			const result = formatCurrencyCompact(amount, currency);

			// Assert - Should contain M for millions
			expect(result).toContain('$');
			expect(result).toMatch(/[MmKk]/);
		});
	});

	describe('T057: formatCurrencyCompact defaults to user setting', () => {
		it('should use store currency when no parameter provided', () => {
			// Arrange
			settingsStore.setCurrency('$');
			const amount = 1500;

			// Act
			const result = formatCurrencyCompact(amount);

			// Assert - Should format as US Dollars
			expect(result).toContain('$');
		});

		it('should override store setting when explicit currency provided', () => {
			// Arrange
			settingsStore.setCurrency('$');
			const amount = 1500;

			// Act
			const result = formatCurrencyCompact(amount, 'Bs.');

			// Assert - Should format as Bolivianos despite store having $
			// Bolivianos format will have comma for decimals
			expect(result).not.toContain('$');
		});
	});

	describe('T058: CURRENCY_MAP configuration', () => {
		it('should have correct mapping for Bolivianos', () => {
			// Assert
			expect(CURRENCY_MAP['Bs.']).toBeDefined();
			expect(CURRENCY_MAP['Bs.'].code).toBe('BOB');
			expect(CURRENCY_MAP['Bs.'].locale).toBe('es-BO');
		});

		it('should have correct mapping for US Dollars', () => {
			// Assert
			expect(CURRENCY_MAP['$']).toBeDefined();
			expect(CURRENCY_MAP['$'].code).toBe('USD');
			expect(CURRENCY_MAP['$'].locale).toBe('en-US');
		});

		it('should only have two currencies defined', () => {
			// Assert
			const currencyKeys = Object.keys(CURRENCY_MAP);
			expect(currencyKeys).toHaveLength(2);
			expect(currencyKeys).toContain('Bs.');
			expect(currencyKeys).toContain('$');
		});
	});

	describe('Edge cases and error handling', () => {
		it('should handle zero amount', () => {
			// Act
			const resultBs = formatCurrency(0, 'Bs.');
			const resultUsd = formatCurrency(0, '$');

			// Assert
			expect(resultBs).toContain('0');
			expect(resultUsd).toContain('0');
		});

		it('should handle negative amounts', () => {
			// Act
			const resultBs = formatCurrency(-100, 'Bs.');
			const resultUsd = formatCurrency(-100, '$');

			// Assert - Should include negative sign
			expect(resultBs).toMatch(/-/);
			expect(resultUsd).toMatch(/-/);
		});

		it('should handle very small decimal amounts', () => {
			// Act
			const result = formatCurrency(0.01, '$');

			// Assert
			expect(result).toContain('0');
			expect(result).toContain('01');
		});

		it('should handle very large amounts', () => {
			// Act
			const result = formatCurrency(999999999.99, '$');

			// Assert
			expect(result).toContain('999');
		});
	});
});
