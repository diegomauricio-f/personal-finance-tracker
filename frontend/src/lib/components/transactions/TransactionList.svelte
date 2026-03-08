<script lang="ts">
	/**
	 * TransactionList Component - Display list of transactions
	 * Updated with i18n support
	 *
	 * @see specs/001-personal-finance-tracker/spec.md line 31
	 * @see specs/001-personal-finance-tracker/tasks.md line 100
	 * @see specs/002-settings-i18n-currency/tasks.md line 131
	 */
	import { get } from 'svelte/store';
	import { transactionStore, walletStore, categoryStore } from '$lib';
	import { formatDateTime } from '$lib/utils/dates';
	import { formatCurrency } from '$lib/utils/currency';
	import { t, getCategoryName as getTranslatedCategoryName } from '$lib/i18n';
	import type { Transaction, TransactionFilters } from '$lib';

	// Props for filtering
	interface Props {
		filters?: TransactionFilters;
	}

	let { filters = {} }: Props = $props();

	// Subscribe to stores - these are already Readable stores
	const allTransactions = transactionStore.transactions;

	// Filtered transactions based on filters prop - Svelte 5 $derived
	const transactions = $derived(
		Object.keys(filters).length > 0 ? transactionStore.filter(filters) : $allTransactions
	);

	/**
	 * Get category name by ID (translated)
	 */
	function getCategoryName(categoryId: string): string {
		const category = categoryStore.getById(categoryId);
		return category ? getTranslatedCategoryName(category) : get(t)('common.unknown');
	}

	/**
	 * Get wallet name by ID
	 */
	function getWalletName(walletId: string): string {
		const wallet = walletStore.getById(walletId);
		return wallet?.name || get(t)('common.unknown');
	}

	/**
	 * Handle transaction deletion
	 */
	async function handleDelete(transaction: Transaction) {
		if (confirm(get(t)('transactions.deleteConfirm'))) {
			try {
				await transactionStore.delete(transaction.id);
			} catch (error) {
				alert(`${get(t)('transactions.deleteFailed')}: ${(error as Error).message}`);
			}
		}
	}
</script>

<div class="transaction-list">
	<div class="flex justify-between items-center mb-6">
		<h2 class="text-2xl font-bold text-gray-900">{$t('transactions.title')}</h2>
		<a
			href="/transactions/new"
			class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] flex items-center"
		>
			+ {$t('transactions.addNew')}
		</a>
	</div>

	{#if transactions.length === 0}
		<div class="text-center py-12 bg-gray-50 rounded-lg">
			<p class="text-gray-600 mb-4">
				{Object.keys(filters).length > 0 ? $t('transactions.list.noFiltered') : $t('transactions.list.empty')}
			</p>
			{#if Object.keys(filters).length === 0}
				<a
					href="/transactions/new"
					class="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 min-h-[44px] flex items-center justify-center"
				>
					{$t('transactions.list.createFirst')}
				</a>
			{/if}
		</div>
	{:else}
		<div class="space-y-3">
			{#each transactions as transaction (transaction.id)}
				<div
					class="transaction-item bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
				>
					<div class="flex justify-between items-start">
						<div class="flex-1">
							<div class="flex items-center gap-3 mb-2">
								<span
									class="text-lg font-semibold"
									class:text-green-600={transaction.type === 'income'}
									class:text-red-600={transaction.type === 'expense'}
								>
									{transaction.type === 'income' ? '+' : '-'}
									{formatCurrency(Math.abs(transaction.amount))}
								</span>
								<span class="px-2 py-1 text-xs font-medium bg-gray-100 rounded">
									{getCategoryName(transaction.categoryId)}
								</span>
							</div>

							<div class="text-sm text-gray-600 space-y-1">
								<div class="flex items-center gap-2">
									<span class="font-medium">{$t('transactions.list.dateTime')}:</span>
									<span>{formatDateTime(transaction.date)}</span>
								</div>
								<div class="flex items-center gap-2">
									<span class="font-medium">{$t('transactions.list.wallet')}:</span>
									<span>{getWalletName(transaction.walletId)}</span>
								</div>
								{#if transaction.note}
									<div class="flex items-start gap-2">
										<span class="font-medium">{$t('transactions.list.note')}:</span>
										<span class="text-gray-700">{transaction.note}</span>
									</div>
								{/if}
							</div>
						</div>

						<div class="flex gap-2 ml-4">
							<button
								type="button"
								onclick={() => handleDelete(transaction)}
								class="text-red-600 hover:text-red-800 px-2 py-1 text-sm"
								title={$t('transactions.list.deleteTitle')}
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

<style>
	.transaction-list {
		width: 100%;
	}

	/* Mobile-first responsive design */
	@media (max-width: 640px) {
		.transaction-item {
			padding: 0.75rem;
		}
	}
</style>
