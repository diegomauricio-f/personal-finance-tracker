<script lang="ts">
	/**
	 * CategoryForm Component - Form for creating/editing custom categories
	 * Updated with i18n support
	 *
	 * @see specs/001-personal-finance-tracker/tasks.md line 150
	 * @see specs/002-settings-i18n-currency/tasks.md line 133
	 */
	import { categoryStore } from '$lib';
	import { t } from '$lib/i18n';
	import type { CreateCategoryInput, UpdateCategoryInput } from '$lib/stores/categories';
	import type { Category } from '$lib/models/category';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	// Props
	export let category: Category | null = null; // If provided, form is in edit mode
	export let mode: 'create' | 'edit' = category ? 'edit' : 'create';

	// Form data
	let name = category?.name || '';

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
			errors.name = $t('categories.validation.nameRequired');
		} else if (name.length > 50) {
			errors.name = $t('categories.validation.nameTooLong');
		}

		return Object.keys(errors).length === 0;
	}

	/**
	 * Handle form submission
	 */
	// eslint-disable-next-line max-lines-per-function
	async function handleSubmit() {
		if (!validateForm()) {
			return;
		}

		isSubmitting = true;

		try {
			if (mode === 'edit' && category) {
				// Update existing category
				const categoryData: UpdateCategoryInput = {
					name: name.trim()
				};

				const updatedCategory = await categoryStore.update(category.id, categoryData);

				// Dispatch success event
				dispatch('success', updatedCategory);
			} else {
				// Create new category
				const categoryData: CreateCategoryInput = {
					name: name.trim()
				};

				const newCategory = await categoryStore.create(categoryData);

				// Dispatch success event
				dispatch('success', newCategory);

				// Reset form only in create mode
				if (mode === 'create') {
					resetForm();
				}
			}
		} catch (error) {
			// Handle specific validation errors
			const errorMessage = (error as Error).message;
			if (errorMessage.includes('already exists')) {
				errors.name = errorMessage;
			} else if (errorMessage.includes('not found')) {
				errors.submit = errorMessage;
			} else if (errorMessage.includes('predefined')) {
				errors.submit = errorMessage;
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

	/**
	 * Handle cancel for edit mode
	 */
	function handleCancel() {
		dispatch('cancel');
		resetForm();
	}
</script>

<form onsubmit={handleSubmit} class="category-form">
	<h3 class="text-xl font-semibold mb-4">
		{mode === 'edit' ? $t('categories.editCategory') : $t('categories.addNew')}
	</h3>

	<!-- Name Field -->
	<div class="form-group mb-4">
		<label for="category-name" class="block text-sm font-medium mb-2">
			{$t('categories.form.name')} <span class="text-red-500">*</span>
		</label>
		<input
			type="text"
			id="category-name"
			bind:value={name}
			oninput={handleNameInput}
			placeholder={$t('categories.form.namePlaceholder')}
			maxlength="50"
			class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
			class:border-red-500={errors.name}
			required
		/>
		{#if errors.name}
			<p class="text-red-500 text-sm mt-1">{errors.name}</p>
		{/if}
		<p class="text-gray-500 text-xs mt-1">
			{name.length}/50 {$t('categories.form.nameHint')}
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
			{isSubmitting ? $t('common.loading') : mode === 'edit' ? $t('categories.updateCategory') : $t('categories.createCategory')}
		</button>
		{#if mode === 'edit'}
			<button
				type="button"
				onclick={handleCancel}
				disabled={isSubmitting}
				class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 min-h-[44px]"
			>
				{$t('common.cancel')}
			</button>
		{:else}
			<button
				type="button"
				onclick={resetForm}
				disabled={isSubmitting}
				class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 min-h-[44px]"
			>
				{$t('common.reset')}
			</button>
		{/if}
	</div>
</form>

<style>
	.category-form {
		width: 100%;
		max-width: 600px;
	}

	/* Mobile-first responsive design - minimum 44x44px touch targets */
	@media (max-width: 640px) {
		.category-form {
			max-width: 100%;
		}
	}
</style>
