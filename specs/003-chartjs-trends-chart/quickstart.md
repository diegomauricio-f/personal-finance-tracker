# Quickstart: Monthly Trends Chart (Chart.js)

**Feature**: `003-chartjs-trends-chart`
**Date**: 2026-03-08

---

## Prerequisites

- Node.js (via `nvm`) — run `. ~/.nvm/nvm.sh` to activate
- Backend API running on `http://localhost:8000`

---

## Running Locally

```bash
# 1. Install chart.js (after package.json is updated)
cd frontend && npm install

# 2. Start dev server
npm run dev

# 3. Open the dashboard and scroll to the Monthly Trends chart
open http://localhost:5173
```

The chart appears on the main dashboard (`/`). You need at least one transaction to see data; otherwise the empty-state message is shown.

---

## Verifying the Fix

### Mobile rendering
Open DevTools → Toggle device toolbar → Select "iPhone 12" (390px).
The chart should fit within the viewport without horizontal scroll and all month labels should be readable.

### Touch tooltips
On a mobile device (or DevTools device emulation), tap on any data point. A tooltip should appear showing month, income, expenses, and net savings in the selected currency format.

### Language change
Go to Settings, switch language to English. Return to dashboard. Month labels on the X-axis should update from Spanish abbreviations ("ene", "feb") to English ("Jan", "Feb") without a page reload.

---

## Running Tests

```bash
# Unit tests (data transformation functions only — no canvas)
cd frontend
node -e "const {spawnSync}=require('child_process'); spawnSync(process.execPath,['node_modules/vitest/vitest.mjs','run','--reporter=verbose','tests/unit/monthly-trends-chart.test.ts'],{stdio:'inherit'})"

# E2E tests (requires running dev/preview server)
node node_modules/playwright/cli.js test tests/e2e/dashboard.spec.ts
```

---

## Adding a New Data Series

1. Add the new field to `MonthlyTrend` in `analyticsStore` (if not already present)
2. Add a new translation key in `es.json` and `en.json` for the series label
3. In `buildChartData()`, add a new `ChartDataset` entry with:
   - A distinct `borderColor` (use a Tailwind color not already used)
   - The new field mapped from `MonthlyTrend`
4. Add the series to the legend (automatic — Chart.js legend reflects all datasets)
5. Add E2E test coverage for the new series tooltip

---

## Extending Tooltip Content

To show additional information in tooltips, modify `buildTooltipCallbacks()` in `MonthlyTrendsChart.svelte`:

```typescript
function buildTooltipCallbacks(currency: Currency, language: Language) {
  return {
    label: (ctx: TooltipItem<'line'>) =>
      `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y, currency)}`,
    // Add afterLabel, title, or footer here as needed
  };
}
```

---

## Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| Blank canvas / no chart | `onMount` didn't fire (SSR) | Ensure `<canvas>` is inside `{#if browser}` or use `onMount` guard |
| Chart doesn't update on language change | `$effect` dependency not tracked | Ensure `$settingsStore` is read inside `$effect`, not outside |
| "Canvas is already in use" error | Previous chart instance not destroyed | Call `chart?.destroy()` in `onMount` cleanup function |
| `layerchart` import error after removal | Other file still imports it | Run `grep -r "layerchart" frontend/src` to find stray imports |
