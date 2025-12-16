<script lang="ts">
	/**
	 * Category Management Page
	 * Updated with i18n support
	 *
	 * @see specs/001-personal-finance-tracker/plan.md lines 191-193
	 * @see specs/001-personal-finance-tracker/tasks.md line 152
	 * @see specs/002-settings-i18n-currency/tasks.md line 139
	 */
	import CategoryForm from '$lib/components/categories/CategoryForm.svelte';
	import CategoryList from '$lib/components/categories/CategoryList.svelte';
	import CategorySummary from '$lib/components/categories/CategorySummary.svelte';
	import type { Category } from '$lib';
	import { t } from '$lib/i18n';

	// State for editing
	let editingCategory: Category | null = null;

	/**
	 * Handle successful category creation/update
	 */
	function handleCategorySuccess() {
		// Reset editing state
		editingCategory = null;
		// The store automatically updates, no need to manually refresh
	}

	/**
	 * Handle edit request from list
	 */
	function handleEdit(event: CustomEvent<Category>) {
		editingCategory = event.detail;
		// Scroll to form
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	/**
	 * Handle cancel edit
	 */
	function handleCancelEdit() {
		editingCategory = null;
	}
</script>

<svelte:head>
	<title>Categories - Personal Finance Tracker</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-4xl mx-auto">
		<!-- Page Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">{$t('categories.title')}</h1>
			<p class="text-gray-600">
				{$t('categories.pageDescription')}
			</p>
		</div>

		<!-- Category Creation/Edit Form -->
		<div class="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<CategoryForm
				category={editingCategory}
				mode={editingCategory ? 'edit' : 'create'}
				on:success={handleCategorySuccess}
				on:cancel={handleCancelEdit}
			/>
		</div>

		<!-- Category Summary -->
		<div class="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<h2 class="text-xl font-semibold mb-4">{$t('categories.categorySummary')}</h2>
			<CategorySummary />
		</div>

		<!-- Category List -->
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<h2 class="text-xl font-semibold mb-4">{$t('categories.allCategories')}</h2>
			<CategoryList on:edit={handleEdit} />
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
