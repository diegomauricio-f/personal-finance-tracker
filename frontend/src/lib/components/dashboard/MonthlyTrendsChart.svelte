<script lang="ts">
	/**
	 * MonthlyTrendsChart Component - Display monthly financial trends
	 * Updated with i18n support and mobile responsiveness
	 * Uses very small font size on mobile to fit labels without rotation
	 *
	 * @see specs/001-personal-finance-tracker/tasks.md line 179
	 * @see specs/001-personal-finance-tracker/spec.md line 82
	 * @see specs/002-settings-i18n-currency/tasks.md line 135
	 */
	import { analyticsStore } from '$lib';
	import { Chart, Svg, Axis, Spline } from 'layerchart';
	import { t } from '$lib/i18n';
	import { settingsStore } from '$lib/stores/settings';
	import { onMount } from 'svelte';

	// Subscribe to monthly trends
	const monthlyTrends = analyticsStore.monthlyTrends;

	// Responsive state
	let isMobile = $state(false);

	/**
	 * Detect mobile viewport
	 */
	onMount(() => {
		const checkMobile = () => {
			isMobile = window.innerWidth < 640;
		};
		checkMobile();
		window.addEventListener('resize', checkMobile);

		return () => window.removeEventListener('resize', checkMobile);
	});

	/**
	 * Responsive padding for chart
	 * Reduced padding on mobile for compact display
	 */
	const chartPadding = $derived.by(() => {
		return isMobile
			? { top: 20, bottom: 40, left: 40, right: 10 }
			: { top: 30, bottom: 50, left: 70, right: 30 };
	});

	/**
	 * Format month short (e.g., "Jan") - locale-aware
	 */
	function formatMonthShort(monthStr: string): string {
		const [year, month] = monthStr.split('-');
		const date = new Date(parseInt(year), parseInt(month) - 1, 1);
		const locale = $settingsStore.language === 'es' ? 'es-ES' : 'en-US';
		return date.toLocaleDateString(locale, { month: 'short' });
	}

	/**
	 * Prepare data for chart - use month index as x value
	 */
	const chartData = $derived(
		$monthlyTrends.map((trend, index) => ({
			x: index,
			month: trend.month,
			monthLabel: formatMonthShort(trend.month),
			income: trend.totalIncome,
			expenses: trend.totalExpenses,
			savings: trend.netSavings
		}))
	);

	/**
	 * Check if there's any data to display
	 */
	const hasData = $derived(
		$monthlyTrends.some((t) => t.totalIncome > 0) ||
			$monthlyTrends.some((t) => t.totalExpenses > 0)
	);
</script>

<div class="monthly-trends-chart">
	<h3 class="text-xl font-semibold text-gray-900 mb-4">{$t('dashboard.monthlyTrends.title')}</h3>

	{#if !hasData}
		<div class="text-center py-8 bg-gray-50 rounded-lg">
			<p class="text-gray-600">{$t('dashboard.monthlyTrends.noData')}</p>
		</div>
	{:else}
		<!-- Chart Container -->
		<div class="chart-container bg-white border border-gray-200 rounded-lg p-3 sm:p-6" class:mobile-chart={isMobile}>
			<Chart
				data={chartData}
				x="x"
				y={['income', 'expenses', 'savings']}
				yNice
				padding={chartPadding}
			>
				<Svg>
					<Axis placement="left" grid rule />
					<Axis
						placement="bottom"
						format={(d) => {
							const item = chartData.find((item) => item.x === d);
							return item ? item.monthLabel : '';
						}}
						tickLabelProps={isMobile
							? {
									'font-size': '7px',
									'text-anchor': 'middle'
							  }
							: undefined}
						rule
					/>
					<Spline y="income" class="stroke-green-600 stroke-2 fill-none" />
					<Spline y="expenses" class="stroke-red-600 stroke-2 fill-none" />
					<Spline y="savings" class="stroke-blue-600 stroke-2 fill-none" />
				</Svg>
			</Chart>
		</div>

		<!-- Legend -->
		<div class="mt-4 flex flex-wrap gap-4 justify-center">
			<div class="flex items-center gap-2">
				<div class="w-4 h-1 bg-green-600 rounded"></div>
				<span class="text-sm text-gray-700">{$t('dashboard.monthlyTrends.income')}</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="w-4 h-1 bg-red-600 rounded"></div>
				<span class="text-sm text-gray-700">{$t('dashboard.monthlyTrends.expenses')}</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="w-4 h-1 bg-blue-600 rounded"></div>
				<span class="text-sm text-gray-700">{$t('dashboard.monthlyTrends.netSavings')}</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.monthly-trends-chart {
		width: 100%;
	}

	.chart-container {
		height: 350px;
	}

	.chart-container :global(svg) {
		overflow: visible !important;
	}

	.chart-container :global(.fill-none) {
		fill: none !important;
	}

	/* X-axis labels styling - base */
	.chart-container :global(.tick text) {
		font-size: 12px;
		font-family: system-ui, -apple-system, sans-serif;
	}

	/* Mobile chart - using dynamic class */
	.chart-container.mobile-chart {
		height: 300px !important;
	}

	/* Fallback: Media query for cases where JS hasn't loaded yet */
	@media (max-width: 640px) {
		.chart-container {
			height: 300px !important;
		}
	}

	/* Very small screens - further optimizations */
	@media (max-width: 400px) {
		.chart-container,
		.chart-container.mobile-chart {
			height: 280px !important;
		}
	}
</style>
