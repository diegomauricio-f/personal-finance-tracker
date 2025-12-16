<script lang="ts">
	/**
	 * Navigation Component - Main app navigation
	 * Updated with i18n support
	 *
	 * @see specs/002-settings-i18n-currency/tasks.md lines 124-126
	 */
	import { page } from '$app/stores';
	import { t } from '$lib/i18n';
	import { onMount } from 'svelte';
	import { settingsStore } from '$lib/stores/settings';

	$: currentPath = $page.url.pathname;

	// Initialize settings on mount
	onMount(() => {
		settingsStore.initializeSettings();
	});

	// Navigation items with translation keys
	const navItems = [
		{ href: '/', labelKey: 'navigation.dashboard', icon: '📊' },
		{ href: '/transactions', labelKey: 'navigation.transactions', icon: '💰' },
		{ href: '/wallets', labelKey: 'navigation.wallets', icon: '👛' },
		{ href: '/categories', labelKey: 'navigation.categories', icon: '🏷️' },
		{ href: '/settings', labelKey: 'navigation.settings', icon: '⚙️' }
	];

	function isActive(href: string): boolean {
		if (href === '/') {
			return currentPath === '/';
		}
		return currentPath.startsWith(href);
	}
</script>

<nav class="bg-white shadow-sm border-b border-gray-200">
	<div class="container mx-auto px-4">
		<div class="flex items-center justify-between h-16">
			<div class="flex items-center">
				<h1 class="text-xl font-bold text-gray-900">Personal Finance Tracker</h1>
			</div>

			<div class="flex space-x-1">
				{#each navItems as item (item.href)}
					<a
						href={item.href}
						class="nav-link px-4 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] flex items-center gap-2"
						class:active={isActive(item.href)}
					>
						<span>{item.icon}</span>
						<span class="hidden sm:inline">{$t(item.labelKey)}</span>
					</a>
				{/each}
			</div>
		</div>
	</div>
</nav>

<style>
	.nav-link {
		color: #4b5563;
		text-decoration: none;
	}

	.nav-link:hover {
		background-color: #f3f4f6;
		color: #1f2937;
	}

	.nav-link.active {
		background-color: #3b82f6;
		color: white;
	}

	.nav-link.active:hover {
		background-color: #2563eb;
	}

	/* Mobile-first responsive design - minimum 44x44px touch targets */
	@media (max-width: 640px) {
		.container {
			padding-left: 0.5rem;
			padding-right: 0.5rem;
		}

		h1 {
			font-size: 1rem;
		}

		.nav-link {
			padding: 0.5rem;
		}
	}
</style>
