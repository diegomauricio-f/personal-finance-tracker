<script lang="ts">
	/**
	 * CategoryBreakdown Component - Display category spending breakdown
	 * Updated with i18n support
	 *
	 * @see specs/001-personal-finance-tracker/tasks.md line 178
	 * @see specs/001-personal-finance-tracker/spec.md line 84
	 * @see specs/002-settings-i18n-currency/tasks.md line 134
	 */
	import { analyticsStore } from '$lib';
	import { formatCurrency } from '$lib/utils/currency';
	import { t } from '$lib/i18n';

	// Subscribe to category summary
	const categorySummary = analyticsStore.categorySummary;

	/**
	 * Filter categories with expenses for visual breakdown
	 */
	$: categoriesWithExpenses = $categorySummary.filter((cat) => cat.totalExpenses > 0);

	/**
	 * Get color for category (cycling through a palette)
	 */
	function getCategoryColor(index: number): string {
		const colors = [
			'#3b82f6', // blue
			'#8b5cf6', // purple
			'#ec4899', // pink
			'#f59e0b', // amber
			'#10b981', // green
			'#ef4444', // red
			'#6366f1', // indigo
			'#14b8a6', // teal
			'#f97316', // orange
			'#84cc16' // lime
		];
		return colors[index % colors.length];
	}
</script>

<div class="category-breakdown">
	<h3 class="text-xl font-semibold text-gray-900 mb-4">{$t('dashboard.categoryBreakdown.title')}</h3>

	{#if categoriesWithExpenses.length === 0}
		<div class="text-center py-8 bg-gray-50 rounded-lg">
			<p class="text-gray-600">{$t('dashboard.categoryBreakdown.noData')}</p>
		</div>
	{:else}
		<!-- Category List with Visual Bars -->
		<div class="space-y-4">
			{#each categoriesWithExpenses as category, index (category.categoryId)}
				<div class="category-item">
					<div class="flex justify-between items-center mb-2">
						<div class="flex items-center gap-2">
							<div
								class="w-4 h-4 rounded"
								style="background-color: {getCategoryColor(index)}"
							></div>
							<h4 class="text-sm font-semibold text-gray-900">
								{category.categoryName}
							</h4>
						</div>
						<div class="text-right">
							<p class="text-sm font-semibold text-gray-900">
								{formatCurrency(category.totalExpenses)}
							</p>
							<p class="text-xs text-gray-500">{category.percentage.toFixed(1)}%</p>
						</div>
					</div>

					<!-- Progress Bar -->
					<div class="w-full bg-gray-200 rounded-full h-3">
						<div
							class="h-3 rounded-full transition-all duration-300"
							style="width: {category.percentage}%; background-color: {getCategoryColor(index)}"
						></div>
					</div>

					<p class="text-xs text-gray-500 mt-1">
						{category.transactionCount} {category.transactionCount !== 1 ? $t('dashboard.summary.transactions') : $t('dashboard.summary.transaction')}
					</p>
				</div>
			{/each}
		</div>

		<!-- Summary Stats -->
		<div class="mt-6 pt-6 border-t border-gray-200">
			<div class="grid grid-cols-2 gap-4">
				<div>
					<p class="text-sm text-gray-600 mb-1">{$t('dashboard.categoryBreakdown.totalCategories')}</p>
					<p class="text-2xl font-bold text-gray-900">{categoriesWithExpenses.length}</p>
				</div>
				<div>
					<p class="text-sm text-gray-600 mb-1">{$t('dashboard.categoryBreakdown.totalExpenses')}</p>
					<p class="text-2xl font-bold text-red-600">
						{formatCurrency(
							categoriesWithExpenses.reduce((sum, cat) => sum + cat.totalExpenses, 0)
						)}
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.category-breakdown {
		width: 100%;
	}

	.category-item {
		padding: 0.75rem;
		background-color: white;
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
	}

	/* Mobile-first responsive design */
	@media (max-width: 640px) {
		.grid-cols-2 {
			grid-template-columns: 1fr;
		}
	}
</style>
