/**
 * Unit tests for MonthlyTrendsChart pure builder functions
 * Tests data transformation logic without requiring canvas or browser DOM.
 *
 * @see specs/003-chartjs-trends-chart/tasks.md T006
 */
import { describe, it, expect } from 'vitest';
import {
	formatMonthLabel,
	buildChartData,
	buildTooltipCallbacks
} from '$lib/utils/chart-utils';
import type { TooltipItem } from 'chart.js';

const TREND_JAN = { month: '2025-01', totalIncome: 1500, totalExpenses: 800, netSavings: 700 };
const TREND_FEB = { month: '2025-02', totalIncome: 2000, totalExpenses: 1200, netSavings: 800 };

const mockT = (key: string) => {
	const map: Record<string, string> = {
		'dashboard.monthlyTrends.income': 'Ingresos',
		'dashboard.monthlyTrends.expenses': 'Gastos',
		'dashboard.monthlyTrends.netSavings': 'Ahorros Netos'
	};
	return map[key] ?? key;
};

// ─── formatMonthLabel ────────────────────────────────────────────────────────

describe('formatMonthLabel', () => {
	it('returns Spanish short month name for es language', () => {
		const result = formatMonthLabel('2025-01', 'es');
		expect(result.toLowerCase()).toBe('ene');
	});

	it('returns English short month name for en language', () => {
		const result = formatMonthLabel('2025-01', 'en');
		expect(result.toLowerCase()).toBe('jan');
	});

	it('handles February correctly in Spanish', () => {
		const result = formatMonthLabel('2025-02', 'es');
		expect(result.toLowerCase()).toBe('feb');
	});

	it('handles February correctly in English', () => {
		const result = formatMonthLabel('2025-02', 'en');
		expect(result.toLowerCase()).toBe('feb');
	});

	it('handles December correctly in Spanish', () => {
		const result = formatMonthLabel('2025-12', 'es');
		expect(result.toLowerCase()).toBe('dic');
	});

	it('handles December correctly in English', () => {
		const result = formatMonthLabel('2025-12', 'en');
		expect(result.toLowerCase()).toBe('dec');
	});
});

// ─── buildChartData ──────────────────────────────────────────────────────────

describe('buildChartData', () => {
	it('produces correct number of labels from trends', () => {
		const result = buildChartData([TREND_JAN, TREND_FEB], 'es', mockT);
		expect(result.labels).toHaveLength(2);
	});

	it('labels are locale-aware Spanish abbreviations', () => {
		const result = buildChartData([TREND_JAN, TREND_FEB], 'es', mockT);
		expect(result.labels![0].toString().toLowerCase()).toBe('ene');
		expect(result.labels![1].toString().toLowerCase()).toBe('feb');
	});

	it('labels are locale-aware English abbreviations', () => {
		const result = buildChartData([TREND_JAN, TREND_FEB], 'en', mockT);
		expect(result.labels![0].toString().toLowerCase()).toBe('jan');
		expect(result.labels![1].toString().toLowerCase()).toBe('feb');
	});

	it('produces exactly 3 datasets', () => {
		const result = buildChartData([TREND_JAN], 'es', mockT);
		expect(result.datasets).toHaveLength(3);
	});

	it('income dataset uses green-600 border color', () => {
		const result = buildChartData([TREND_JAN], 'es', mockT);
		expect(result.datasets[0].borderColor).toBe('rgb(22, 163, 74)');
	});

	it('expenses dataset uses red-600 border color', () => {
		const result = buildChartData([TREND_JAN], 'es', mockT);
		expect(result.datasets[1].borderColor).toBe('rgb(220, 38, 38)');
	});

	it('net savings dataset uses blue-600 border color', () => {
		const result = buildChartData([TREND_JAN], 'es', mockT);
		expect(result.datasets[2].borderColor).toBe('rgb(37, 99, 235)');
	});

	it('income dataset data matches totalIncome values', () => {
		const result = buildChartData([TREND_JAN, TREND_FEB], 'es', mockT);
		expect(result.datasets[0].data).toEqual([1500, 2000]);
	});

	it('expenses dataset data matches totalExpenses values', () => {
		const result = buildChartData([TREND_JAN, TREND_FEB], 'es', mockT);
		expect(result.datasets[1].data).toEqual([800, 1200]);
	});

	it('net savings dataset data matches netSavings values', () => {
		const result = buildChartData([TREND_JAN, TREND_FEB], 'es', mockT);
		expect(result.datasets[2].data).toEqual([700, 800]);
	});

	it('returns empty labels and data when trends array is empty', () => {
		const result = buildChartData([], 'es', mockT);
		expect(result.labels).toHaveLength(0);
		expect(result.datasets[0].data).toHaveLength(0);
	});
});

// ─── buildTooltipCallbacks ───────────────────────────────────────────────────

describe('buildTooltipCallbacks', () => {
	const makeCtx = (label: string, value: number) =>
		({
			dataset: { label },
			parsed: { y: value }
		}) as unknown as TooltipItem<'line'>;

	it('label callback returns dataset label with formatted Bs. currency', () => {
		const callbacks = buildTooltipCallbacks('Bs.', 'es');
		const result = callbacks.label(makeCtx('Ingresos', 1500));
		expect(result).toContain('Ingresos');
		// Intl.NumberFormat renders BOB as "Bs" (without period) in Node 24
		expect(result).toMatch(/Bs\.?/);
	});

	it('label callback returns dataset label with formatted $ currency', () => {
		const callbacks = buildTooltipCallbacks('$', 'en');
		const result = callbacks.label(makeCtx('Income', 1500));
		expect(result).toContain('Income');
		expect(result).toContain('$');
	});

	it('label callback formats zero correctly', () => {
		const callbacks = buildTooltipCallbacks('Bs.', 'es');
		const result = callbacks.label(makeCtx('Gastos', 0));
		expect(result).toContain('Gastos');
		expect(typeof result).toBe('string');
	});

	it('label callback formats negative values (net savings deficit)', () => {
		const callbacks = buildTooltipCallbacks('$', 'en');
		const result = callbacks.label(makeCtx('Net Savings', -200));
		expect(result).toContain('Net Savings');
		expect(typeof result).toBe('string');
	});
});
