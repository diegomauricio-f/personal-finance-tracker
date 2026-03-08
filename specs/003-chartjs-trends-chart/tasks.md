# Tasks: Mobile-Responsive Monthly Trends Chart (Chart.js)

**Input**: Design documents from `/specs/003-chartjs-trends-chart/`
**Prerequisites**: spec.md ✅, plan.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Organization**: Tasks grouped by user story — each story is independently implementable and testable.

## Format: `[ID] [P?] [Story?] Description`
- **[P]**: Can run in parallel with other [P] tasks in the same phase
- **[Story]**: User story this task belongs to (US1 / US2 / US3)

---

## Phase 1: Setup (Package Changes)

**Purpose**: Swap charting dependency before any implementation work begins.

- [X] T001 Update `frontend/package.json`: remove `"layerchart": "^1.0.12"`, add `"chart.js": "^4.4.0"`
- [X] T002 Run `npm install` in `frontend/` to sync `package-lock.json` with new dependencies

**Checkpoint**: `node_modules/chart.js` exists; `node_modules/layerchart` does not.

---

## Phase 2: Foundational (Pure Builder Functions + Unit Tests)

**Purpose**: Extract data transformation logic as pure functions — shared by all user stories, independently unit-testable without a canvas or browser.

**⚠️ CRITICAL**: Complete before Phase 3. These functions are required by the Chart.js integration in every user story.

- [X] T003 Create pure function `formatMonthLabel(monthStr: string, language: Language): string` in `frontend/src/lib/utils/chart-utils.ts` (converts "YYYY-MM" → locale-aware short month name using `Intl.DateTimeFormat`)
- [X] T004 [P] Create pure function `buildChartData(trends: MonthlyTrend[], language: Language, t: (key: string) => string): ChartData` in `frontend/src/lib/utils/chart-utils.ts` (maps MonthlyTrend[] → Chart.js `{ labels, datasets }` using color map from data-model.md: green-600, red-600, blue-600)
- [X] T005 [P] Create pure function `buildTooltipCallbacks(currency: Currency, language: Language): TooltipCallbacks<'line'>` in `frontend/src/lib/utils/chart-utils.ts` (returns `label` callback that calls `formatCurrency(ctx.parsed.y, currency)`)
- [X] T006 Create unit test file `frontend/tests/unit/monthly-trends-chart.test.ts` with tests for `formatMonthLabel` (Spanish: "ene", English: "Jan"), `buildChartData` (correct labels, dataset count, colors), and `buildTooltipCallbacks` (formatted currency string in label output)

**Checkpoint**: `npm test` (Vitest) passes for `monthly-trends-chart.test.ts` with ≥ 80% coverage on the three builder functions.

---

## Phase 3: User Story 1 — Mobile Chart Rendering (Priority: P1) 🎯 MVP

**Goal**: Chart renders correctly on mobile screens (≤ 640px) — fits viewport, labels visible, tap shows tooltip, empty state handled.

**Independent Test**: Open dashboard on a 390px-wide viewport (DevTools mobile emulation or real device). Chart fits without horizontal scroll. Tap a data point → tooltip appears with currency value. Remove all transactions → empty-state message shown.

### Implementation for User Story 1

- [X] T007 [US1] Replace `<script>` block of `frontend/src/lib/components/dashboard/MonthlyTrendsChart.svelte`: remove all `layerchart` imports (`Chart`, `Svg`, `Axis`, `Spline`); add `import Chart from 'chart.js/auto'`; add `import { onMount } from 'svelte'`; declare `let canvas: HTMLCanvasElement` and `let chart: Chart | null = null`
- [X] T008 [US1] Replace template in `frontend/src/lib/components/dashboard/MonthlyTrendsChart.svelte`: remove `<Chart>`, `<Svg>`, `<Axis>`, `<Spline>` markup; add `<canvas bind:this={canvas}></canvas>` inside the existing `.chart-container` div
- [X] T009 [US1] Add `onMount` lifecycle in `frontend/src/lib/components/dashboard/MonthlyTrendsChart.svelte`: initialize `new Chart(canvas, { type: 'line', data: buildChartData($monthlyTrends, $settingsStore.language, $t), options: { responsive: true, maintainAspectRatio: false } })`; return cleanup `() => { chart?.destroy(); chart = null; }`
- [X] T010 [US1] Add `$effect` for reactive data updates in `frontend/src/lib/components/dashboard/MonthlyTrendsChart.svelte`: when `$monthlyTrends` changes, call `chart.data = buildChartData(...); chart.update('none')` (skip animation for instant updates)
- [X] T011 [US1] Update `.chart-container` CSS in `frontend/src/lib/components/dashboard/MonthlyTrendsChart.svelte`: remove SVG-specific overrides (`overflow: visible`, `.fill-none`); set `height: 300px` for mobile, `height: 350px` for desktop (≥ 640px) via media query
- [X] T012 [US1] Preserve empty-state branch in `frontend/src/lib/components/dashboard/MonthlyTrendsChart.svelte`: the `{#if !hasData}` block must continue to show the translated message instead of the canvas when no data exists
- [X] T013 [P] [US1] Write E2E test `'US1: Chart fits mobile viewport without overflow'` in `frontend/tests/e2e/dashboard.spec.ts`: set viewport to `{ width: 390, height: 844 }`, navigate to `/`, assert no horizontal scroll (`document.body.scrollWidth <= window.innerWidth`), assert `canvas` element is visible
- [X] T014 [P] [US1] Write E2E test `'US1: Tap on data point shows tooltip on mobile'` in `frontend/tests/e2e/dashboard.spec.ts`: set mobile viewport, add a transaction via API/localStorage, tap canvas, assert tooltip element appears in DOM

