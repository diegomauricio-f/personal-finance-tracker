<script lang="ts">
	/**
	 * Transaction Entry Page
	 *
	 * @see specs/001-personal-finance-tracker/plan.md lines 184-193
	 * @see specs/001-personal-finance-tracker/tasks.md line 96
	 */
	import TransactionForm from '$lib/components/transactions/TransactionForm.svelte';
	import { goto } from '$app/navigation';

	/**
	 * Handle successful transaction creation
	 */
	function handleSuccess() {
		// Navigate to transaction list after successful creation
		goto('/transactions');
	}
</script>

<svelte:head>
	<title>New Transaction - Personal Finance Tracker</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-2xl mx-auto">
		<TransactionForm onsuccess={handleSuccess} />
	</div>
</div>

<style>
	.container {
		min-height: calc(100vh - 64px);
	}
</style>
