<script lang="ts">
	/**
	 * Transaction List Page
	 *
	 * @see specs/001-personal-finance-tracker/plan.md lines 184-193
	 * @see specs/001-personal-finance-tracker/tasks.md line 101
	 */
	import TransactionList from '$lib/components/transactions/TransactionList.svelte';
	import TransactionFilters from '$lib/components/transactions/TransactionFilters.svelte';
	import type { TransactionFilters as Filters } from '$lib';

	// Current filters state
	let currentFilters = $state<Filters>({});

	/**
	 * Handle filter changes from TransactionFilters component
	 */
	function handleFilterChange(filters: Filters) {
		currentFilters = filters;
	}
</script>

<svelte:head>
	<title>Transactions - Personal Finance Tracker</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-4xl mx-auto">
		<TransactionFilters onfilterchange={handleFilterChange} />
		<TransactionList filters={currentFilters} />
	</div>
</div>

<style>
	.container {
		min-height: calc(100vh - 64px);
	}
</style>
