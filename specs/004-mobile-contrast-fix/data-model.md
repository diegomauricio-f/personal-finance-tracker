# Data Model: Mobile Contrast Fix

**Feature**: `004-mobile-contrast-fix` | **Date**: 2026-03-08

> This feature is a pure CSS/UI fix with no data model changes. This file documents the **color token mapping** applied across components.

---

## Color Token Map

| Semantic Role | Tailwind Class | Hex Value | WCAG AA on white |
|--------------|---------------|-----------|-----------------|
| Heading / primary text | `text-gray-900` | `#111827` | 16.1:1 ✓ |
| Label / secondary text | `text-gray-700` | `#374151` | 9.7:1 ✓ |
| Muted / helper text | `text-gray-500` | `#6b7280` | 4.6:1 ✓ |
| Placeholder | `placeholder-gray-400` / CSS `#9ca3af` | `#9ca3af` | 3.0:1 (supplementary) |
| Input text value | `text-gray-900` | `#111827` | 16.1:1 ✓ |
| Input background | `bg-white` | `#ffffff` | — |

## Components → Changes Mapping

### HIGH priority (missing color class, no scoped style fallback)

| Component | Element | Add Class |
|-----------|---------|-----------|
| `CategoryForm.svelte:129` | `h3` | `text-gray-900` |
| `CategoryForm.svelte:135` | `label` | `text-gray-700` |
| `WalletForm.svelte:96` | `h3` | `text-gray-900` |
| `WalletForm.svelte:100` | `label` | `text-gray-700` |
| `WalletForm.svelte:103` | `input` | `text-gray-900 bg-white` |
| `TransactionList.svelte:64` | `h2` | `text-gray-900` |

### MEDIUM priority (global CSS rule applies but explicit class is more robust)

| Component | Element | Add Class |
|-----------|---------|-----------|
| `TransactionFilters.svelte` | `select` (×3) | `text-gray-900 bg-white` |
| `TransactionFilters.svelte` | `input` (×3) | `text-gray-900 bg-white` |
| `TransactionForm.svelte` | `input`, `select`, `textarea` | `text-gray-900 bg-white` |

### LOW priority (scoped `<style>` with hardcoded hex — already safe, no changes)
- `SettingsPage.svelte`, `LanguageSelector.svelte`, `CurrencySelector.svelte`, `Navigation.svelte`

---

## Global CSS (`app.css`) — Retained as Safety Net

```css
h1, h2, h3, h4, h5, h6 { color: #111827; }
label { color: #374151; }
input, select, textarea { color: #111827; background-color: #ffffff; }
input::placeholder, textarea::placeholder { color: #6b7280; opacity: 1; }
```
