<script lang="ts">
	/**
	 * Dashboard Page - Financial Insights and Analytics
	 * Updated with i18n support
	 *
	 * @see specs/001-personal-finance-tracker/plan.md lines 183-185
	 * @see specs/001-personal-finance-tracker/tasks.md line 181
	 */
	import { t } from '$lib/i18n';
	import MonthSummaryCard from '$lib/components/dashboard/MonthSummaryCard.svelte';
	import CategoryBreakdown from '$lib/components/dashboard/CategoryBreakdown.svelte';
	import MonthlyTrendsChart from '$lib/components/dashboard/MonthlyTrendsChart.svelte';
	import SavingsRateDisplay from '$lib/components/dashboard/SavingsRateDisplay.svelte';
</script>

<svelte:head>
	<title>Dashboard - Personal Finance Tracker</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-7xl mx-auto">
		<!-- Page Header -->
		<div class="mb-8">
			<h1 class="text-4xl font-bold text-gray-900 mb-2">{$t('dashboard.title')}</h1>
			<p class="text-gray-600">
				{$t('dashboard.subtitle')}
			</p>
		</div>

		<!-- Month Summary Card -->
		<div class="mb-8">
			<MonthSummaryCard />
		</div>

		<!-- Two Column Layout for Savings and Category Breakdown -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
			<!-- Savings Rate Display -->
			<div>
				<SavingsRateDisplay />
			</div>

			<!-- Category Breakdown -->
			<div class="bg-white border border-gray-200 rounded-lg p-6">
				<CategoryBreakdown />
			</div>
		</div>

		<!-- Monthly Trends Chart -->
		<div class="mb-8 bg-white border border-gray-200 rounded-lg p-6">
			<MonthlyTrendsChart />
		</div>

		<!-- Quick Actions -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<a
				href="/transactions/new"
				class="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors text-center min-h-[120px] flex flex-col justify-center"
			>
				<h3 class="text-xl font-semibold mb-2">💰 {$t('dashboard.quickActions.newTransaction')}</h3>
				<p class="text-blue-100 text-sm">{$t('dashboard.quickActions.newTransactionDesc')}</p>
			</a>

			<a
				href="/wallets"
				class="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition-colors text-center min-h-[120px] flex flex-col justify-center"
			>
				<h3 class="text-xl font-semibold mb-2">👛 {$t('dashboard.quickActions.manageWallets')}</h3>
				<p class="text-purple-100 text-sm">{$t('dashboard.quickActions.manageWalletsDesc')}</p>
			</a>

			<a
				href="/categories"
				class="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors text-center min-h-[120px] flex flex-col justify-center"
			>
				<h3 class="text-xl font-semibold mb-2">🏷️ {$t('dashboard.quickActions.manageCategories')}</h3>
				<p class="text-green-100 text-sm">{$t('dashboard.quickActions.manageCategoriesDesc')}</p>
			</a>
		</div>
	</div>
</div>

<style>
	.container {
		min-height: calc(100vh - 64px);
	}

	/* Mobile-first responsive design */
	@media (max-width: 640px) {
		.container {
			padding-left: 1rem;
			padding-right: 1rem;
		}

		h1 {
			font-size: 2rem;
		}

		.grid-cols-1 {
			gap: 1rem;
		}
	}

	@media (max-width: 1024px) {
		.lg\:grid-cols-2 {
			grid-template-columns: 1fr;
		}
	}
</style>
