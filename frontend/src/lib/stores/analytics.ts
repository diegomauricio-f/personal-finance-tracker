/**
 * Analytics Store - Derived store for dashboard analytics and summaries
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 470-571
 */

import { derived } from 'svelte/store';
import type { Readable } from 'svelte/store';
import { transactionStore } from './transactions';
import { categoryStore } from './categories';
import { getCategoryName } from '$lib/i18n';

/**
 * Analytics Types
 */
export interface MonthSummary {
	totalIncome: number;
	totalExpenses: number;
	netSavings: number;
	transactionCount: number;
	startDate: Date;
	endDate: Date;
}

export interface CategorySummary {
	categoryId: string;
	categoryName: string;
	totalIncome: number;
	totalExpenses: number;
	transactionCount: number;
	percentage: number; // % of total expenses
}

export interface MonthlyTrend {
	month: string; // YYYY-MM format
	totalIncome: number;
	totalExpenses: number;
	netSavings: number;
	savingsRate: number; // Percentage
}

/**
 * Utility: Get current month date range
 */
function getCurrentMonthRange(): { startDate: Date; endDate: Date } {
	const now = new Date();
	const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
	const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
	return { startDate, endDate };
}

/**
 * Utility: Check if date is in range
 */
function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
	return date >= startDate && date <= endDate;
}

/**
 * Utility: Get month key (YYYY-MM format)
 */
function getMonthKey(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	return `${year}-${month}`;
}

/**
 * Utility: Get last N months
 */
function getLastNMonths(n: number): string[] {
	const months: string[] = [];
	const now = new Date();

	for (let i = n - 1; i >= 0; i--) {
		const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
		months.push(getMonthKey(date));
	}

	return months;
}

/**
 * Current Month Summary - Derived Store
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 520-529
 */
export const currentMonthSummary: Readable<MonthSummary> = derived(
	transactionStore.transactions,
	($transactions) => {
		const { startDate, endDate } = getCurrentMonthRange();

		const currentMonthTransactions = $transactions.filter((t) =>
			isDateInRange(t.date, startDate, endDate)
		);

		const totalIncome = currentMonthTransactions
			.filter((t) => t.type === 'income')
			.reduce((sum, t) => sum + t.amount, 0);

		const totalExpenses = currentMonthTransactions
			.filter((t) => t.type === 'expense')
			.reduce((sum, t) => sum + t.amount, 0);

		const netSavings = totalIncome - totalExpenses;

		return {
			totalIncome,
			totalExpenses,
			netSavings,
			transactionCount: currentMonthTransactions.length,
			startDate,
			endDate
		};
	}
);

/**
 * Category Summary - Derived Store
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 532-543
 */
export const categorySummary: Readable<CategorySummary[]> = derived(
	[transactionStore.transactions, categoryStore.categories],
	([$transactions, $categories]) => {
		const { startDate, endDate } = getCurrentMonthRange();

		const currentMonthTransactions = $transactions.filter((t) =>
			isDateInRange(t.date, startDate, endDate)
		);

		// Calculate total expenses for percentage calculation
		const totalExpenses = currentMonthTransactions
			.filter((t) => t.type === 'expense')
			.reduce((sum, t) => sum + t.amount, 0);

		const summaries = $categories.map((category) => {
			const categoryTransactions = currentMonthTransactions.filter(
				(t) => t.categoryId === category.id
			);

			const totalIncome = categoryTransactions
				.filter((t) => t.type === 'income')
				.reduce((sum, t) => sum + t.amount, 0);

			const totalExpensesForCategory = categoryTransactions
				.filter((t) => t.type === 'expense')
				.reduce((sum, t) => sum + t.amount, 0);

			const percentage = totalExpenses > 0 ? (totalExpensesForCategory / totalExpenses) * 100 : 0;

			return {
				categoryId: category.id,
				categoryName: getCategoryName(category),
				totalIncome,
				totalExpenses: totalExpensesForCategory,
				transactionCount: categoryTransactions.length,
				percentage
			};
		});

		// Sort by total expenses descending
		return summaries.sort((a, b) => b.totalExpenses - a.totalExpenses);
	}
);

/**
 * Monthly Trends - Derived Store (Last 12 Months)
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 546-557
 */
export const monthlyTrends: Readable<MonthlyTrend[]> = derived(
	transactionStore.transactions,
	($transactions) => {
		const last12Months = getLastNMonths(12);
		const monthlyData = new Map<string, MonthlyTrend>();

		// Initialize all months with zero values
		last12Months.forEach((month) => {
			monthlyData.set(month, {
				month,
				totalIncome: 0,
				totalExpenses: 0,
				netSavings: 0,
				savingsRate: 0
			});
		});

		// Aggregate transactions by month
		$transactions.forEach((transaction) => {
			const monthKey = getMonthKey(transaction.date);

			if (monthlyData.has(monthKey)) {
				const data = monthlyData.get(monthKey)!;

				if (transaction.type === 'income') {
					data.totalIncome += transaction.amount;
				} else if (transaction.type === 'expense') {
					data.totalExpenses += transaction.amount;
				}
			}
		});

		// Calculate net savings and savings rate for each month
		monthlyData.forEach((data) => {
			data.netSavings = data.totalIncome - data.totalExpenses;
			data.savingsRate = data.totalIncome > 0 ? (data.netSavings / data.totalIncome) * 100 : 0;
		});

		// Return as sorted array (chronologically)
		return last12Months.map((month) => monthlyData.get(month)!);
	}
);

/**
 * Savings Rate - Derived Store
 *
 * @see specs/001-personal-finance-tracker/contracts/stores.md lines 559-571
 */
export const savingsRate: Readable<number> = derived(currentMonthSummary, ($summary) => {
	if ($summary.totalIncome === 0) {
		return 0;
	}
	return ($summary.netSavings / $summary.totalIncome) * 100;
});

/**
 * Analytics Store Interface
 */
export interface AnalyticsStore {
	currentMonthSummary: Readable<MonthSummary>;
	categorySummary: Readable<CategorySummary[]>;
	monthlyTrends: Readable<MonthlyTrend[]>;
	savingsRate: Readable<number>;
}

/**
 * Exported Analytics Store
 */
export const analyticsStore: AnalyticsStore = {
	currentMonthSummary,
	categorySummary,
	monthlyTrends,
	savingsRate
};
