<script lang="ts">
	/**
	 * MonthSummaryCard Component - Display current month's financial summary
	 * Updated with i18n support
	 *
	 * @see specs/001-personal-finance-tracker/tasks.md line 177
	 * @see specs/001-personal-finance-tracker/spec.md lines 81-82
	 */
	import { analyticsStore } from '$lib';
	import { formatCurrency } from '$lib/utils/currency';
	import { t } from '$lib/i18n';
	import { settingsStore } from '$lib/stores/settings';

	// Subscribe to current month summary
	const summary = analyticsStore.currentMonthSummary;

	/**
	 * Format month range for display
	 */
	function formatMonthRange(startDate: Date): string {
		const locale = $settingsStore.language === 'es' ? 'es-ES' : 'en-US';
		const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
		return startDate.toLocaleDateString(locale, options);
	}
</script>

<div class="month-summary-card">
	<div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
		<div class="mb-4">
			<h3 class="text-lg font-semibold opacity-90">{$t('dashboard.summary.title')}</h3>
			<p class="text-sm opacity-80">
				{formatMonthRange($summary.startDate)}
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<!-- Total Income -->
			<div class="bg-blue-700 bg-opacity-50 rounded-lg p-4 border border-white border-opacity-30">
				<p class="text-sm text-white opacity-90 mb-1">{$t('dashboard.summary.totalIncome')}</p>
				<p class="text-3xl font-bold text-white">{formatCurrency($summary.totalIncome)}</p>
			</div>

			<!-- Total Expenses -->
			<div class="bg-blue-700 bg-opacity-50 rounded-lg p-4 border border-white border-opacity-30">
				<p class="text-sm text-white opacity-90 mb-1">{$t('dashboard.summary.totalExpenses')}</p>
				<p class="text-3xl font-bold text-white">{formatCurrency($summary.totalExpenses)}</p>
			</div>

			<!-- Net Savings -->
			<div class="bg-blue-700 bg-opacity-50 rounded-lg p-4 border border-white border-opacity-30">
				<p class="text-sm text-white opacity-90 mb-1">{$t('dashboard.summary.netSavings')}</p>
				<p
					class="text-3xl font-bold"
					class:text-green-300={$summary.netSavings >= 0}
					class:text-red-300={$summary.netSavings < 0}
				>
					{formatCurrency($summary.netSavings)}
				</p>
			</div>
		</div>

		<div class="mt-4 text-sm opacity-90">
			<p>{$summary.transactionCount} {$summary.transactionCount !== 1 ? $t('dashboard.summary.transactions') : $t('dashboard.summary.transaction')} {$t('dashboard.summary.thisMonth')}</p>
		</div>
	</div>
</div>

<style>
	.month-summary-card {
		width: 100%;
	}

	/* Mobile-first responsive design */
	@media (max-width: 768px) {
		.grid {
			grid-template-columns: 1fr;
		}

		.text-3xl {
			font-size: 1.875rem;
		}
	}
</style>
