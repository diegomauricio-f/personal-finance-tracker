<script lang="ts">
	/**
	 * TransactionForm Component - Form for creating/editing transactions
	 * Updated with i18n support
	 *
	 * @see specs/001-personal-finance-tracker/spec.md lines 29-34
	 * @see specs/001-personal-finance-tracker/tasks.md lines 92-96
	 * @see specs/002-settings-i18n-currency/tasks.md line 129
	 */
	import { transactionStore, walletStore, categoryStore } from '$lib';
	import { formatDateTimeLocal } from '$lib/utils/dates';
	import { t, getCategoryName } from '$lib/i18n';
	import type { CreateTransactionInput, UpdateTransactionInput } from '$lib/stores/transactions';
	import type { Transaction } from '$lib';

	// Svelte 5 pattern: callback props instead of events
	interface Props {
		transaction?: Transaction | null;
		mode?: 'create' | 'edit';
		onsuccess?: (transaction: Transaction) => void;
		oncancel?: () => void;
	}

	let { transaction = null, mode = 'create', onsuccess, oncancel }: Props = $props();

	// Form data - Svelte 5 requires $state() for reactive variables
	let date = $state(
		transaction ? formatDateTimeLocal(transaction.date) : formatDateTimeLocal(new Date())
	);
	let amount = $state(transaction ? String(transaction.amount) : '');
	let type = $state<'income' | 'expense'>(transaction?.type || 'expense');
	let categoryId = $state(transaction?.categoryId || '');
	let walletId = $state(transaction?.walletId || '');
	let note = $state(transaction?.note || '');

	// Validation errors
	let errors = $state<Record<string, string>>({});

	// Loading state
	let isSubmitting = $state(false);

	// Subscribe to stores - these are already Readable stores
	const wallets = walletStore.wallets;
	const categories = categoryStore.categories;

	/**
	 * Validate form fields
	 */
	function validateForm(): boolean {
		errors = {};

		// Validate date
		if (!date) {
			errors.date = $t('transactions.validation.dateRequired');
		}

		// Validate amount
		const amountStr = String(amount).trim();
		if (!amount || amountStr === '') {
			errors.amount = $t('transactions.validation.amountRequired');
		} else {
			const amountNum = parseFloat(amountStr);
			if (isNaN(amountNum)) {
				errors.amount = $t('transactions.validation.amountPositive');
			} else if (amountNum === 0) {
				errors.amount = $t('transactions.validation.amountPositive');
			}
		}

		// Validate wallet
		if (!walletId) {
			errors.walletId = $t('transactions.validation.walletRequired');
		}

		// Validate category
		if (!categoryId) {
			errors.categoryId = $t('transactions.validation.categoryRequired');
		}

		return Object.keys(errors).length === 0;
	}

	/**
	 * Handle form submission
	 */
	// eslint-disable-next-line max-lines-per-function
	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		if (!validateForm()) {
			return;
		}

		isSubmitting = true;

		try {
			if (mode === 'edit' && transaction) {
				// Update existing transaction
				const updateData: UpdateTransactionInput = {
					date: new Date(date),
					amount: parseFloat(String(amount)),
					type,
					categoryId,
					walletId,
					note: note?.trim() || undefined
				};

				const updatedTransaction = await transactionStore.update(transaction.id, updateData);

				// Call success callback if provided
				onsuccess?.(updatedTransaction);
			} else {
				// Create new transaction
				const transactionData: CreateTransactionInput = {
					date: new Date(date),
					amount: parseFloat(String(amount)),
					type,
					categoryId,
					walletId,
					note: note?.trim() || undefined
				};

				const newTransaction = await transactionStore.create(transactionData);

				// Call success callback if provided
				onsuccess?.(newTransaction);

				// Reset form only in create mode
				if (mode === 'create') {
					resetForm();
				}
			}
		} catch (error) {
			errors.submit = (error as Error).message;
		} finally {
			isSubmitting = false;
		}
	}

	/**
	 * Reset form to default values
	 */
	function resetForm() {
		date = formatDateTimeLocal(new Date());
		amount = '';
		type = 'expense';
		categoryId = '';
		walletId = '';
		note = '';
		errors = {};
	}

	/**
	 * Handle amount input to clear error
	 */
	function handleAmountInput() {
		if (errors.amount) {
			delete errors.amount;
			errors = { ...errors };
		}
	}

	/**
	 * Handle cancel
	 */
	function handleCancel() {
		oncancel?.();
	}
</script>

