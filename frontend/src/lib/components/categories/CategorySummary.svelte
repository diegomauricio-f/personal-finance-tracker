<script lang="ts">
	/**
	 * CategorySummary Component - Display spending/income summary by category
	 * Updated with i18n support
	 *
	 * @see specs/001-personal-finance-tracker/data-model.md lines 400-444
	 * @see specs/001-personal-finance-tracker/tasks.md line 153
	 * @see specs/002-settings-i18n-currency/tasks.md line 141
	 */
	import { categoryStore, transactionStore } from '$lib';
	import { formatCurrency } from '$lib/utils/currency';
	import type { Transaction } from '$lib';
	import { t, getCategoryName } from '$lib/i18n';

	// Subscribe to stores
	const categories = categoryStore.categories;
	const transactions = transactionStore.transactions;

	interface CategorySummaryData {
		categoryId: string;
		categoryName: string;
		categoryType: 'predefined' | 'custom';
		totalIncome: number;
		totalExpenses: number;
		netAmount: number;
		transactionCount: number;
		percentageOfExpenses: number;
	}

	/**
	 * Calculate category summaries
	 */
	$: categorySummaries = calculateCategorySummaries($transactions, $categories);

	function calculateCategorySummaries(
		transactions: Transaction[],
		categories: Array<{ id: string; name: string; type: 'predefined' | 'custom' }>
	): CategorySummaryData[] {
		// Calculate total expenses for percentage calculation
		const totalExpenses = transactions
			.filter(t => t.type === 'expense')
			.reduce((sum, t) => sum + t.amount, 0);

		const summaries = categories.map(category => {
			const categoryTransactions = transactions.filter(t => t.categoryId === category.id);

			const totalIncome = categoryTransactions
				.filter(t => t.type === 'income')
				.reduce((sum, t) => sum + t.amount, 0);

			const totalExpensesForCategory = categoryTransactions
				.filter(t => t.type === 'expense')
				.reduce((sum, t) => sum + t.amount, 0);

			const percentageOfExpenses =
				totalExpenses > 0 ? (totalExpensesForCategory / totalExpenses) * 100 : 0;

			return {
				categoryId: category.id,
				categoryName: getCategoryName(category),
				categoryType: category.type,
				totalIncome,
				totalExpenses: totalExpensesForCategory,
				netAmount: totalIncome - totalExpensesForCategory,
				transactionCount: categoryTransactions.length,
				percentageOfExpenses
			};
		});

		// Sort by total expenses descending (most expensive first)
		return summaries.sort((a, b) => b.totalExpenses - a.totalExpenses);
	}

	/**
	 * Get total summary
	 */
	$: totalSummary = {
		totalIncome: categorySummaries.reduce((sum, cat) => sum + cat.totalIncome, 0),
		totalExpenses: categorySummaries.reduce((sum, cat) => sum + cat.totalExpenses, 0),
		transactionCount: categorySummaries.reduce((sum, cat) => sum + cat.transactionCount, 0)
	};

	$: totalNetAmount = totalSummary.totalIncome - totalSummary.totalExpenses;
</script>

<div class="category-summary">
	<!-- Total Summary Card -->
	<div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg mb-6">
		<h3 class="text-lg font-semibold mb-4">{$t('categories.summary.overallTitle')}</h3>
		<div class="grid grid-cols-3 gap-4">
			<div>
				<p class="text-sm opacity-90 mb-1">{$t('categories.summary.totalIncome')}</p>
				<p class="text-2xl font-bold">{formatCurrency(totalSummary.totalIncome)}</p>
			</div>
			<div>
				<p class="text-sm opacity-90 mb-1">{$t('categories.summary.totalExpenses')}</p>
				<p class="text-2xl font-bold">{formatCurrency(totalSummary.totalExpenses)}</p>
			</div>
			<div>
				<p class="text-sm opacity-90 mb-1">{$t('categories.summary.netAmount')}</p>
				<p
					class="text-2xl font-bold"
					class:text-green-200={totalNetAmount >= 0}
					class:text-red-200={totalNetAmount < 0}
				>
					{formatCurrency(totalNetAmount)}
				</p>
			</div>
		</div>
		<p class="text-sm opacity-90 mt-2">{totalSummary.transactionCount} {$t('categories.summary.totalTransactions')}</p>
	</div>

	<!-- Category Breakdown -->
	<div class="space-y-3">
		<h3 class="text-lg font-semibold text-gray-900 mb-3">{$t('categories.summary.breakdown')}</h3>

		{#if categorySummaries.length === 0}
			<div class="text-center py-8 bg-gray-50 rounded-lg">
				<p class="text-gray-600">{$t('categories.summary.noData')}</p>
			</div>
		{:else}
			{#each categorySummaries as summary (summary.categoryId)}
				{#if summary.transactionCount > 0}
					<div class="bg-white border border-gray-200 rounded-lg p-4">
						<div class="flex justify-between items-start mb-2">
							<div class="flex-1">
								<h4 class="text-base font-semibold text-gray-900">
									{summary.categoryName}
									{#if summary.categoryType === 'predefined'}
										<span
											class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium ml-2"
										>
											{$t('categories.predefinedLabel')}
										</span>
									{/if}
								</h4>
								<p class="text-sm text-gray-500">{summary.transactionCount} {summary.transactionCount !== 1 ? $t('categories.transactions') : $t('categories.transaction')}</p>
							</div>
						</div>

						<div class="grid grid-cols-2 gap-4 mt-3">
							<div>
								<p class="text-xs text-gray-600 mb-1">{$t('categories.summary.income')}</p>
								<p class="text-lg font-semibold text-green-600">
									{formatCurrency(summary.totalIncome)}
								</p>
							</div>
							<div>
								<p class="text-xs text-gray-600 mb-1">{$t('categories.summary.expenses')}</p>
								<p class="text-lg font-semibold text-red-600">
									{formatCurrency(summary.totalExpenses)}
								</p>
							</div>
						</div>

						{#if summary.totalExpenses > 0}
							<div class="mt-3">
								<div class="flex justify-between items-center mb-1">
									<span class="text-xs text-gray-600">{$t('categories.summary.percentageOfTotal')}</span>
									<span class="text-xs font-semibold text-gray-900">
										{summary.percentageOfExpenses.toFixed(1)}%
									</span>
								</div>
								<div class="w-full bg-gray-200 rounded-full h-2">
									<div
										class="bg-purple-600 h-2 rounded-full transition-all"
										style="width: {summary.percentageOfExpenses}%"
									></div>
								</div>
							</div>
						{/if}
					</div>
				{/if}
			{/each}
		{/if}
	</div>
</div>

<style>
	.category-summary {
		width: 100%;
	}

	/* Mobile-first responsive design */
	@media (max-width: 640px) {
		.grid-cols-3 {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.grid-cols-2 {
			grid-template-columns: 1fr;
		}
	}
</style>
