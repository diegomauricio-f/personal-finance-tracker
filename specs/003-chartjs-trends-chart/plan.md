# Implementation Plan: Mobile-Responsive Monthly Trends Chart (Chart.js)

**Branch**: `003-chartjs-trends-chart` | **Date**: 2026-03-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-chartjs-trends-chart/spec.md`

## Summary

Replace the current `layerchart`-based `MonthlyTrendsChart.svelte` component with a Chart.js implementation that renders correctly on mobile devices. The current SVG-based chart has rendering issues on narrow viewports; Chart.js uses canvas rendering with built-in responsive support, native touch tooltips, and automatic resize via ResizeObserver. No backend or data model changes are required — the component continues reading from the existing `analyticsStore`.

## Technical Context

**Language/Version**: TypeScript 5.9.2, Svelte 5.39.5, SvelteKit 2.43.2
**Primary Dependencies**: Chart.js 4.x (MIT license), Tailwind CSS 4.x (styling)
**Storage**: N/A — reads from existing in-memory `analyticsStore`
**Testing**: Vitest 4.x (unit — data transformation logic only), Playwright 1.56.1 (E2E — chart rendering and interaction)
**Target Platform**: Mobile-first web (Chrome, Firefox, Safari, Edge — latest 2 versions; iOS Safari, Android Chrome)
**Project Type**: Web application (frontend-only change)
**Performance Goals**:
- Chart redraws within 300ms of viewport resize (SC-003)
- Chart renders within the 2-second page load budget (constitution)
- Touch tooltip response < 100ms on mobile (constitution)

**Constraints**:
- Canvas rendering (Chart.js) replaces SVG rendering (layerchart) — visual appearance will differ slightly
- Svelte 5 runes require explicit lifecycle management for Chart.js instances
- `jsdom` does not support `<canvas>` — canvas rendering cannot be unit-tested; E2E tests cover visual behavior
- `layerchart` used only in `MonthlyTrendsChart.svelte` — safe to remove after replacement

**Scale/Scope**:
- 1 component replaced (`MonthlyTrendsChart.svelte`)
- 1 package added (`chart.js`), 1 package removed (`layerchart`)
- Up to 12 data points per series, 3 series (income, expenses, net savings)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Evaluation

**I. Code Quality First** ✅
- **Status**: COMPLIANT
- **Evidence**: Component replacement follows single-responsibility principle; Chart.js is well-maintained (MIT) with strong TypeScript types
- **Actions**:
  - Use `chart.js/auto` for clean setup; evaluate tree-shaking post-implementation
  - Keep chart configuration extracted into a dedicated pure builder function for testability
  - Max 30 lines per method; chart config builder will be one pure function
  - ADR required for library swap (significant architectural change per constitution §IV)

**II. Testing Coverage (80% minimum)** ✅
- **Status**: COMPLIANT with documented exception
- **Evidence**: Canvas cannot be rendered in `jsdom` — chart rendering tests must be E2E only
- **Actions**:
  - Unit tests: data transformation functions (`buildChartData`, `formatMonthLabel`, tooltip formatters)
  - E2E tests: chart renders on mobile/desktop, tooltip on tap/hover, empty state, language switch
  - Coverage target: 80%+ on tested units; canvas rendering covered by E2E (documented exception)

**III. User Experience Consistency (Mobile-First)** ✅
- **Status**: COMPLIANT
- **Evidence**: Chart.js has native `responsive: true` and ResizeObserver; touch tooltips built-in
- **Actions**:
  - Set `responsive: true`, `maintainAspectRatio: false` on all viewports
  - Container height: 300px mobile / 350px desktop (matches current behavior)
  - Legend visible on all screen sizes via Chart.js built-in legend plugin
  - Touch target covers full canvas — no minimum size concern

**IV. Performance By Design** ✅
- **Status**: COMPLIANT
- **Evidence**: Canvas rendering typically faster than SVG for data charts; Chart.js uses RAF internally
- **Actions**:
  - Use `chart.update('none')` for data updates triggered by settings changes (skip animation)
  - Destroy chart instance on component unmount to prevent memory leaks
  - Evaluate selective Chart.js imports if bundle impact > 200KB gzipped

**V. Security** ✅
- **Status**: COMPLIANT
- **Evidence**: No user input rendered in chart; all data comes from typed `analyticsStore`
- **Actions**: No security-specific actions required

### Post-Design Gates (re-check after Phase 1)

- [ ] Chart config builder function ≤ 30 lines
- [ ] E2E tests cover all success criteria (SC-001 through SC-005)
- [ ] `layerchart` removed with no other consumers (verified: only 1 consumer)
- [ ] ADR created for library swap

## Project Structure

### Documentation (this feature)

```
specs/003-chartjs-trends-chart/
├── spec.md                          # Feature specification (COMPLETE)
├── checklists/
│   └── requirements.md              # Spec validation checklist (COMPLETE)
├── plan.md                          # This file
├── research.md                      # Phase 0 output (COMPLETE)
├── data-model.md                    # Phase 1 output (COMPLETE)
├── quickstart.md                    # Phase 1 output (COMPLETE)
├── adr-001-chartjs-migration.md     # ADR: layerchart → Chart.js decision (COMPLETE)
└── tasks.md                         # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```
frontend/
├── src/
│   └── lib/
│       └── components/
│           └── dashboard/
│               └── MonthlyTrendsChart.svelte   # REPLACE: Chart.js canvas implementation
│
├── package.json                                 # UPDATE: add chart.js, remove layerchart
│
└── tests/
    ├── unit/
    │   └── monthly-trends-chart.test.ts         # NEW: data transformation unit tests
    └── e2e/
        └── dashboard.spec.ts                    # NEW: chart rendering & interaction E2E tests
```

**Structure Decision**: Frontend-only change within the existing web application structure. No backend modifications. Single component replaced; no new routes, stores, or services required.

## Phase 0: Research & Decisions

*See `research.md` for full findings.*

### Research Questions

- **RQ-001**: How to integrate Chart.js with Svelte 5 runes (canvas + `$effect` lifecycle)?
- **RQ-002**: Use `svelte-chartjs` wrapper vs. raw Chart.js?
- **RQ-003**: How to reactively update Chart.js when language/currency settings change?
- **RQ-004**: `chart.js/auto` vs. selective imports — bundle size trade-off?
- **RQ-005**: Is `layerchart` safe to remove? Any other consumers?

## Phase 1: Design

*See `data-model.md` and `quickstart.md` for full artifacts.*

### Deliverables

**1. data-model.md** — Data structures flowing into Chart.js
- `MonthlyTrend` shape (from existing analytics store — unchanged)
- `ChartDataset` type and `ChartConfig` builder output

**2. quickstart.md** — Developer guide
- How to run the feature locally and verify the chart
- How to extend the chart (add new series)
- How to test (unit data transformers + E2E visual)

**3. adr-001-chartjs-migration.md** — Architecture Decision Record
- Documents why Chart.js was chosen over alternatives (Highcharts, uPlot, ECharts, keeping layerchart)

### Phase 1 Gates

- [ ] Data model aligns with existing `analyticsStore` types
- [ ] No new stores or services needed (confirmed — reads same data)
- [ ] Component interface unchanged (no props, reads from store internally)
- [ ] Constitution re-check passes

## Complexity Tracking

*No constitution violations at planning stage.*
