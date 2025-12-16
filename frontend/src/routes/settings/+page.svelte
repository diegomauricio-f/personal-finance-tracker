<script lang="ts">
  /**
   * Settings Route
   * Renders the settings page with language and currency configuration
   *
   * @see specs/002-settings-i18n-currency/plan.md
   * @see specs/002-settings-i18n-currency/tasks.md line 120
   */

  import SettingsPage from '$lib/components/settings/SettingsPage.svelte';
  import { onMount } from 'svelte';
  import { settingsStore } from '$lib/stores/settings';

  // Initialize settings when the page loads
  onMount(() => {
    settingsStore.initializeSettings();
  });
</script>

<svelte:head>
  <title>Settings - Personal Finance Tracker</title>
  <meta name="description" content="Configure your language and currency preferences" />
</svelte:head>

<SettingsPage />
