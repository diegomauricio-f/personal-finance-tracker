# Data Model: Monthly Trends Chart (Chart.js)

**Feature**: `003-chartjs-trends-chart`
**Date**: 2026-03-08

---

## Existing Data (unchanged)

The chart reads from `analyticsStore.monthlyTrends` — no new entities or storage.

### MonthlyTrend (from analyticsStore)

```typescript
interface MonthlyTrend {
  month: string;        // "YYYY-MM" format, e.g. "2025-03"
  totalIncome: number;  // Sum of income transactions for the month
  totalExpenses: number; // Sum of expense transactions for the month
  netSavings: number;   // totalIncome - totalExpenses
}
```

Source: `frontend/src/lib/stores/analytics.ts` (existing, unchanged)

---

## New Types (Chart.js integration)

### ChartPoint

Internal representation of a single data point:

```typescript
interface ChartPoint {
  x: string;   // Month label (locale-aware, e.g. "ene", "Jan")
  y: number;   // Monetary value
}
```

### ChartDataset

Represents one series (income, expenses, or net savings):

```typescript
interface ChartDataset {
  label: string;           // Translated series name
  data: ChartPoint[];      // Array of { x, y } points
  borderColor: string;     // CSS color string (fixed per series)
  backgroundColor: string; // Transparent fill below the line
  tension: number;         // Curve smoothness (0 = straight, 1 = smooth)
  fill: boolean;           // Whether to fill area under the line
}
```

### ChartData

Full data object passed to Chart.js:

```typescript
interface ChartData {
  labels: string[];         // X-axis month labels (locale-aware)
  datasets: ChartDataset[]; // Three datasets: income, expenses, savings
}
```

---

## Data Flow

```
analyticsStore.monthlyTrends (MonthlyTrend[])
        │
        ▼
  buildChartData(trends, language, currency)
        │
        ▼
  ChartData { labels, datasets[] }
        │
        ▼
  Chart.js canvas rendering
```

---

## Pure Builder Functions (unit-testable)

These functions have no side effects and can be tested without a DOM or canvas:

```typescript
// Converts MonthlyTrend[] → ChartData for Chart.js
function buildChartData(
  trends: MonthlyTrend[],
  language: Language,
  t: (key: string) => string
): ChartData

// Formats "YYYY-MM" → locale-aware short month name ("ene" / "Jan")
function formatMonthLabel(monthStr: string, language: Language): string

// Builds Chart.js tooltip callback using formatCurrency
function buildTooltipCallbacks(
  currency: Currency,
  language: Language
): TooltipCallbacks<'line'>
```

---

## Series Color Mapping (unchanged from current implementation)

| Series | Color | CSS value |
|---|---|---|
| Income | Green | `rgb(22, 163, 74)` — Tailwind `green-600` |
| Expenses | Red | `rgb(220, 38, 38)` — Tailwind `red-600` |
| Net Savings | Blue | `rgb(37, 99, 235)` — Tailwind `blue-600` |
