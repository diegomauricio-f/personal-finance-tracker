<script lang="ts">
  /**
   * Settings Page Component
   * Main settings interface with language and currency configuration
   *
   * @see specs/002-settings-i18n-currency/plan.md
   * @see specs/002-settings-i18n-currency/tasks.md line 119
   */

  import { t } from '$lib/i18n';
  import LanguageSelector from './LanguageSelector.svelte';
  import CurrencySelector from './CurrencySelector.svelte';
</script>

<div class="settings-page">
  <header class="header">
    <h1 class="title">{$t('settings.title')}</h1>
  </header>

  <div class="content">
    <section class="section">
      <h2 class="section-title">{$t('settings.preferences')}</h2>

      <div class="settings-grid">
        <div class="setting-item">
          <LanguageSelector />
        </div>

        <div class="setting-item">
          <CurrencySelector />
        </div>
      </div>
    </section>
  </div>
</div>

<style>
  .settings-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 1.5rem;
  }

  .header {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .title {
    font-size: 1.875rem;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .section {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1.5rem;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 1.5rem 0;
  }

  .settings-grid {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .setting-item {
    padding: 1rem;
    background: #f9fafb;
    border-radius: 0.375rem;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .settings-page {
      padding: 1rem;
    }

    .title {
      font-size: 1.5rem;
    }

    .section {
      padding: 1rem;
    }

    .section-title {
      font-size: 1.125rem;
    }

    .settings-grid {
      gap: 1.5rem;
    }

    .setting-item {
      padding: 0.75rem;
    }
  }

  /* Ensure page loads quickly (<2s requirement) */
  @media (prefers-reduced-motion: no-preference) {
    .settings-page {
      animation: fadeIn 0.2s ease-in;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
