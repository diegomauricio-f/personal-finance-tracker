<script lang="ts">
	/**
	 * WalletForm Component - Form for creating wallets
	 * Updated with i18n support
	 *
	 * @see specs/001-personal-finance-tracker/tasks.md line 125
	 * @see specs/002-settings-i18n-currency/tasks.md line 132
	 */
	import { walletStore } from '$lib';
	import { t } from '$lib/i18n';
	import type { CreateWalletInput } from '$lib/stores/wallets';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	// Form data
	let name = '';

	// Validation errors
	let errors: Record<string, string> = {};

	// Loading state
	let isSubmitting = false;

	/**
	 * Validate form fields
	 */
	function validateForm(): boolean {
		errors = {};

		// Validate name
		if (!name || name.trim() === '') {
			errors.name = $t('wallets.validation.nameRequired');
		} else if (name.length > 100) {
			errors.name = $t('wallets.validation.nameTooLong');
		}

		return Object.keys(errors).length === 0;
	}

	/**
	 * Handle form submission
	 */
	async function handleSubmit() {
		if (!validateForm()) {
			return;
		}

		isSubmitting = true;

		try {
			const walletData: CreateWalletInput = {
				name: name.trim()
			};

			const wallet = await walletStore.create(walletData);

			// Dispatch success event
			dispatch('success', wallet);

			// Reset form
			resetForm();
		} catch (error) {
			// Handle specific validation errors
			const errorMessage = (error as Error).message;
			if (errorMessage.includes('already exists')) {
				errors.name = errorMessage;
			} else {
				errors.submit = errorMessage;
			}
		} finally {
			isSubmitting = false;
		}
	}

	/**
	 * Reset form to default values
	 */
	function resetForm() {
		name = '';
		errors = {};
	}

	/**
	 * Handle name input to clear error
	 */
	function handleNameInput() {
		if (errors.name) {
			delete errors.name;
			errors = { ...errors };
		}
	}
</script>

<form onsubmit={handleSubmit} class="wallet-form">
	<h3 class="text-xl font-semibold text-gray-900 mb-4">{$t('wallets.addNew')}</h3>

	<!-- Name Field -->
	<div class="form-group mb-4">
		<label for="wallet-name" class="block text-sm font-medium text-gray-700 mb-2">
			{$t('wallets.form.name')} <span class="text-red-500">*</span>
		</label>
		<input
			type="text"
			id="wallet-name"
			bind:value={name}
			oninput={handleNameInput}
			placeholder={$t('wallets.form.namePlaceholder')}
			maxlength="100"
			class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
			class:border-red-500={errors.name}
			required
		/>
		{#if errors.name}
			<p class="text-red-500 text-sm mt-1">{errors.name}</p>
		{/if}
		<p class="text-gray-500 text-xs mt-1">
			{name.length}/100 {$t('wallets.form.nameHint')}
		</p>
	</div>

	<!-- Submit Error -->
	{#if errors.submit}
		<div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-4">
			{errors.submit}
		</div>
	{/if}

	<!-- Submit Button -->
	<div class="flex gap-3">
		<button
			type="submit"
			disabled={isSubmitting}
			class="flex-1 bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
		>
			{isSubmitting ? $t('common.loading') : $t('wallets.createWallet')}
		</button>
		<button
			type="button"
			onclick={resetForm}
			disabled={isSubmitting}
			class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 min-h-[44px]"
		>
			{$t('common.reset')}
		</button>
	</div>
</form>

<style>
	.wallet-form {
		width: 100%;
		max-width: 600px;
	}

	/* Mobile-first responsive design - minimum 44x44px touch targets */
	@media (max-width: 640px) {
		.wallet-form {
			max-width: 100%;
		}
	}
</style>
