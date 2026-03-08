# Research: Mobile-Responsive Monthly Trends Chart (Chart.js)

**Feature**: `003-chartjs-trends-chart`
**Date**: 2026-03-08
**Status**: COMPLETE — all RQs resolved

---

## RQ-001: Chart.js + Svelte 5 Runes Integration

**Question**: How to integrate Chart.js with Svelte 5 runes (canvas lifecycle)?

**Decision**: Use raw Chart.js with `onMount` for initialization and `$effect` for reactive updates.

**Pattern**:
```typescript
import { onMount } from 'svelte';
import Chart from 'chart.js/auto';

let canvas: HTMLCanvasElement;
let chart: Chart | null = null;

onMount(() => {
  chart = new Chart(canvas, buildChartConfig(data, options));
  return () => {
    chart?.destroy();
    chart = null;
  };
});

$effect(() => {
  // Reactive: runs when tracked stores change (monthlyTrends, language, currency)
  if (!chart) return;
  const newData = buildChartData($monthlyTrends, $settingsStore);
  chart.data = newData;
  chart.options.plugins!.tooltip!.callbacks = buildTooltipCallbacks($settingsStore);
  chart.update('none'); // Skip animation on settings change
});
```

**Rationale**: `onMount` guarantees the canvas DOM element exists before Chart.js tries to access it. `$effect` re-runs automatically whenever any reactive dependency (`$monthlyTrends`, `$settingsStore`) changes, updating the chart imperatively. Calling `chart.update('none')` applies changes without animation, keeping UI response < 100ms.

**Alternatives considered**:
- `$effect` for both init and updates: rejected because `$effect` runs before DOM is ready on first render in SSR context
- `afterUpdate` (Svelte 4 lifecycle): not available in Svelte 5 runes mode

---

## RQ-002: svelte-chartjs vs. Raw Chart.js

**Decision**: Use raw Chart.js (no wrapper).

**Rationale**: `svelte-chartjs` v3.1 targets Svelte 4. There is no stable release for Svelte 5 runes as of 2026-03. Using raw Chart.js avoids a wrapper that may lag behind Chart.js or Svelte releases. The integration code (RQ-001) is straightforward (< 30 lines) and does not justify a wrapper dependency.

**Alternatives considered**:
- `svelte-chartjs`: rejected — no stable Svelte 5 runes support
- `@square/svelte-store` pattern: overcomplicated for a single canvas component

---

## RQ-003: Reactive Language and Currency Updates

**Decision**: Update chart data and tooltip callbacks inside a single `$effect` that tracks both `$monthlyTrends` and `$settingsStore`.

**Approach**:
- **X-axis labels** (month names): rebuilt via `formatMonthLabel(month, language)` and assigned to `chart.data.labels`
- **Tooltip values** (currency format): rebuilt via `buildTooltipCallbacks(currency, language)` and assigned to `chart.options.plugins.tooltip.callbacks`
- Both are pure functions with no side effects — easily unit-testable without canvas

**Key functions**:
```typescript
function formatMonthLabel(monthStr: string, language: Language): string {
  const [year, month] = monthStr.split('-');
  const locale = language === 'es' ? 'es-BO' : 'en-US';
  return new Date(+year, +month - 1, 1).toLocaleDateString(locale, { month: 'short' });
}

function buildTooltipCallbacks(currency: Currency, language: Language) {
  return {
    label: (ctx: TooltipItem<'line'>) =>
      `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y, currency)}`
  };
}
```

**Rationale**: Pure functions are straightforward to test and keep the Svelte component thin. The `$effect` pattern ensures the chart always reflects the current state of both data and settings.

---

## RQ-004: chart.js/auto vs. Selective Imports

**Decision**: Use `chart.js/auto` for the initial implementation.

**Rationale**: `chart.js/auto` registers all Chart.js components automatically. For a single chart with line series, legend, and tooltips, the added bundle size of unused components is negligible at this scale (~180KB minified, ~60KB gzipped). Selective imports would require manual registration of `LineController`, `LinearScale`, `CategoryScale`, `PointElement`, `LineElement`, `Legend`, `Tooltip` — adding boilerplate with no user-visible benefit at current scale.

**Future optimization**: If Lighthouse audit shows bundle impact, switch to selective imports in a follow-up.

**Alternatives considered**:
- Selective imports now: rejected as premature optimization; adds maintenance burden

---

## RQ-005: layerchart Dependency Safety

**Decision**: Remove `layerchart` from `package.json` after replacing the component.

**Evidence**: Codebase search confirms `layerchart` is imported in exactly one file:
- `frontend/src/lib/components/dashboard/MonthlyTrendsChart.svelte` (the file being replaced)

No other component, test, or configuration file references `layerchart`. Removal is safe.

**Action**: Remove `"layerchart": "^1.0.12"` from `frontend/package.json` after implementing the new component.

---

## Summary Decision Matrix

| Question | Decision | Confidence |
|---|---|---|
| Integration pattern | Raw Chart.js + `onMount` + `$effect` | High |
| Wrapper library | None (`svelte-chartjs` not Svelte 5 compatible) | High |
| Reactive updates | Single `$effect` tracking stores + `chart.update('none')` | High |
| Imports | `chart.js/auto` (optimize later if needed) | High |
| Dependency removal | Remove `layerchart` (only 1 consumer) | High |
