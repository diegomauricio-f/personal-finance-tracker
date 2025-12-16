<script lang="ts">
	/**
	 * Wallet Management Page
	 * Updated with i18n support
	 *
	 * @see specs/001-personal-finance-tracker/plan.md lines 189-191
	 * @see specs/001-personal-finance-tracker/tasks.md line 126
	 * @see specs/002-settings-i18n-currency/tasks.md line 137
	 */
	import WalletForm from '$lib/components/wallets/WalletForm.svelte';
	import WalletList from '$lib/components/wallets/WalletList.svelte';
	import { walletStore } from '$lib';
	import { formatCurrency } from '$lib/utils/currency';
	import { t } from '$lib/i18n';

	// Subscribe to totalBalance store
	const totalBalance = walletStore.totalBalance;

	/**
	 * Handle successful wallet creation
	 */
	function handleWalletCreated() {
		// The store automatically updates, no need to manually refresh
	}
</script>

<svelte:head>
	<title>Wallets - Personal Finance Tracker</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-4xl mx-auto">
		<!-- Page Header with Total Balance -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">{$t('wallets.title')}</h1>
			<p class="text-gray-600 mb-4">{$t('wallets.pageDescription')}</p>

			<!-- Total Balance Card -->
			<div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
				<p class="text-sm font-medium opacity-90 mb-1">{$t('wallets.totalBalance')}</p>
				<p class="text-4xl font-bold">{formatCurrency($totalBalance)}</p>
			</div>
		</div>

		<!-- Wallet Creation Form -->
		<div class="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<WalletForm on:success={handleWalletCreated} />
		</div>

		<!-- Wallet List -->
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<h2 class="text-xl font-semibold mb-4">{$t('wallets.yourWallets')}</h2>
			<WalletList />
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
			font-size: 1.875rem;
		}
	}
</style>