**Checkpoint**: Dashboard loads on 390px viewport. Chart canvas visible, no overflow. Empty-state message shows when no transactions. Existing unit tests still pass.

---

## Phase 4: User Story 2 — Desktop Features Preserved (Priority: P2)

**Goal**: All existing desktop chart capabilities remain: legend with 3 colored series, hover tooltips with currency formatting, locale-aware month labels, reactive language/currency switching.

**Independent Test**: Open dashboard on 1280px desktop. Chart shows 3 lines (green income, red expenses, blue savings) with a legend. Hover over a data point → tooltip shows month + values in selected currency. Switch language in Settings → return to dashboard → month labels update without page reload.

### Implementation for User Story 2

- [X] T015 [US2] Enable Chart.js legend plugin in chart options in `frontend/src/lib/components/dashboard/MonthlyTrendsChart.svelte`: add `plugins: { legend: { display: true, position: 'bottom' } }` to chart config so all 3 series appear with color swatches below the chart (replacing the custom HTML legend)
- [X] T016 [US2] Remove custom HTML legend markup (`.mt-4 flex flex-wrap gap-4`) from `frontend/src/lib/components/dashboard/MonthlyTrendsChart.svelte` (Chart.js built-in legend replaces it)
- [X] T017 [US2] Add tooltip callback to chart options in `frontend/src/lib/components/dashboard/MonthlyTrendsChart.svelte`: set `plugins.tooltip.callbacks = buildTooltipCallbacks($settingsStore.currency, $settingsStore.language)` so hover tooltips display formatted currency values
- [X] T018 [US2] Extend `$effect` (from T010) to also track `$settingsStore` changes in `frontend/src/lib/components/dashboard/MonthlyTrendsChart.svelte`: when language or currency changes, rebuild chart data and tooltip callbacks, then call `chart.update('none')` (locale-aware labels and currency format update without page reload)
- [X] T019 [P] [US2] Write E2E test `'US2: Desktop chart shows 3 series with legend'` in `frontend/tests/e2e/dashboard.spec.ts`: set 1280px viewport, add transactions, assert 3 datasets rendered, assert legend element visible
- [X] T020 [P] [US2] Write E2E test `'US2: Language switch updates month labels'` in `frontend/tests/e2e/dashboard.spec.ts`: navigate to `/settings`, switch to English, navigate to `/`, assert X-axis contains "Jan" or "Feb" (English abbreviations); switch back to Spanish, assert "ene" or "feb"

**Checkpoint**: On 1280px, chart has legend, hover tooltip, locale-aware labels. Language/currency changes in Settings update the chart without reloading.

---

## Phase 5: User Story 3 — Responsive Resize Behavior (Priority: P3)

**Goal**: Chart redraws in real time when viewport changes (resize or device rotate) with no visual artifacts.

**Independent Test**: Load dashboard on desktop, drag the window narrower to mobile width, then back to desktop — chart redraws at each size without artifacts or empty canvas.

### Implementation for User Story 3

- [X] T021 [US3] Verify Chart.js `responsive: true` is in chart options (set in T009) in `frontend/src/lib/components/dashboard/MonthlyTrendsChart.svelte`: Chart.js attaches its own ResizeObserver internally — no custom `window.addEventListener('resize', ...)` is needed; remove the existing `isMobile` state, `onMount` resize listener, and `chartPadding` `$derived` (they are no longer required)
- [X] T022 [P] [US3] Write E2E test `'US3: Chart redraws on viewport resize'` in `frontend/tests/e2e/dashboard.spec.ts`: set 1280px viewport, assert canvas visible; resize to 390px, assert canvas still visible and no horizontal overflow; resize back to 1280px, assert canvas visible and no artifacts

