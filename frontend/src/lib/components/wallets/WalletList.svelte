<script lang="ts">
	/**
	 * WalletList Component - Display list of wallets with balances and transaction counts
	 * Updated with i18n support
	 *
	 * @see specs/001-personal-finance-tracker/spec.md lines 48-49
	 * @see specs/001-personal-finance-tracker/tasks.md line 124
	 * @see specs/002-settings-i18n-currency/tasks.md line 138
	 */
	import { walletStore, transactionStore } from '$lib';
	import { formatCurrency } from '$lib/utils/currency';
	import type { Wallet } from '$lib';
	import { t } from '$lib/i18n';
	import { get } from 'svelte/store';

	// Subscribe to stores
	const wallets = walletStore.wallets;
	const transactions = transactionStore.transactions;

	/**
	 * Get transaction count for a wallet
	 */
	function getTransactionCount(walletId: string): number {
		return $transactions.filter(t => t.walletId === walletId).length;
	}

	/**
	 * Handle wallet deletion
	 */
	async function handleDelete(wallet: Wallet) {
		const transactionCount = getTransactionCount(wallet.id);
		const confirmMessage =
			transactionCount > 0
				? `${get(t)('wallets.deleteConfirmStart')} "${wallet.name}"? ${get(t)('wallets.hasTransactions')} ${transactionCount} ${transactionCount !== 1 ? get(t)('wallets.transactions') : get(t)('wallets.transaction')}. ${get(t)('wallets.willBeSoftDeleted')}`
				: `${get(t)('wallets.deleteConfirmStart')} "${wallet.name}"?`;

		if (confirm(confirmMessage)) {
			try {
				await walletStore.softDelete(wallet.id);
			} catch (error) {
				alert(`${get(t)('wallets.deleteFailed')}: ${(error as Error).message}`);
			}
		}
	}

	/**
	 * Start editing a wallet
	 */
	let editingWallet: Wallet | null = null;
	let editName = '';

	function startEdit(wallet: Wallet) {
		editingWallet = wallet;
		editName = wallet.name;
	}

	function cancelEdit() {
		editingWallet = null;
		editName = '';
	}

	/**
	 * Handle wallet update
	 */
	async function handleUpdate() {
		if (!editingWallet) return;

		try {
			await walletStore.update(editingWallet.id, { name: editName });
			editingWallet = null;
			editName = '';
		} catch (error) {
			alert(`${get(t)('wallets.updateFailed')}: ${(error as Error).message}`);
		}
	}
</script>

<div class="wallet-list">
	{#if $wallets.length === 0}
		<div class="text-center py-8 bg-gray-50 rounded-lg">
			<p class="text-gray-600">{$t('wallets.noWalletsYet')}</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each $wallets as wallet (wallet.id)}
				<div
					class="wallet-item bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
				>
					{#if editingWallet?.id === wallet.id}
						<!-- Edit mode -->
						<div class="flex items-center gap-2">
							<input
								type="text"
								bind:value={editName}
								class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
								placeholder={$t('wallets.form.namePlaceholder')}
								onkeydown={(e) => {
									if (e.key === 'Enter') handleUpdate();
									if (e.key === 'Escape') cancelEdit();
								}}
							/>
							<button
								type="button"
								onclick={handleUpdate}
								class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
							>
								{$t('common.save')}
							</button>
							<button
								type="button"
								onclick={cancelEdit}
								class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none min-h-[44px]"
							>
								{$t('common.cancel')}
							</button>
						</div>
					{:else}
						<!-- View mode -->
						<div class="flex justify-between items-center">
							<div class="flex-1">
								<h3 class="text-lg font-semibold text-gray-900 mb-1">
									{wallet.name}
								</h3>
								<div class="flex items-center gap-4 text-sm text-gray-600">
									<span
										class="font-semibold text-xl"
										class:text-green-600={wallet.balance >= 0}
										class:text-red-600={wallet.balance < 0}
									>
										{formatCurrency(wallet.balance)}
									</span>
									<span class="text-gray-500">
										{getTransactionCount(wallet.id)} {getTransactionCount(wallet.id) !== 1 ? $t('wallets.transactions') : $t('wallets.transaction')}
									</span>
								</div>
							</div>

							<div class="flex gap-2">
								<button
									type="button"
									onclick={() => startEdit(wallet)}
									class="text-blue-600 hover:text-blue-800 px-3 py-2 text-sm min-h-[44px]"
									title={$t('wallets.editWallet')}
								>
									{$t('common.edit')}
								</button>
								<button
									type="button"
									onclick={() => handleDelete(wallet)}
									class="text-red-600 hover:text-red-800 px-3 py-2 text-sm min-h-[44px]"
									title={$t('wallets.deleteWallet')}
								>
									{$t('common.delete')}
								</button>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.wallet-list {
		width: 100%;
	}

	/* Mobile-first responsive design */
	@media (max-width: 640px) {
		.wallet-item {
			padding: 0.75rem;
		}

		.wallet-item .flex {
			flex-direction: column;
			align-items: flex-start;
		}

		.wallet-item .flex.gap-2 {
			flex-direction: row;
			margin-top: 0.5rem;
		}
	}
</style>
