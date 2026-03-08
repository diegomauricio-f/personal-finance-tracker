# ADR-001: Migrate Monthly Trends Chart from layerchart to Chart.js

**Date**: 2026-03-08
**Status**: Accepted
**Feature**: `003-chartjs-trends-chart`

---

## Context

The `MonthlyTrendsChart.svelte` component currently uses `layerchart` (v1.0.12), an SVG-based charting library wrapping D3. The component does not render correctly on mobile devices (screen width ≤ 640px): labels overflow, the chart clips, and the SVG layout does not adapt to narrow viewports. Prior workarounds (reduced font sizes, adjusted padding) were insufficient. A library replacement is required.

## Decision

Replace `layerchart` with **Chart.js 4.x** (MIT license) using raw canvas integration with Svelte 5 `onMount` and `$effect`.

## Options Considered

| Option | Pros | Cons | Decision |
|---|---|---|---|
| **Chart.js** (selected) | MIT, mobile-first by default, canvas-based (faster on mobile), native touch tooltips, built-in ResizeObserver, active community | Canvas harder to unit-test than SVG; visual style changes from SVG | ✅ Selected |
| **Highcharts** | Feature-rich, excellent documentation | Commercial license required for non-open-source use; licensing cost | ❌ Rejected |
| **Apache ECharts** | MIT, powerful, good mobile support | Larger bundle (~950KB unminified), steeper API learning curve | ❌ Rejected |
| **uPlot** | Extremely lightweight (~40KB), fast | Minimal built-in features; would require custom tooltip/legend implementation | ❌ Rejected (scope too large) |
| **Fix layerchart config** | No new dependency | Root cause is SVG layout engine; workarounds already exhausted | ❌ Rejected |

## Consequences

**Positive**:
- Chart renders correctly on all screen sizes (≥ 320px)
- Native touch tooltip support on mobile — no custom implementation needed
- Chart.js automatically handles viewport resize via ResizeObserver
- MIT license — no commercial restrictions

**Negative**:
- Canvas rendering is not testable in `jsdom`; unit tests cover only data transformation functions; visual correctness verified by E2E tests
- Visual appearance of the chart changes (canvas rasterized vs. SVG vector) — minor UX difference
- Bundle size increases by ~60KB gzipped (Chart.js auto bundle)
- `layerchart` removed — any future feature that wanted SVG charts would need to re-evaluate

## Compliance

- Constitution §I (Code Quality): Chart.js is well-maintained, typed, and MIT. ADR documents the decision. ✅
- Constitution §II (Testing): Canvas rendering tested via E2E; exception documented. ✅
- Constitution §III (Mobile-first UX): Chart.js responsive by default. ✅
- Constitution §IV (Performance): Canvas rendering faster than SVG on mobile. ✅
