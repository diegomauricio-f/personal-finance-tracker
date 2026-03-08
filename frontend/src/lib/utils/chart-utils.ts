/**
 * Pure chart builder utilities for MonthlyTrendsChart.
 * Extracted as a standalone module so they can be unit-tested without canvas or DOM.
 *
 * @see specs/003-chartjs-trends-chart/tasks.md T003–T005
 */
import type { TooltipItem } from 'chart.js';
import type { Language, Currency } from '$lib/i18n/types';
import { formatCurrency } from '$lib/utils/currency';

export interface MonthlyTrendInput {
	month: string;
	totalIncome: number;
	totalExpenses: number;
	netSavings: number;
}

// T003: Converts "YYYY-MM" → locale-aware short month name ("ene" / "Jan")
export function formatMonthLabel(monthStr: string, language: Language): string {
	const [year, month] = monthStr.split('-');
	const locale = language === 'es' ? 'es-BO' : 'en-US';
	return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString(locale, {
		month: 'short'
	});
}

// T004: Maps MonthlyTrend[] → Chart.js ChartData with 3 series
export function buildChartData(
	trends: MonthlyTrendInput[],
	language: Language,
	tFn: (key: string) => string
) {
	const labels = trends.map((tr) => formatMonthLabel(tr.month, language));
	return {
		labels,
		datasets: [
			{
				label: tFn('dashboard.monthlyTrends.income'),
				data: trends.map((tr) => tr.totalIncome),
				borderColor: 'rgb(22, 163, 74)',
				backgroundColor: 'rgba(22, 163, 74, 0.1)',
				tension: 0.3,
				fill: false
			},
			{
				label: tFn('dashboard.monthlyTrends.expenses'),
				data: trends.map((tr) => tr.totalExpenses),
				borderColor: 'rgb(220, 38, 38)',
				backgroundColor: 'rgba(220, 38, 38, 0.1)',
				tension: 0.3,
				fill: false
			},
			{
				label: tFn('dashboard.monthlyTrends.netSavings'),
				data: trends.map((tr) => tr.netSavings),
				borderColor: 'rgb(37, 99, 235)',
				backgroundColor: 'rgba(37, 99, 235, 0.1)',
				tension: 0.3,
				fill: false
			}
		]
	};
}

// T005: Builds Chart.js tooltip callbacks with currency formatting
export function buildTooltipCallbacks(currency: Currency, language: Language) {
	void language; // language already encoded in currency locale via formatCurrency
	return {
		label: (ctx: TooltipItem<'line'>) => {
			const value = formatCurrency(ctx.parsed.y, currency);
			return `${ctx.dataset.label}: ${value}`;
		}
	};
}