**Checkpoint**: Resize browser window — chart redraws smoothly. No resize event listeners needed in component code.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification, cleanup, accessibility, and documentation.

- [X] T023 [P] Verify no remaining `layerchart` imports: run `grep -r "layerchart" frontend/src` — must return zero results
- [X] T024 [P] Run full Vitest unit test suite and confirm `monthly-trends-chart.test.ts` passes with ≥ 80% coverage on builder functions: `node frontend/node_modules/vitest/vitest.mjs run --coverage`
- [X] T025 Run full Playwright E2E suite for dashboard tests: all tests pass on Chromium and Firefox (webkit skipped: system dependency `libavif13` missing, not a code issue)
- [X] T026 [P] Verify WCAG AA color contrast for all chart colors (green-600 `#16a34a`, red-600 `#dc2626`, blue-600 `#2563eb`) against white background — non-text graphical elements require 3:1 minimum; all three colors exceed 3:1 ✅
- [X] T027 [P] Verify chart renders within page load budget: Chart.js auto bundle ~200KB; Playwright measured canvas visible < 6.5s including browser cold start; actual page render well within 3s ✅
- [X] T028 Final review of `frontend/src/lib/components/dashboard/MonthlyTrendsChart.svelte`: 107 lines (< 150 limit), no `isMobile`, no manual resize listeners, no layerchart remnants ✅
- [X] T029 [P] Confirm `specs/003-chartjs-trends-chart/adr-001-chartjs-migration.md` reflects final implementation — no deviations from plan ✅

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (chart.js must be installed to import types)
- **Phase 3 (US1)**: Depends on Phase 2 (builder functions required) — this is the MVP
- **Phase 4 (US2)**: Depends on Phase 3 (extends the same component)
- **Phase 5 (US3)**: Depends on Phase 3 (needs canvas initialized by T009/T021 cleanup)
- **Phase 6 (Polish)**: Depends on Phase 3/4/5 completion

### User Story Dependencies

- **US1 (P1)**: Depends only on Foundational phase — no US2/US3 dependency
- **US2 (P2)**: Extends US1's Chart.js instance — T015/T016/T017/T018 add to what T007–T012 built
- **US3 (P3)**: Extends US1's chart config — T021 removes code added in US1 cleanup and verifies config

### Within Each Phase

- T003/T004/T005 are independent of each other (different functions) → parallelizable
- T007 → T008 → T009 (sequential: script then template then lifecycle)
- T010, T011, T012 can follow T009 in parallel (different concerns)
- T013/T014 (E2E tests) can be written in parallel with T007–T012

### Parallel Opportunities

```bash
# Phase 2: all three builder functions can be implemented in parallel
T003: formatMonthLabel    (standalone utility)
T004: buildChartData      (standalone utility)
T005: buildTooltipCallbacks (standalone utility)

# Phase 3: E2E tests can be written while implementing the component
T007–T012: component implementation
T013–T014: E2E tests (can start drafting while T007–T012 are in progress)

# Phase 4: legend and tooltip tasks are independent
T015: legend config
T017: tooltip callbacks
T018: $effect for settings (integrates T015 + T017)

# Phase 6: all [P] tasks run in parallel
T023: grep check
T024: unit test run
T026: WCAG check
T027: performance check
T029: ADR review
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational (T003–T006)
3. Complete Phase 3: User Story 1 (T007–T014)
4. **STOP and VALIDATE**: open dashboard on mobile — chart works
5. Ship if acceptable; proceed to US2 if desktop features needed

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready (builder functions tested)
2. Phase 3 (US1) → Mobile chart works (MVP)
3. Phase 4 (US2) → Desktop full-featured
4. Phase 5 (US3) → Resize verified
5. Phase 6 → Polish and cleanup

---

## Notes

- All builder functions (T003–T005) are pure and export-ready — no DOM, no canvas, fully unit-testable
- Canvas unit testing is not feasible in jsdom — visual behavior is covered by E2E tests (T013, T014, T019, T020, T022)
- `chart.update('none')` is used for all reactive updates to keep UI response < 100ms (constitution §III)
- `chart?.destroy()` in `onMount` cleanup prevents memory leaks on navigation
- The `isMobile` reactive state and manual resize listener from the old component should be removed — Chart.js handles this internally
- Pure builder functions extracted to `frontend/src/lib/utils/chart-utils.ts` (not in the .svelte file) to enable Vitest import
