<script lang="ts">
  /**
   * Language Selector Component
   * Allows users to switch between Spanish and English
   *
   * @see specs/002-settings-i18n-currency/plan.md
   * @see specs/002-settings-i18n-currency/tasks.md line 118
   */

  import { settingsStore } from '$lib/stores/settings';
  import { t } from '$lib/i18n';
  import type { Language } from '$lib/i18n/types';

  // Get current language from store
  $: currentLanguage = $settingsStore.language;

  /**
   * Handle language change
   */
  function handleLanguageChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newLanguage = target.value as Language;
    settingsStore.setLanguage(newLanguage);
  }
</script>

<div class="language-selector">
  <label for="language-select" class="label">
    {$t('settings.language.label')}
  </label>
  <p class="description">
    {$t('settings.language.description')}
  </p>
  <select
    id="language-select"
    value={currentLanguage}
    on:change={handleLanguageChange}
    class="select"
  >
    <option value="es">{$t('settings.language.spanish')}</option>
    <option value="en">{$t('settings.language.english')}</option>
  </select>
</div>

<style>
  .language-selector {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .label {
    font-weight: 600;
    font-size: 0.875rem;
    color: #374151;
    display: block;
  }

  .description {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
  }

  .select {
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    background-color: white;
    cursor: pointer;
    transition: border-color 0.15s ease-in-out;
    max-width: 200px;
  }

  .select:hover {
    border-color: #9ca3af;
  }

  .select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  /* Touch target size for mobile (minimum 44x44px) */
  @media (max-width: 768px) {
    .select {
      min-height: 44px;
      font-size: 1rem;
    }
  }
</style>
