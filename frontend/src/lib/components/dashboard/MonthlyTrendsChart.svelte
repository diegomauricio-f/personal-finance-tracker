<script lang="ts">
	/**
	 * MonthlyTrendsChart Component — Chart.js canvas implementation
	 * Replaces SVG-based chart implementation for correct mobile rendering.
	 *
	 * @see specs/003-chartjs-trends-chart/plan.md
	 * @see specs/003-chartjs-trends-chart/tasks.md T007–T021
	 */
	import Chart from 'chart.js/auto';
	import { onMount } from 'svelte';
	import { analyticsStore } from '$lib';
	import { t } from '$lib/i18n';
	import { settingsStore } from '$lib/stores/settings';
	import { buildChartData, buildTooltipCallbacks } from '$lib/utils/chart-utils';

	// Subscribe to analytics store
	const monthlyTrends = analyticsStore.monthlyTrends;

	// T012: hasData check for empty-state branch
	const hasData = $derived(
		$monthlyTrends.some((tr) => tr.totalIncome > 0) ||
			$monthlyTrends.some((tr) => tr.totalExpenses > 0)
	);

	// T007: Canvas binding and chart instance
	let canvas: HTMLCanvasElement = $state() as HTMLCanvasElement;
	let chart: Chart | null = null;

	// T009 + T021: Initialize chart; responsive:true + Chart.js ResizeObserver handles resize
	onMount(() => {
		chart = new Chart(canvas, {
			type: 'line',
			data: buildChartData($monthlyTrends, $settingsStore.language, $t),
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					// T015: built-in legend replaces custom HTML legend
					legend: {
						display: true,
						position: 'bottom'
					},
					// T017: tooltip with currency formatting
					tooltip: {
						callbacks: buildTooltipCallbacks($settingsStore.currency, $settingsStore.language)
					}
				},
				scales: {
					x: { grid: { display: false } },
					y: { beginAtZero: false }
				}
			}
		});

		return () => {
			chart?.destroy();
			chart = null;
		};
	});

	// T010 + T018: Reactive updates when data or settings change
	$effect(() => {
		if (!chart) return;
		const lang = $settingsStore.language;
		const curr = $settingsStore.currency;
		const trends = $monthlyTrends;

		chart.data = buildChartData(trends, lang, $t);
		if (chart.options.plugins?.tooltip) {
			chart.options.plugins.tooltip.callbacks = buildTooltipCallbacks(curr, lang);
		}
		chart.update('none');
	});
</script>

<div class="monthly-trends-chart">
	<h3 class="text-xl font-semibold text-gray-900 mb-4">{$t('dashboard.monthlyTrends.title')}</h3>

	{#if !hasData}
		<!-- T012: Empty state — shown when no transaction data exists -->
		<div class="text-center py-8 bg-gray-50 rounded-lg">
			<p class="text-gray-600">{$t('dashboard.monthlyTrends.noData')}</p>
		</div>
	{:else}
		<!-- T008: Canvas replaces <Chart><Svg><Axis><Spline>; T016: no custom HTML legend -->
		<div class="chart-container bg-white border border-gray-200 rounded-lg p-3 sm:p-6">
			<canvas bind:this={canvas}></canvas>
		</div>
	{/if}
</div>

<style>
	.monthly-trends-chart {
		width: 100%;
	}

	/* T011: Fixed height per viewport — Chart.js handles internal scaling */
	.chart-container {
		height: 300px;
	}

	@media (min-width: 640px) {
		.chart-container {
			height: 350px;
		}
	}
</style>
