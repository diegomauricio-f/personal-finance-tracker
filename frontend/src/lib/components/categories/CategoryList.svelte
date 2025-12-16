<script lang="ts">
	/**
	 * CategoryList Component - Display predefined (read-only) and custom (editable) categories
	 * Updated with i18n support
	 *
	 * @see specs/001-personal-finance-tracker/tasks.md line 151
	 * @see specs/002-settings-i18n-currency/tasks.md line 140
	 */
	import { categoryStore, transactionStore } from '$lib';
	import type { Category } from '$lib';
	import { createEventDispatcher } from 'svelte';
	import { t, getCategoryName } from '$lib/i18n';
	import { get } from 'svelte/store';

	const dispatch = createEventDispatcher();

	// Subscribe to stores
	const customCategories = categoryStore.customCategories; // Only custom categories
	const allCategories = categoryStore.allCategories; // Includes predefined
	const transactions = transactionStore.transactions;

	/**
	 * Get transaction count for a category
	 */
	function getTransactionCount(categoryId: string): number {
		return $transactions.filter(t => t.categoryId === categoryId).length;
	}

	/**
	 * Handle category deletion
	 */
	async function handleDelete(category: Category) {
		const transactionCount = getTransactionCount(category.id);
		const categoryName = getCategoryName(category);
		const confirmMessage =
			transactionCount > 0
				? `${get(t)('categories.deleteConfirmStart')} "${categoryName}"? ${get(t)('categories.hasTransactions')} ${transactionCount} ${transactionCount !== 1 ? get(t)('categories.transactions') : get(t)('categories.transaction')}. ${get(t)('categories.willBeSoftDeleted')}`
				: `${get(t)('categories.deleteConfirmStart')} "${categoryName}"?`;

		if (confirm(confirmMessage)) {
			try {
				await categoryStore.softDelete(category.id);
			} catch (error) {
				alert(`${get(t)('categories.deleteFailed')}: ${(error as Error).message}`);
			}
		}
	}

	/**
	 * Handle edit request - dispatch event to parent
	 */
	function handleEdit(category: Category) {
		dispatch('edit', category);
	}

	// Separate predefined and custom categories for display
	$: predefinedCategories = $allCategories.filter(c => c.type === 'predefined');
	$: activeCustomCategories = $customCategories;
</script>

<div class="category-list">
	<!-- Predefined Categories Section -->
	<div class="mb-8">
		<h3 class="text-lg font-semibold text-gray-900 mb-3">{$t('categories.predefined')}</h3>
		<div class="space-y-2">
			{#each predefinedCategories as category (category.id)}
				<div
					class="category-item bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-between items-center"
				>
					<div class="flex-1">
						<h4 class="text-base font-medium text-gray-900">
							{getCategoryName(category)}
						</h4>
						<span class="text-sm text-gray-500">
							{getTransactionCount(category.id)} {getTransactionCount(category.id) !== 1 ? $t('categories.transactions') : $t('categories.transaction')}
						</span>
					</div>
					<div class="flex items-center gap-2">
						<span
							class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium"
						>
							{$t('categories.predefinedLabel')}
						</span>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Custom Categories Section -->
	<div>
		<h3 class="text-lg font-semibold text-gray-900 mb-3">{$t('categories.custom')}</h3>
		{#if activeCustomCategories.length === 0}
			<div class="text-center py-8 bg-gray-50 rounded-lg">
				<p class="text-gray-600">{$t('categories.noCustomCategoriesYet')}</p>
			</div>
		{:else}
			<div class="space-y-2">
				{#each activeCustomCategories as category (category.id)}
					<div
						class="category-item bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
					>
						<div class="flex justify-between items-center">
							<div class="flex-1">
								<h4 class="text-base font-medium text-gray-900 mb-1">
									{getCategoryName(category)}
								</h4>
								<span class="text-sm text-gray-500">
									{getTransactionCount(category.id)} {getTransactionCount(category.id) !== 1 ? $t('categories.transactions') : $t('categories.transaction')}
								</span>
							</div>

							<div class="flex gap-2">
								<button
									type="button"
									onclick={() => handleEdit(category)}
									class="text-blue-600 hover:text-blue-800 px-3 py-2 text-sm font-medium min-h-[44px] min-w-[44px] flex items-center justify-center"
									title={$t('categories.editCategory')}
								>
									{$t('common.edit')}
								</button>
								<button
									type="button"
									onclick={() => handleDelete(category)}
									class="text-red-600 hover:text-red-800 px-3 py-2 text-sm font-medium min-h-[44px] min-w-[44px] flex items-center justify-center"
									title={$t('categories.deleteCategory')}
								>
									{$t('common.delete')}
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.category-list {
		width: 100%;
	}

	/* Mobile-first responsive design - minimum 44x44px touch targets */
	@media (max-width: 640px) {
		.category-item {
			padding: 0.75rem;
		}

		.category-item .flex {
			flex-wrap: wrap;
		}

		.category-item .flex.gap-2 {
			margin-top: 0.5rem;
			width: 100%;
		}
	}
</style>