<div class="transaction-form">
	<h2 class="text-2xl font-bold text-gray-900 mb-6">
		{mode === 'edit' ? $t('transactions.editTransaction') : $t('transactions.addNew')}
	</h2>

	<form onsubmit={handleSubmit} class="space-y-4">
		<!-- Date & Time -->
		<div class="form-group">
			<label for="date" class="block text-sm font-medium text-gray-700 mb-1">
				{$t('transactions.form.date')}
			</label>
			<input
				id="date"
				type="datetime-local"
				bind:value={date}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				class:border-red-500={errors.date}
				required
			/>
			{#if errors.date}
				<p class="text-red-500 text-sm mt-1">{errors.date}</p>
			{/if}
		</div>

		<!-- Amount -->
		<div class="form-group">
			<label for="amount" class="block text-sm font-medium text-gray-700 mb-1">
				{$t('transactions.form.amount')}
			</label>
			<input
				id="amount"
				type="number"
				step="0.01"
				bind:value={amount}
				oninput={handleAmountInput}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				class:border-red-500={errors.amount}
				placeholder="0.00"
				required
			/>
			{#if errors.amount}
				<p class="text-red-500 text-sm mt-1">{errors.amount}</p>
			{/if}
		</div>

		<!-- Type -->
		<div class="form-group">
			<label for="type-income" class="block text-sm font-medium text-gray-700 mb-2">
				{$t('transactions.form.type')}
			</label>
			<div class="flex gap-4">
				<label class="flex items-center cursor-pointer">
					<input id="type-income" type="radio" bind:group={type} value="income" class="mr-2" />
					<span class="text-green-600 font-medium">{$t('transactions.types.income')}</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input type="radio" bind:group={type} value="expense" class="mr-2" />
					<span class="text-red-600 font-medium">{$t('transactions.types.expense')}</span>
				</label>
			</div>
		</div>

		<!-- Wallet -->
		<div class="form-group">
			<label for="wallet" class="block text-sm font-medium text-gray-700 mb-1">
				{$t('transactions.form.wallet')}
			</label>
			<select
				id="wallet"
				bind:value={walletId}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				class:border-red-500={errors.walletId}
				required
			>
				<option value="">{$t('transactions.form.selectWallet')}</option>
				{#each $wallets as wallet (wallet.id)}
					<option value={wallet.id}>{wallet.name}</option>
				{/each}
			</select>
			{#if errors.walletId}
				<p class="text-red-500 text-sm mt-1">{errors.walletId}</p>
			{/if}
		</div>

		<!-- Category -->
		<div class="form-group">
			<label for="category" class="block text-sm font-medium text-gray-700 mb-1">
				{$t('transactions.form.category')}
			</label>
			<select
				id="category"
				bind:value={categoryId}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				class:border-red-500={errors.categoryId}
				required
			>
				<option value="">{$t('transactions.form.selectCategory')}</option>
				{#each $categories as category (category.id)}
					<option value={category.id}>{getCategoryName(category)}</option>
				{/each}
			</select>
			{#if errors.categoryId}
				<p class="text-red-500 text-sm mt-1">{errors.categoryId}</p>
			{/if}
		</div>

		<!-- Note -->
		<div class="form-group">
			<label for="note" class="block text-sm font-medium text-gray-700 mb-1">
				{$t('transactions.form.notes')}
			</label>
			<textarea
				id="note"
				bind:value={note}
				rows="3"
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				placeholder={$t('transactions.form.notePlaceholder')}
			></textarea>
		</div>

		<!-- Submit Error -->
		{#if errors.submit}
			<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
				{errors.submit}
			</div>
		{/if}

		<!-- Actions -->
		<div class="flex gap-3 pt-2">
			<button
				type="submit"
				disabled={isSubmitting}
				class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
			>
				{isSubmitting ? $t('common.loading') : mode === 'edit' ? $t('transactions.updateTransaction') : $t('transactions.saveTransaction')}
			</button>

			{#if mode === 'edit'}
				<button
					type="button"
					onclick={handleCancel}
					class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 min-h-[44px]"
				>
					{$t('common.cancel')}
				</button>
			{:else}
				<button
					type="button"
					onclick={resetForm}
					class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 min-h-[44px]"
				>
					{$t('common.reset')}
				</button>
			{/if}
		</div>
	</form>
</div>

<style>
	.transaction-form {
		width: 100%;
		max-width: 500px;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	/* Mobile-first responsive design */
	@media (max-width: 640px) {
		.transaction-form {
			max-width: 100%;
		}
	}
</style>