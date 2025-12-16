<script lang="ts">
	/**
	 * TransactionFilters Component - Filter transactions by multiple criteria
	 * Updated with i18n support
	 *
	 * @see specs/001-personal-finance-tracker/tasks.md line 219
	 * @see specs/002-settings-i18n-currency/tasks.md line 130
	 */
	import { walletStore, categoryStore } from '$lib';
	import { t, getCategoryName } from '$lib/i18n';
	import type { TransactionFilters } from '$lib/stores/transactions';

	// Svelte 5 pattern: callback props
	interface Props {
		onfilterchange: (filters: TransactionFilters) => void;
	}

	let { onfilterchange }: Props = $props();

	// Filter state
	let walletId = $state('');
	let categoryId = $state('');
	let type = $state<'income' | 'expense' | ''>('');
	let startDate = $state('');
	let endDate = $state('');
	let searchTerm = $state('');

	// Store subscriptions
	const wallets = walletStore.wallets;
	const categories = categoryStore.categories;

	// Show/hide filters
	let showFilters = $state(false);

	/**
	 * Apply filters and notify parent
	 */
	function applyFilters() {
		const filters: TransactionFilters = {};

		if (walletId) filters.walletId = walletId;
		if (categoryId) filters.categoryId = categoryId;
		if (type) filters.type = type as 'income' | 'expense';
		if (startDate) filters.startDate = new Date(startDate);
		if (endDate) filters.endDate = new Date(endDate);
		if (searchTerm.trim()) filters.searchTerm = searchTerm.trim();

		onfilterchange(filters);
	}

	/**
	 * Clear all filters
	 */
	function clearFilters() {
		walletId = '';
		categoryId = '';
		type = '';
		startDate = '';
		endDate = '';
		searchTerm = '';
		onfilterchange({});
	}

	/**
	 * Auto-apply filters whenever any filter value changes
	 */
	$effect(() => {
		// Track all filter values to trigger reactivity (Svelte 5 runes pattern)
		/* eslint-disable @typescript-eslint/no-unused-expressions */
		walletId;
		categoryId;
		type;
		startDate;
		endDate;
		searchTerm;
		/* eslint-enable @typescript-eslint/no-unused-expressions */

		// Always apply filters, even when clearing (sending empty object)
		applyFilters();
	});
</script>

<div class="transaction-filters">
	<!-- Filter Toggle Button -->
	<div class="mb-4">
		<button
			type="button"
			onclick={() => (showFilters = !showFilters)}
			class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 min-h-[44px]"
		>
			<svg
				class="w-5 h-5"
				class:rotate-180={showFilters}
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 9l-7 7-7-7"
				/>
			</svg>
			<span>{showFilters ? $t('transactions.filters.hide') : $t('transactions.filters.show')} {$t('transactions.filters.title')}</span>
		</button>
	</div>

	<!-- Filters Panel -->
	{#if showFilters}
		<div class="filters-panel bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<!-- Wallet Filter -->
				<div class="filter-group">
					<label for="wallet-filter" class="block text-sm font-medium text-gray-700 mb-1">
						{$t('transactions.filters.wallet')}
					</label>
					<select
						id="wallet-filter"
						bind:value={walletId}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="">{$t('transactions.filters.allWallets')}</option>
						{#each $wallets as wallet (wallet.id)}
							<option value={wallet.id}>{wallet.name}</option>
						{/each}
					</select>
				</div>

				<!-- Category Filter -->
				<div class="filter-group">
					<label for="category-filter" class="block text-sm font-medium text-gray-700 mb-1">
						{$t('transactions.filters.category')}
					</label>
					<select
						id="category-filter"
						bind:value={categoryId}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="">{$t('transactions.filters.allCategories')}</option>
						{#each $categories as category (category.id)}
							<option value={category.id}>{getCategoryName(category)}</option>
						{/each}
					</select>
				</div>

				<!-- Type Filter -->
				<div class="filter-group">
					<label for="type-filter" class="block text-sm font-medium text-gray-700 mb-1">
						{$t('transactions.filters.type')}
					</label>
					<select
						id="type-filter"
						bind:value={type}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="">{$t('transactions.filters.allTypes')}</option>
						<option value="income">{$t('transactions.types.income')}</option>
						<option value="expense">{$t('transactions.types.expense')}</option>
					</select>
				</div>

				<!-- Start Date Filter -->
				<div class="filter-group">
					<label for="start-date-filter" class="block text-sm font-medium text-gray-700 mb-1">
						{$t('transactions.filters.dateRange.start')}
					</label>
					<input
						id="start-date-filter"
						type="date"
						bind:value={startDate}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<!-- End Date Filter -->
				<div class="filter-group">
					<label for="end-date-filter" class="block text-sm font-medium text-gray-700 mb-1">
						{$t('transactions.filters.dateRange.end')}
					</label>
					<input
						id="end-date-filter"
						type="date"
						bind:value={endDate}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<!-- Search Term Filter -->
				<div class="filter-group">
					<label for="search-filter" class="block text-sm font-medium text-gray-700 mb-1">
						{$t('transactions.filters.searchNotes')}
					</label>
					<input
						id="search-filter"
						type="text"
						bind:value={searchTerm}
						placeholder={$t('transactions.filters.searchPlaceholder')}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			</div>

			<!-- Clear Filters Button -->
			<div class="mt-4 flex justify-end">
				<button
					type="button"
					onclick={clearFilters}
					class="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 min-h-[44px]"
				>
					{$t('transactions.filters.clear')}
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.transaction-filters {
		width: 100%;
	}

	.rotate-180 {
		transform: rotate(180deg);
		transition: transform 0.2s ease;
	}

	/* Mobile-first responsive design */
	@media (max-width: 768px) {
		.filters-panel {
			padding: 1rem;
		}
	}
</style>
