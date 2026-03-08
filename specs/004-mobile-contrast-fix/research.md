# Research: Mobile Contrast Fix

**Feature**: `004-mobile-contrast-fix` | **Date**: 2026-03-08

---

## Root Cause Analysis

### Decision: Two-layer problem, not one
**Rationale**: The contrast issue on iOS has two independent causes that must be addressed together:

1. **Skeleton dark mode activation** — Skeleton UI uses `@variant dark {...}` (Tailwind v4 syntax) to apply `color: var(--base-font-color-dark)` and `background-color: var(--body-background-color-dark)` on the body when the OS is in dark mode. `--base-font-color-dark` resolves to `--color-surface-50` (very light lavender), making inherited text invisible on white card backgrounds.

2. **Missing explicit text-color classes on component elements** — Multiple Svelte components have headings (`h2`, `h3`), labels, and form controls without a Tailwind text-color utility class. They rely on CSS inheritance from `body`, making them susceptible to Skeleton's body color override.

**Alternatives considered**:
- `color-scheme: light` on `html` — insufficient; does not suppress Tailwind's `@variant dark`
- Global CSS overrides on `h1–h6`, `label`, `input` — partially effective but loses to Svelte's scoped `<style>` specificity and Tailwind's cascade layer ordering in some components
- `@custom-variant dark (&:where(.dark, .dark *))` alone — effective for the CSS variable side but does not retroactively add explicit colors to elements that have none

---

## Dark Mode Mechanism in Skeleton UI

| Aspect | Finding |
|--------|---------|
| Mechanism | `@variant dark { ... }` — Tailwind v4 variant syntax, NOT `@media (prefers-color-scheme: dark)` |
| Compiled output | Selector-based (`.dark` class or media query depending on Tailwind config) |
| Key rules applied | `body { color: var(--base-font-color-dark) }` and `body { background-color: var(--body-background-color-dark) }` |
| `--base-font-color-dark` value | `var(--color-surface-50)` → `oklch(91.63% 0.04 285.57deg)` (near-white) |

## Effectiveness of `@custom-variant dark (&:where(.dark, .dark *))` in Tailwind v4

**Confirmed effective**: Redefining the `dark` variant to require the `.dark` class (which is never added to the DOM) completely prevents Skeleton's `@variant dark` rules from activating. Skeleton contains **zero** `@media (prefers-color-scheme: dark)` rules.

---

## Component Audit — Elements Missing Explicit Text Color

| Component | Element | Lines | Risk |
|-----------|---------|-------|------|
| `CategoryForm.svelte` | `h3`, `label` | 129, 135 | HIGH — no color class, no scoped style |
| `WalletForm.svelte` | `h3`, `label`, `input` | 96, 100, 103 | HIGH — no color class, no scoped style |
| `TransactionList.svelte` | `h2` | 64 | HIGH — no color class, no scoped style |
| `TransactionFilters.svelte` | `select`, `input` | 118–201 | MEDIUM — global input rule applies but no explicit class |
| `TransactionForm.svelte` | `input`, `select`, `textarea` | 182–287 | MEDIUM — global rule applies but no explicit class |
| `SettingsPage.svelte` | `h1`, `h2` | 17, 22 | LOW — scoped `<style>` with hardcoded `#111827` |
| `LanguageSelector.svelte` | `label`, `p`, `select` | 28–39 | LOW — scoped `<style>` with hardcoded colors |
| `CurrencySelector.svelte` | `label`, `p`, `select` | 29–40 | LOW — scoped `<style>` with hardcoded colors |
| `Navigation.svelte` | `<a>` links | 48–52 | LOW — scoped `<style>` with hardcoded `#4b5563` |

---

## Chosen Fix Strategy

**Decision**: Add explicit Tailwind text-color classes directly on HIGH/MEDIUM risk elements.

**Rationale**:
- Explicit utility classes are the most resilient approach — they apply regardless of CSS cascade, inheritance, or dark mode system state
- More maintainable than global CSS overrides (self-documenting intent per element)
- LOW risk elements with hardcoded scoped styles are already safe and need no changes
- Keep existing global CSS in `app.css` as a safety net for any future elements

**WCAG AA Compliance**:
- Normal text on white (`#ffffff`) background: minimum contrast ratio 4.5:1
  - `text-gray-900` (#111827): ratio ~16:1 ✓
  - `text-gray-700` (#374151): ratio ~9.7:1 ✓
  - `text-gray-500` (#6b7280) for placeholder: ratio ~4.6:1 ✓ (borderline — acceptable for placeholder which is supplementary)
