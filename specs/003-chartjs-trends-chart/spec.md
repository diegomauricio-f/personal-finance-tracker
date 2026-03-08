# Feature Specification: Mobile-Responsive Monthly Trends Chart

**Feature Branch**: `003-chartjs-trends-chart`
**Created**: 2026-03-08
**Status**: Draft
**Input**: User description: "El chart de tendencias no se está mostrando correctamente en dispositivos móviles, quisiera probar una librería distinta para mostrar las tendencias. La librería seleccionada es Chart.js"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Trends Chart on Mobile (Priority: P1)

A user opens the dashboard on a mobile phone and views the monthly income, expenses, and savings trends chart. The chart is fully readable without zooming or horizontal scrolling, month labels are visible, and the user can tap on data points to see exact values.

**Why this priority**: The primary motivation for this feature is the broken mobile experience. Fixing this unblocks all mobile users from accessing financial trend data.

**Independent Test**: Navigate to the dashboard on a device with a screen width under 640px and verify the chart is readable, all month labels are visible, and tapping a data point shows a tooltip with the exact value.

**Acceptance Scenarios**:

1. **Given** the user is on a mobile device (screen ≤ 640px), **When** they view the dashboard, **Then** the trends chart fits within the screen width without horizontal scrolling and all labels are legible.
2. **Given** the chart is visible on mobile, **When** the user taps on a data point, **Then** a tooltip appears showing the month, income, expenses, and net savings values formatted in the user's selected currency.
3. **Given** the user has no transactions, **When** the chart area is rendered, **Then** an empty-state message is shown instead of a broken or empty chart.

---

### User Story 2 - View Trends Chart on Desktop (Priority: P2)

A user on a desktop browser views the same monthly trends chart. All existing desktop behavior is preserved: 12 months of data, three series (income, expenses, net savings), a legend, and hover tooltips.

**Why this priority**: Desktop users are not broken today; this story ensures the mobile fix does not regress existing desktop functionality.

**Independent Test**: Open the dashboard in a browser at ≥ 1024px width and confirm all three data series render correctly with hover tooltips, legend, and month labels.

**Acceptance Scenarios**:

1. **Given** the user is on a desktop browser, **When** they view the dashboard, **Then** the chart displays up to 12 months of income, expenses, and net savings as three distinct lines with different colors.
2. **Given** the chart is visible on desktop, **When** the user hovers over a data point, **Then** a tooltip shows the exact values formatted in the user's selected currency and locale.
3. **Given** the user switches language between Spanish and English, **When** the chart re-renders, **Then** month labels update to match the selected locale (e.g., "ene" vs "Jan").

---

### User Story 3 - Responsive Resize Behavior (Priority: P3)

A user rotates their device or resizes the browser window. The chart adapts its layout in real time — no page reload required — maintaining readability at any viewport size.

**Why this priority**: Orientation changes are common on mobile and the chart must handle them gracefully.

**Independent Test**: Load the dashboard, resize the window from desktop to mobile width and back, and confirm the chart redraws correctly at each size without visual artifacts.

**Acceptance Scenarios**:

1. **Given** the chart is displayed at desktop width, **When** the user resizes the window to mobile width, **Then** the chart redraws to fit the new width without requiring a page reload.
2. **Given** the chart is displayed at mobile width, **When** the user rotates the device to landscape, **Then** the chart expands to use the available width.

---

### Edge Cases

- What happens when all 12 months have zero income and expenses? → Empty-state message is shown; no broken or empty axes.
- What happens when only 1–2 months have data? → Chart renders with only those data points; no visual errors.
- What happens on very small screens (≤ 320px)? → Chart remains scrollable within its container rather than overflowing the page layout.
- What happens when the currency or language setting changes while the chart is visible? → Chart updates labels and tooltip values reactively without a page reload.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The trends chart MUST display up to 12 months of historical data as three distinct series: income, expenses, and net savings.
- **FR-002**: The chart MUST be fully readable on screens as narrow as 320px, with all month labels visible and no content clipping outside the chart container.
- **FR-003**: Users MUST be able to interact with individual data points on touch devices (tap) and pointer devices (hover) to see a tooltip with exact values.
- **FR-004**: Tooltip values MUST be formatted using the user's currently selected currency and locale (Bolivianos with Spanish-Bolivian format, or US Dollars with US format).
- **FR-005**: Month labels on the X-axis MUST reflect the user's selected language (Spanish or English abbreviated month names).
- **FR-006**: The chart MUST redraw responsively when the viewport size changes, without requiring a page reload.
- **FR-007**: The chart MUST display a clear empty-state message when no transaction data exists, rather than rendering an empty or broken chart.
- **FR-008**: The chart MUST include a visible legend identifying the three data series by color on all screen sizes.
- **FR-009**: All interactive chart elements (tooltips, legend items) MUST meet WCAG AA color contrast requirements.

### Key Entities

- **Monthly Trend**: A single month's aggregated financial data — month identifier (YYYY-MM), total income, total expenses, net savings.
- **Chart Series**: One of three named data lines plotted over time — income (green), expenses (red), net savings (blue).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The trends chart renders correctly (no clipping, no horizontal overflow) on mobile screens as narrow as 320px.
- **SC-002**: Users can obtain exact data point values via tap/hover on both mobile and desktop without additional steps.
- **SC-003**: The chart redraws within 300ms of a viewport resize or settings change.
- **SC-004**: All existing desktop chart functionality (tooltips, legend, 12-month data, color-coded series) is preserved after the change.
- **SC-005**: The chart passes WCAG AA color contrast for all visible text and interactive elements.

## Assumptions

1. **Data Source**: The chart continues to read from the same analytics store as the current implementation; no backend changes are required.
2. **Series Definition**: The three series (income, expenses, net savings) and their color coding (green, red, blue) are preserved.
3. **i18n Integration**: The chart uses the existing language and currency settings stores for locale-aware formatting.
4. **Chart Height**: A fixed height per viewport class (mobile ≈ 300px, desktop ≈ 350px) is acceptable; the chart does not need to grow dynamically with data volume.
5. **Licensing**: The charting solution used is Chart.js, which is licensed under MIT. No commercial licensing fees apply.
