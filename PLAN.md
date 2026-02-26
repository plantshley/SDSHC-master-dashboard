# SDSHC Master Dashboard - Implementation Plan

## Context
The South Dakota Soil Health Coalition needs an internal dashboard website to visualize donor, vendor, and cost-share data from an Excel workbook that syncs with SharePoint. The site deploys to GitHub Pages and updates when the Excel file is refreshed and pushed. **This plan focuses on the Donor Dashboard first** — other dashboards will follow using it as a template.

## Tech Stack
- **React + Vite** (fast builds, static output for GitHub Pages)
- **React Router** (`HashRouter` — avoids GitHub Pages SPA 404 issues, URLs like `/#/donor`)
- **Recharts** (React-native charting with built-in tooltips)
- **SheetJS (xlsx)** (runtime Excel parsing in the browser)
- **CSS custom properties** for per-dashboard theming
- **Google Fonts**: JetBrains Mono (body), Silkscreen (titles), MuseoModerno (headings)

## File Structure
```
SDSHC-master-dashboard/
├── .github/workflows/deploy.yml
├── public/data/
│   └── Peoples Database Queries_local.xlsx
├── src/
│   ├── main.jsx                          # Entry: HashRouter + DataContext provider
│   ├── App.jsx                           # Layout: NavBar + Outlet + theme application
│   ├── App.css                           # Global styles, fonts, CSS variables, dark theme
│   ├── index.css                         # Reset/base
│   ├── theme/themeConfig.js              # Color palettes, chart colors, theme helper
│   ├── hooks/
│   │   ├── useExcelData.js              # Fetch + parse Excel, cache in context
│   │   └── useDonorData.js             # Filter + aggregate donor data (useMemo)
│   ├── context/DataContext.jsx          # React context for parsed Excel data
│   ├── components/
│   │   ├── NavButton/NavButton.jsx+css  # Existing component, refactored for CSS vars
│   │   ├── NavBar/NavBar.jsx+css        # Tab row linked to routes
│   │   ├── MetricCard/MetricCard.jsx+css
│   │   ├── BentoGrid/BentoGrid.jsx+css
│   │   ├── BentoCard/BentoCard.jsx+css
│   │   ├── FilterBar/FilterBar.jsx+css
│   │   ├── DataTable/DataTable.jsx+css
│   │   ├── InsightsCard/InsightsCard.jsx+css
│   │   ├── charts/
│   │   │   ├── chartConfig.js           # Shared defaults, color array, formatters
│   │   │   ├── GivingOverTimeChart.jsx  # Bar+Line combo by year
│   │   │   ├── MembershipStatusChart.jsx # Donut chart
│   │   │   ├── GiftTypeByYearChart.jsx  # Stacked bar
│   │   │   ├── TransactionVolumeChart.jsx # Multi-line
│   │   │   └── MembershipGivingDualAxis.jsx # Dual Y-axis
│   │   └── Placeholder/Placeholder.jsx+css
│   ├── pages/
│   │   ├── HomePage.jsx+css
│   │   ├── DonorDashboard.jsx+css       # Main focus
│   │   ├── VendorDashboard.jsx          # Placeholder
│   │   ├── CostShareDashboard.jsx       # Placeholder
│   │   └── MasterDashboard.jsx          # Placeholder
│   └── utils/
│       ├── excelParser.js               # SheetJS parsing, column normalization, type coercion
│       ├── donorAggregations.js         # Pure functions: all computed metrics & chart data
│       └── formatters.js               # Currency, number, percent formatters
├── index.html
├── package.json
└── vite.config.js                       # base: '/SDSHC-master-dashboard/'
```

## Implementation Steps

### Phase 1: Project Scaffolding
1. **Init Vite + React** — `npm create vite@latest . -- --template react`, install deps (`react-router-dom`, `recharts`, `xlsx`)
2. **Configure Vite** — Set `base: '/SDSHC-master-dashboard/'` for GitHub Pages
3. **Move Excel file** to `public/data/` so Vite serves it as a static asset
4. **Set up global styles** — Light theme default, Google Font imports, CSS custom properties for theming + dark mode toggle

### Phase 2: Theming & Navigation
5. **Create `themeConfig.js`** — Color palettes per dashboard (donor=green, vendor=pink, cost-share=blue, master=orange) + the 15-color chart array
6. **Refactor NavButton** — Replace hardcoded blue colors with CSS variables (`var(--accent)`, etc.) so the shine animation works in any theme color
7. **Build NavBar** — Row of NavButtons linked to routes via `useNavigate`/`useLocation`
8. **Set up routing** in `main.jsx` — `HashRouter` with routes: `/`, `/donor`, `/vendor`, `/cost-share`, `/master`
9. **Build App.jsx layout** — NavBar at top, `<Outlet>` below, reads route to apply `data-theme` attribute

### Phase 3: Data Layer
10. **Implement `excelParser.js`** — Fetch Excel as ArrayBuffer, parse with SheetJS, extract "Donor History" sheet, normalize columns, coerce types (dates, numbers)
11. **Create `DataContext.jsx`** — Provider that parses Excel on mount, exposes `{ rawData, isLoading, error }`
12. **Implement `donorAggregations.js`** — Pure functions computing:
    - Key metrics: total donors, transactions, lifetime giving, avg gift, peak year, YoY growth
    - Time series: giving by year, membership count by year
    - Breakdowns: membership status, gift type by year, transaction volume by type
    - Top donors table, donor retention stats
13. **Build `useDonorData` hook** — Consumes DataContext, applies filter state, memoizes aggregation results

### Phase 4: Donor Dashboard Components
14. **BentoGrid + BentoCard** — CSS Grid (4-col desktop, 2-col tablet, 1-col mobile), glass-morphism card styling with accent glow on hover
15. **MetricCard** — Large number (JetBrains Mono) + label (MuseoModerno) + optional trend arrow
16. **FilterBar** — Year range dropdowns, gift type multi-select, membership status multi-select
17. **Chart components** (5 total):
    - `GivingOverTimeChart` — ComposedChart: bars for total giving + line for membership giving
    - `MembershipStatusChart` — PieChart with innerRadius (donut), hide labels <2%
    - `GiftTypeByYearChart` — Stacked BarChart by year
    - `TransactionVolumeChart` — LineChart with one line per gift type
    - `MembershipGivingDualAxis` — ComposedChart with dual YAxis (count left, dollars right)
    - All charts: `<Tooltip>` with currency/count formatters, `<ResponsiveContainer>`, `<Legend>`
18. **DataTable** — Sortable columns (click header), search input, pagination (25/page), currency formatting
19. **InsightsCard** — Auto-generated bullet points from aggregated data (peak year, growth %, top donor, reengagement opportunity from Former donor %)
20. **Assemble DonorDashboard.jsx** — Orchestrates all components in BentoGrid layout:
    - Row 1: 6 MetricCards
    - Row 2: GivingOverTimeChart (wide) + MembershipStatusChart
    - Row 3: GiftTypeByYearChart (wide) + InsightsCard
    - Row 4: TransactionVolumeChart (wide) + MembershipGivingDualAxis (wide)
    - Row 5: DataTable (full width)

### Phase 5: Remaining Pages & Deploy
21. **HomePage** — SDSHC title (Silkscreen), 4 large navigation cards linking to each dashboard
22. **Placeholder pages** — Vendor, Cost-share, Master with "Coming Soon" in respective theme colors
23. **GitHub Actions workflow** — `.github/workflows/deploy.yml`: checkout → Node 20 → npm ci → npm run build → upload dist → deploy to Pages
24. **Final polish** — Loading skeleton while Excel parses, responsive testing, entrance animations on cards

## Styling Approach
- **Light theme default** with dark mode toggle (persisted to localStorage)
  - Light: `#f5f5f0` background, white cards, subtle shadows
  - Dark: `#0d0d12` background, `#1a1a2e` cards, subtle noise texture
- **Glass-morphism cards**: `backdrop-filter: blur(10px)`, thin accent-colored borders (more pronounced in dark mode)
- **Subtle retro/techno feel**: Silkscreen pixel font for titles, JetBrains Mono for data, accent glow effects on hover
- **Bento grid**: 4-column responsive grid with varied card spans
- **Per-dashboard theming**: CSS `[data-theme="donor"]` sets `--accent: #4CAF50` (green), etc. — works in both light and dark modes
- **Dark mode toggle**: Sun/moon icon button in NavBar, toggles `[data-mode="dark"]` on `<html>`, stored in localStorage
- **Chart colors**: The specified 15-color palette for multi-series charts
- **NavButton shine**: Existing animation, colors driven by CSS variables

## Key Considerations
- **HashRouter** avoids GitHub Pages SPA routing issues (URLs: `/#/donor` instead of `/donor`)
- **Excel parsed once** per page load, cached in React context; ~1-2s load time for 2.6MB file
- **Column name validation** in parser to catch Excel schema changes early
- **Bundle size**: Recharts (~200KB) + SheetJS (~90KB) gzipped — acceptable for a dashboard app
- **Accessibility**: `aria-label` on chart containers, sufficient color contrast in both light and dark modes
- **Dark mode toggle** adds `[data-mode="dark"]` attribute which overrides background/card/text color variables; dashboard accent colors remain the same in both modes

## Verification
1. `npm run dev` — Local dev server, verify all charts render with real Excel data
2. `npm run build` — Confirm clean production build with no errors
3. Navigate all routes (`/#/`, `/#/donor`, `/#/vendor`, etc.) — verify no 404s
4. Test filters on Donor Dashboard — metrics and charts should update reactively
5. Test responsive: resize browser to tablet/mobile widths — bento grid should collapse
6. Push to `main` — GitHub Actions workflow should build and deploy to Pages
7. Verify live site at `https://plantshley.github.io/SDSHC-master-dashboard/`

---

# Master Peoples/Entities Dashboard - Implementation Plan

## Context
The team needs a Master Dashboard to view and explore all 2,423 people/entities in the SDSHC database. Unlike the Donor Dashboard (which aggregates transaction-level rows), this dashboard operates on one-row-per-person data from the "Master Database" sheet. The focus is on understanding the composition of the database — who's in it, what their relationships are, where they're located, their financial engagement levels, and easy access to individual profiles with links back to SharePoint.

## Data Source
**Sheet:** "Master Database" (2,423 rows, 35 columns)
**Key columns:**
- Identity: `PersonID`, `FullName.text`, `First Name`, `Last Name`
- Classification: `Relationship` (21+ types, comma-separated multi-values like "Donor, Vendor"), `MembershipStatus` (6 values: Current/Former/Never/Lifetime/Unknown/Deceased)
- Financials: `LifetimeGiftAmount`, `LifetimeVendingTotal`, `LifetimeCostshareTotal`, `LastGiftAmount`, `LastGiftYear`, `LastGiftType`
- Contact: `Email`, `Phone`, `Primary Address`, `Street`, `City`, `State`, `Zipcode`, `Contact Preference`, `Newsletter Status`
- Dates: `Last Transaction Yea`, `LastMembershipYear`, `LastGiftDate`, `Modified`
- URLs: `RecordURL`, `DonorURL`, `VendorURL`, `CostShareURL` (all 2,423 rows have all 4 URLs)
- Other: `ThankYouSent`, `DonorHistory`/`VendorHistory`/`CostShareHistory` (text flags)

## Files to Create/Modify

### New Files
```
src/utils/masterAggregations.js     — Pure aggregation functions
src/hooks/useMasterData.js          — Filter + memoize hook
src/pages/MasterDashboard.css       — Dashboard-specific styles
src/components/ProfileModal/ProfileModal.jsx  — Person profile modal
src/components/ProfileModal/ProfileModal.css
src/components/charts/StateDistributionChart.jsx
src/components/charts/EngagementMatrixChart.jsx
src/components/charts/FinancialByRoleChart.jsx
```

### Files to Modify
```
src/utils/excelParser.js            — Add parseMasterDatabase() function
src/context/DataContext.jsx          — Include masterDatabase in parsed data
src/pages/MasterDashboard.jsx       — Replace placeholder with full dashboard
src/components/FilterBar/FilterBar.jsx — Make it generic (accept filter config)
src/components/DataTable/DataTable.jsx — Add onRowClick callback prop for modal
```

## Implementation Steps

### Step 1: Data Layer — Excel Parser
Add `parseMasterDatabase(workbook)` to `src/utils/excelParser.js`:
- Find sheet named "Master Database" (not "Master Database (expanded)")
- Extract all 35 columns, normalize to camelCase keys
- Notable mappings: `FullName.text` → `fullName`, `Last Transaction Yea` → `lastTransactionYear`
- Parse dates: `LastGiftDate`, `Modified` (Excel serial numbers → Date objects)
- Parse numbers: `LifetimeGiftAmount`, `LifetimeVendingTotal`, `LifetimeCostshareTotal`, `LastGiftAmount`
- Keep all 4 URL columns: `recordUrl`, `donorUrl`, `vendorUrl`, `costShareUrl`
- History flags: `DonorHistory`/`VendorHistory`/`CostShareHistory` → boolean `hasDonorHistory`/etc. (`=== 'View'`)
- Update `fetchAndParseExcel()` return to include `masterDatabase` array

### Step 2: Aggregation Functions — `src/utils/masterAggregations.js`
Pure functions: `computeMasterMetrics`, `computeRelationshipBreakdown`, `computeMembershipBreakdown`, `computeStateDistribution`, `computeEngagementMatrix`, `computeFinancialSummaryByRole`, `computeMasterInsights`, `getFilterOptions`

### Step 3: Data Hook — `src/hooks/useMasterData.js`
Filters: `{ relationships[], membershipStatuses[], states[], newsletterStatuses[] }`

### Step 4: FilterBar — Generic `fields` config array
### Step 5: ProfileModal — Click row to view person profile with links
### Step 6: DataTable — `onRowClick`, `searchPlaceholder`, `showIf` column config
### Step 7: MasterDashboard page with metrics, insights, charts, table
### Step 8: Charts — MembershipStatusChart (donut), StateDistributionChart, EngagementMatrixChart, FinancialByRoleChart
### Step 9: CSS — `.master-*` classes, purple theme via `data-theme="master"`

## Verification
1. `npm run dev` → `/#/master` renders with real data
2. Filters update all metrics, charts, table, and insights
3. Click row → ProfileModal with working SharePoint links
4. DonorDashboard unchanged after FilterBar refactor
5. Dark mode works on Master dashboard
6. Responsive at tablet/mobile widths
7. `npm run build` — clean build

---

# ProfileModal Redesign + Relationship Treemap

## Context
The ProfileModal needs a visual overhaul — font sizes are too small, spacing feels cramped, the membership status badge under the name is redundant, and the overall look is bland. Additionally, the Relationship Breakdown donut chart is misleading because people can have multiple roles (e.g., "Donor, Vendor"), so pie slices don't add up to total people.

## Changes

### 1. Replace Relationship Breakdown Donut → Treemap
**File:** `src/components/charts/RelationshipTreemap.jsx` (new)

Use Recharts `<Treemap>` to show relationship role counts as nested rectangles. Each rectangle is sized by count and colored from CHART_COLORS. Includes custom content renderer showing role name + count inside each rectangle.

**Data format stays the same** from `computeRelationshipBreakdown()`: `{ status, count, percentage }` — map to `{ name, size, fill }` for the Treemap.

**File:** `src/pages/MasterDashboard.jsx`
- Replace `<MembershipStatusChart data={relationshipBreakdown} />` with `<RelationshipTreemap data={relationshipBreakdown} />`

### 2. ProfileModal Redesign
**Files:** `src/components/ProfileModal/ProfileModal.jsx` + `ProfileModal.css`

**Key changes:**
- **Wider modal**: 680px max-width (up from 540px) for two-column layout
- **Remove membership status badge** from under the name (redundant with Membership section)
- **Bigger fonts**: name 24px, section titles 13px, info labels 12px, financial values 20px, tags 11px
- **More spacing**: modal padding 32px, section margin 24px, avatar 64px
- **Two-column body** (desktop): Left = Financial + Membership, Right = Contact with icon accents
- **Section titles**: accent-colored left border instead of bottom border
- **Contact icons**: Unicode characters styled in accent color
- **Quick links**: below header, no section title needed
- **Status badge**: moves to Membership section inline with "Status:" value
- **Responsive**: single column below 700px

## Verification
1. Relationship Breakdown shows treemap instead of donut
2. Modal opens with two-column layout, bigger fonts, icon accents
3. Dark mode works
4. Responsive collapse on mobile
5. `npm run build` — clean build

---

# Export Button Feature

## Context
Users need to export dashboard data for sharing and offline analysis. Three export types: image screenshot (PNG) of metrics+charts for quick sharing, chart data as Excel for deeper analysis, and raw table data as Excel. For the Donor dashboard, "Export Transaction Data" exports the full transaction-level history (not the aggregated donor summary in the table).

## New Dependency
- `html2canvas` — captures DOM elements as PNG images

## New Files

### `src/utils/exportUtils.js`
Three export functions using existing `xlsx` package + new `html2canvas`:

- **`exportAsImage(element, filename)`** — html2canvas capture (scale:2 for retina, backgroundColor:null to preserve theme). Creates a temporary download link.
- **`exportChartDataExcel({ metrics, metricsTitle, sheets, filename })`** — Multi-sheet XLSX. First sheet: metrics as Metric/Value rows. Then one sheet per chart dataset from a generic `sheets` array. Uses `formatMetricLabel()` helper to convert camelCase → "Title Case".
- **`exportTableData(rows, filename)`** — Single-sheet XLSX from array of row objects.

### `src/components/ExportDropdown/ExportDropdown.jsx` + `.css`
Dropdown button component with three menu items. Same click-outside-to-close pattern as FilterBar's MultiSelect. Shows "Exporting..." disabled state during async ops. Styled with CSS vars to match FilterBar (--card-bg, --border-color, --accent, --font-body). `margin-left: auto` pushes it right in the FilterBar flexbox. Third menu item label is configurable via prop — "Export Transaction Data" for Donor, "Export Table Data" for Master.

## Modified Files

### `src/components/FilterBar/FilterBar.jsx`
- Add optional `exportHandlers` prop: `{ onExportImage, onExportChartData, onExportTableData }`
- Import and render `<ExportDropdown>` after "Clear All" button when prop is provided
- Backward compatible — no export button when prop is omitted

### `src/hooks/useDonorData.js` (line ~97)
- Add `filteredRows` to return object (variable already exists locally, just not exported)

### `src/pages/DonorDashboard.jsx`
- Add `chartsRef = useRef(null)` for image capture area
- Destructure `filteredRows` from useDonorData
- Three `useCallback` export handlers:
  - **Image**: `exportAsImage(chartsRef.current, 'donor-dashboard')`
  - **Chart data**: `exportChartDataExcel` with metrics + 5 sheets (Giving by Year, Membership Status, Gift Type by Year, Transaction Volume, Membership by Year)
  - **Table data**: Map `filteredRows` (transaction-level, NOT aggregated `allDonors`) to clean column names → `exportTableData`
- Pass `exportHandlers` to FilterBar
- **JSX restructure**: Wrap metrics + insights + charts in `<div ref={chartsRef} className="export-capture-area">`. Move DataTable into its own `<BentoGrid>` outside the ref (no visual change — it's already colSpan=4 full width)

### `src/pages/MasterDashboard.jsx`
- Same ref + callback pattern
- Chart data sheets: Relationship Breakdown, Membership Breakdown, State Distribution, Engagement Matrix, Financial Summary
- Table export: Map `allPeople` to clean columns (Full Name, Relationship, Membership Status, State, Email, Phone, Lifetime Giving/Vending/Cost-share, Last Transaction Year, Newsletter Status)
- Same JSX restructure with capture ref

### `src/pages/DonorDashboard.css` + `src/pages/MasterDashboard.css`
- Add `.export-capture-area { background: var(--bg-primary); }` for proper PNG background

## Excel Sheet Structures

**Donor "Export Data"** → `donor-chart-data.xlsx`:
| Sheet | Columns |
|---|---|
| Donor Metrics | Metric, Value (6 rows) |
| Giving by Year | year, totalGiving, membershipCount, + gift type cols |
| Membership Status | status, count, percentage |
| Gift Type by Year | year, + gift type amount cols |
| Transaction Volume | year, + gift type count cols |
| Membership by Year | year, membershipCount, totalGiving |

**Donor "Export Transaction Data"** → `donor-transactions.xlsx`:
Single sheet: Person ID, Full Name, Membership Status, Gift Date, Gift Year, Gift Amount, Gift Type, Memo, Description, Gift Month, Transaction Source

**Master "Export Data"** → `master-chart-data.xlsx`:
| Sheet | Columns |
|---|---|
| Master Metrics | Metric, Value (8 rows) |
| Relationship Breakdown | status, count, percentage |
| Membership Breakdown | status, count, percentage |
| State Distribution | name, value |
| Engagement Matrix | role, Current, Former, Never, Lifetime, Unknown |
| Financial Summary | role, giving, vending, costshare |

**Master "Export Table Data"** → `master-database.xlsx`:
Single sheet with person-level fields (Full Name, Relationship, Membership Status, State, Email, Phone, financials, etc.)

## Verification
1. `npm install html2canvas` succeeds, `npm run build` passes
2. Export button appears in FilterBar on both dashboards, right-aligned
3. "Export as Image" downloads a PNG showing metrics + charts (not the table), correct in both light/dark mode
4. "Export Data" downloads multi-sheet XLSX with correct metrics and chart data
5. "Export Transaction Data" on Donor downloads transaction-level rows (not aggregated); "Export Table Data" on Master downloads person rows
6. All exports respect current filter state
7. Button shows "Exporting..." during async operations
8. FilterBar without exportHandlers prop still works (backward compatible)

---

# Simple Password Gate

## Context
The dashboard is hosted on a public GitHub Pages URL and displays personal information (names, emails, phone numbers, addresses, financial data). A simple client-side password gate will prevent casual access. This is NOT cryptographic security — the data is still in the browser bundle — but it stops someone who stumbles on the URL from seeing PII without knowing the password.

## Approach
Create a full-screen password gate component that renders instead of the app until the correct password is entered. Store a flag in `localStorage` so returning users on the same device don't have to re-enter it.

**Password:** `WeHeartS0il!` (hardcoded)

## New Files

### `src/components/PasswordGate/PasswordGate.jsx`
- Full-screen page with centered card (matches existing glass-morphism style)
- SDSHC branding/title at top (Silkscreen font)
- Single password input field (`type="password"`, `autocomplete="current-password"`) so browsers offer to save/autofill
- Hidden username input for password manager association
- Wrapped in `<form>` for proper submit behavior
- "Enter" button submits, Enter key also submits
- On correct password → `localStorage.setItem('sdshc-auth', 'true')` → render children
- On wrong password → shake animation + "Incorrect password" message
- Reads `localStorage` on mount — if flag exists, skip gate immediately

### `src/components/PasswordGate/PasswordGate.css`
- Full-viewport layout: `min-height: 100vh`, centered with flexbox
- Background: `var(--bg-primary)` (respects light/dark mode)
- Centered card: max-width ~400px, glass-morphism styling matching BentoCard
- Input styled with existing CSS vars (`--font-body`, `--border-color`, `--accent`)
- Submit button uses `--accent` color scheme
- `@keyframes shake` animation on wrong password
- Responsive — works on mobile

## Modified Files

### `src/main.jsx`
Wrap `<DataProvider>` with `<PasswordGate>`:
```jsx
<HashRouter>
  <PasswordGate>
    <DataProvider>
      <Routes>...</Routes>
    </DataProvider>
  </PasswordGate>
</HashRouter>
```
This prevents the Excel data from even being fetched until authenticated.

### `src/App.jsx`
Add a small "Log out" button in the header (near the theme toggle) that clears `localStorage.removeItem('sdshc-auth')` and reloads the page via `window.location.reload()`.

## Implementation Details

- **Password check:** Simple string comparison `input === 'WeHeartS0il!'`
- **localStorage key:** `sdshc-auth` with value `'true'`
- **Browser autofill:** `<form>` with hidden username input + `autocomplete="current-password"` on password input
- **Logout:** Clear localStorage key + `window.location.reload()`

## Verification
1. `npm run dev` → site shows password gate, not the dashboard
2. Enter wrong password → error message with shake animation
3. Enter `WeHeartS0il!` → dashboard loads, gate disappears
4. Refresh page → dashboard loads immediately (localStorage remembered)
5. Browser offers to save password on first successful entry
6. Click "Log out" in header → gate reappears
7. Works in both light and dark mode
8. `npm run build` → clean build

---

# Vendor Dashboard

## Context
The Vendor History data (4,466 transaction rows from the "Vendor History" sheet) needs its own dashboard, following the same architecture and layout as the Donor Dashboard. The vendor theme color (pink) is already wired via `data-theme="vendor"`.

## Data Source
**Sheet:** "Vendor History" (4,466 rows)
**Key columns:** Id, QB Transaction ID, PersonID, Person IDId, FullName, First Name, Last Name, Amount, Payment Date, Payment Year, Payment Month, Payment Type, LifetimeVendingTotal, Last Vend Year, Memo, Split Note (category/purpose), Transaction Source, RecordURL, VendorURL

## New Files

### `src/utils/vendorAggregations.js`
Pure aggregation functions mirroring `donorAggregations.js`:

- **`computeVendorMetrics(rows)`** → `{ totalVendors, totalTransactions, lifetimeSpending, avgPaymentSize, peakSpendingYear, yoyGrowth, yoyYears, dataYearRange }`
- **`computeSpendingByYear(rows)`** → `{ data: [{ year, totalGiving, ...paymentTypeAmounts }], paymentTypes: [] }` — uses `totalGiving` as field name so `GivingOverTimeChart` can be reused without modification
- **`computePaymentTypeBreakdown(rows)`** → `[{ status, count, percentage }]` — uses `status` as field name so `MembershipStatusChart` can be reused; percentage based on transaction count
- **`computeCategoryByYear(rows)`** → `{ data: [{ year, ...categoryAmounts }], categories: [] }` — groups by aggregated category
- **`computeTransactionVolumeByType(rows)`** → `{ data: [{ year, ...paymentTypeCounts }], paymentTypes: [] }`
- **`computeTransactionVolumeByCategory(rows)`** → `{ data: [{ year, ...categoryCounts }], categories: [] }`
- **`computeAllVendors(rows)`** → deduplicated vendor list sorted by totalSpent desc, each with `{ personId, fullName, totalSpent, transactionCount, lastPaymentYear, paymentTypeBreakdown: { [type]: { amount, count } }, recordUrl, vendorUrl, lifetimeVendingTotal }`
- **`computeVendorInsights(metrics, spendingByYearData, paymentTypeBreakdown, rows)`** → `[{ type, text }]` — peak year, top vendor, spending concentration, top category
- **`getUniquePaymentTypes(rows)`**, **`getUniqueVendorYears(rows)`**, **`getUniqueCategories(rows)`** — filter option extractors; categories returns aggregated names
- **`aggregateVendorCategory(splitNote, memo, vendorName)`** — category aggregation function (see Category Aggregation section below)

### `src/hooks/useVendorData.js`
Mirrors `useDonorData.js`:
- Filters: `{ yearStart, yearEnd, paymentTypes: [], categories: [] }`
- Intermediate `yearFilteredRows` (year filter only)
- Fully `filteredRows` (all filters)
- Category filter uses `aggregateVendorCategory(r.splitNote, r.memo, r.fullName)` for comparison
- Memoized aggregations
- Returns: `{ isLoading, error, metrics, spendingByYear, paymentTypeBreakdown, categoryByYear, transactionVolume, categoryVolume, allVendors, insights, filterOptions, filteredRows, filteredRowCount, totalRowCount }`

### `src/pages/VendorDashboard.jsx`
Replaces placeholder. Same layout as DonorDashboard:

**Filters:**
```js
{ type: 'yearRange', key: ['yearStart', 'yearEnd'], label: 'Year Range' }
{ type: 'multiSelect', key: 'paymentTypes', label: 'Payment Type' }
{ type: 'multiSelect', key: 'categories', label: 'Category' }
```

**Metrics (6 cards):** Total Vendors | Total Transactions | Lifetime Spending | Avg Payment | Peak Year | YoY Growth

**Charts (BentoGrid):**
- InsightsCard (colSpan 4)
- Spending Over Time (colSpan 3) — reuse `GivingOverTimeChart` with `barLabel="Total Spending"` and category overlay dropdown
- Payment Type Breakdown (colSpan 1) — reuse `MembershipStatusChart` with `tooltipLabel="payments"` prop
- Category Spending table (colSpan 1) — inline table component (same pattern as donor's gift type table)
- Category Dollar Breakdown stacked bar (colSpan 3) — reuse `GiftTypeByYearChart`
- Transaction Volume by Payment Type (colSpan 2) — reuse `TransactionVolumeChart`
- Transaction Volume by Category (colSpan 2) — reuse `TransactionVolumeChart` with `categoryVolume` data

**Table columns:**
```js
const VENDOR_COLUMNS = [
  { key: 'fullName', label: 'Vendor Name', render: 'donorLink', className: 'wrap-cell' },
  { key: 'totalSpent', label: 'Total Spent', format: 'currency', align: 'right' },
  { key: 'transactionCount', label: 'Transactions', align: 'right' },
  { key: 'lastPaymentYear', label: 'Last Payment', align: 'right' },
  { key: 'vendorUrl', label: 'History', render: 'historyLink' },
]
```

**Exports:** Image (PNG), Chart Data (multi-sheet Excel), Transaction Data (Excel with all vendor transaction rows)

### `src/pages/VendorDashboard.css`
Copy of `DonorDashboard.css` with `.donor-` → `.vendor-` class renames. Same grid layouts, spacing, responsive breakpoints.

## Modified Files

### `src/utils/excelParser.js`
- Add `parseVendorHistory(workbook)` function following `parseDonorHistory` pattern
- Column mappings: Amount→amount, Payment Year→paymentYear, Payment Type→paymentType, Split Note→splitNote, FullName→fullName, PersonID→personId, RecordURL→recordUrl, VendorURL→vendorUrl, Memo→memo, etc.
- Add to `fetchAndParseExcel` return: `vendorHistory: parseVendorHistory(workbook)`

### `src/components/DataTable/DataTable.jsx`
- Add optional `breakdownKey` prop (default: `'giftTypeBreakdown'`)
- Replace 3 hardcoded `row.giftTypeBreakdown` references with `row[breakdownKey]`
- Vendor passes `breakdownKey="paymentTypeBreakdown"`, Donor unchanged (uses default)

### `src/components/charts/MembershipStatusChart.jsx`
- Add optional `tooltipLabel` prop (default: `'donors'`)
- Replace hardcoded `"donors"` with `tooltipLabel`
- Vendor passes `tooltipLabel="payments"`, Donor/Master unchanged (use default)

### `src/components/charts/GivingOverTimeChart.jsx`
- Add optional `barLabel` prop (default: `"Total Giving"`)
- Vendor passes `barLabel="Total Spending"`, Donor unchanged (uses default)

## Verification
1. `npm run dev` → navigate to `/#/vendor`, all charts render with real vendor data
2. Filters work — Year Range, Payment Type, Category all update metrics/charts/table
3. Click table row → expands showing payment type breakdown
4. Export Image → PNG of metrics + charts
5. Export Data → multi-sheet Excel with chart data
6. Export Transaction Data → Excel with all vendor transaction rows
7. Donor dashboard still works unchanged after DataTable/MembershipStatusChart prop additions
8. Dark mode works on vendor dashboard
9. `npm run build` → clean build

---

# Vendor Dashboard: Category Aggregation

## Context
The Vendor Dashboard has 72 unique Split Note (category) values, many of which are clearly related (e.g., "Video", "Videos", "Commercials" are all media production). Additionally, 336 rows have `-SPLIT-` as their category and 1,666 rows have `Accounts Payable` — both need intelligent sub-categorization. Aggregating into ~15 meaningful groups makes charts, filters, and insights much more useful.

## Category System

### `aggregateVendorCategory(splitNote, memo, vendorName)`
Three-argument function in `vendorAggregations.js` with layered categorization logic:

1. **Direct lookup** via `CATEGORY_LOOKUP` Map — maps 50+ raw Split Note values to aggregated categories
2. **Contractual override** — if mapped category is 'Contractual' but vendor name looks like a person → 'Personnel'
3. **-SPLIT- handling** — check memo for keywords (soil health school, intern, on farm trial, cover crop, cost share, 319, DANR, test plot, demo); default remainder → 'Personnel'
4. **Accounts Payable sub-categorization** — layered checks:
   - Memo keywords first (cost-share terms, I&E terms, soil health school, conference, radio/advertising)
   - Credit card vendor detection (`AP_CREDIT_CARD_VENDORS`)
   - Media/radio/TV vendor names (`AP_MEDIA_VENDORS`)
   - FCC call-letter regex (`/^[kw][a-z]{2,4}([\s-]|$)/i`)
   - Newspaper vendors (`AP_NEWSPAPER_VENDORS`)
   - Marketing/promo vendors (`AP_MARKETING_VENDORS`)
   - Printing companies (`AP_PRINTING_VENDORS`) → I&E
   - Hotels/venues (`AP_HOTEL_VENDORS`) → Annual Meeting
   - Known personnel orgs (`AP_PERSONNEL_VENDORS`)
   - Individual person detection via `looksLikePersonName()` → Personnel
   - Default remaining AP → Uncategorized

### Final Category Mapping

| Aggregated Category | Sources |
|---|---|
| Contractual | Contractual (businesses/orgs only; individuals → Personnel) |
| Soil Health School | Soil Health School, -SPLIT-/AP memos with "soil health school" |
| Annual Meeting | Annual Meeting, AP: hotels/venues/event centers |
| Cost-Share | On Farm Trial, 8200 DANR/319, AP/-SPLIT- memos: cover crop, cost share, 319, DANR |
| Information & Education | Information Distribution, Education, Literature, Printed, Test Plots, Demo Plots, AP: printing companies, test plot/demo memos |
| Media Production | Audio, Video, Videos, Commercials |
| Workshops & Events | Workshops, Workshop Expense, Booths, Bus Tours Field Walks, Meals and Entertainment |
| Supplies & Office | Supplies, Office Supplies, Computer and Internet Expenses |
| Marketing & Outreach | Advertising and Promotion, Influencer Outreach, Website, Newsletter, FFA/4H/Envirothon, Voices for Soil Health, AP: radio/TV stations, newspapers, marketing agencies |
| Personnel | Personnel/Wages, Salary, Intern, Mentors, Non Salary, Contractual (individuals), -SPLIT- (default), AP: individual people, SDACD |
| Professional & Admin | Professional Fees, Insurance, Tax, Bank Charges, Dues, Rent, Indirect, Travel |
| Soil Health Programs | Soil Health Buckets/Quilt, Planner, Infiltration kits, Promotional, Survey |
| Grants & Projects | NR206740XXXC012, NR196740G002, SARE, NFWF, 8100-8402 grant codes, Youth |
| Credit Card | AP: First National Bank of Omaha |
| Uncategorized | Remaining AP businesses & records with no Split Note |

### Person Name Detection
`looksLikePersonName(lowerName)` strips parentheticals, removes "and"/"&" conjunctions, checks 2-4 word count, then verifies no `BUSINESS_INDICATORS` (100+ terms like 'llc', 'inc', 'services', 'farm', 'county', etc.) are present.

## Category Info Popover

An info button (circled "i" icon) appears in the FilterBar next to the "Category" filter. Clicking it toggles a popover showing what raw Split Note values map to each aggregated category.

- Export `VENDOR_CATEGORY_MAP` from `vendorAggregations.js` (plain object: `{ "Category Name": ["source 1", "source 2", ...] }`)
- `VendorDashboard.jsx` passes it as `categoryInfoMap` prop to `FilterBar`
- `FilterBar.jsx` renders `CategoryInfoButton` component when prop is provided
- Popover: glass-morphism card, scrollable, click-outside-to-close

## Chart Improvements

1. **Spending chart bar label**: `GivingOverTimeChart` accepts `barLabel` prop — vendor passes `"Total Spending"`, donor uses default `"Total Giving"`
2. **Spending chart overlay**: Shows categories (not payment types) — merged dataset from `spendingByYear.data` + `categoryByYear.data` keyed by year
3. **Category volume chart**: New `TransactionVolumeChart` instance with `categoryVolume` data alongside existing payment type volume chart

## Verification
1. Vendor dashboard categories show ~15 aggregated names (not 72 raw Split Notes)
2. Category filter shows aggregated options
3. Spending chart says "Total Spending", overlay shows categories
4. Category info popover works
5. Contractual individuals correctly route to Personnel
6. AP rows correctly sub-categorized by memo/vendor name
7. Donor dashboard unchanged
8. `npm run build` → clean build

---

# Cost-Share Dashboard

## Context
The Cost-Share History data (438 rows from the "Cost-share History" sheet) plus a separate funding CSV (`public/data/cost-share-funding.csv`, ~100 rows) need their own dashboard. This replicates and improves on the standalone cost-share dashboard at `SDSHC-cost-share-dashboard`, bringing it into the master dashboard with consistent styling, filtering, exports, and a farm location map. The cost-share theme (teal, `#4CA5C2`) is already configured via `data-theme="costshare"`.

## Data Sources

### 1. Cost-share History (Excel sheet, 438 rows, 35 columns)
**Sheet:** "Cost-share History" from `public/data/Peoples Database Queries_local.xlsx`

**Key columns:**
- Identity: `PersonID`, `FullName`, `Farm Name`
- Financial: `OData_319 Amount`, `Other Amount`, `Local Amount`, `Total Amount`, `LifetimeCostshareTotal`
- Practice: `BMP` (name), `BMP Number`, `BMP ID`, `Practice Acres`, `Practice Date`
- Environmental: `N Reductions`, `P Reductions`, `S Reductions`, `N Combined`, `P Combined`, `S Combined`
- Geographic: `Lat`, `Longitude`, `Stream`, `Contract ID`
- Project: `Project Year`, `Project Segment`, `Paid Date`
- Links: `RecordURL`, `CostShareURL`

### 2. Funding Budget Data (CSV, ~100 rows)
**File:** `public/data/cost-share-funding.csv`
**Columns:** `BMP`, `BMP Type`, `Fund Name`, `Amount Allocated`, `Amount Used`, `Amount Available`, `Segment`, `Start`, `End`

## New Dependencies
- `leaflet` ^1.9.4
- `react-leaflet` ^5.0.0

## Files Created

### `src/utils/csvParser.js`
Parse CSV using SheetJS. Single function: `fetchAndParseCSV(baseUrl, filename)` → fetches CSV, parses with `XLSX.read(text, { type: 'string' })`, returns array of normalized objects.

### `src/utils/costShareAggregations.js`
Pure aggregation functions:
- `computeCostShareMetrics(rows)` — totals, reductions (combined/synergistic values), peak year, YoY
- `computeFundingByYear(rows)` — stacked area chart data (319, Other, Local)
- `computeFundingSourceBreakdown(rows)` — donut chart data
- `computeBMPDistribution(rows)` — sorted by count desc
- `computeEnvironmentalImpact(rows)` — N/P/S reductions by BMP + combined totals
- `computeTimeline(rows)` — contracts & acres over time
- `computeAllFarms(rows)` — deduplicated farm list with `bmpBreakdown` for expandable rows
- `computeCostShareInsights(metrics, ...)` — auto-generated highlights
- Filter option extractors: `getUniqueProjectYears`, `getUniqueBMPs`, `getUniqueSegments`, `getUniqueStreams`

### `src/utils/fundingAggregations.js`
Pure functions for the CSV funding data (budget tracking section):
- `computeBudgetBySegment(fundingRows)` — allocated/used/available by segment
- `computeFundingBySource(fundingRows)` — by fund name with utilization %
- `computeBudgetByBMPType(fundingRows)` — by BMP type with utilization %

### `src/hooks/useCostShareData.js`
Follows useDonorData/useVendorData pattern:
- Filters: `{ yearStart, yearEnd, bmps: [], segments: [], streams: [] }`
- Two-level filtering: yearFilteredRows then filteredRows
- Derives `mapData` from filteredRows filtering for valid SD coordinates
- Returns all aggregations + funding CSV aggregations

### New Chart Components
- `FundingOverTimeChart.jsx` — Stacked AreaChart (319, Other, Local)
- `BMPDistributionChart.jsx` — Horizontal BarChart, top 10 BMPs
- `EnvironmentalImpactChart.jsx` — Grouped BarChart (N/P/S), Combined + top BMPs
- `DualAxisTimelineChart.jsx` — Generic dual-axis chart (configurable keys/labels/colors)
- `BudgetOverviewChart.jsx` — Grouped BarChart (Allocated/Used/Available by segment)
- `FundingBySourceChart.jsx` — Grouped horizontal BarChart (allocated vs used)

### `src/components/CostShareMap/CostShareMap.jsx` + `.css`
Interactive Leaflet map:
- OpenStreetMap tiles, centered on SD (~44.3/-99.5, zoom 7)
- CircleMarker colored by funding level, sized by acres
- Popup on click: farm details, funding, acres, practices
- Legend showing color scale
- Aggregates data by personId for one marker per farm

### `src/pages/CostShareDashboard.jsx` + `.css`
Full dashboard layout:
- Header with filter badge
- FilterBar (Year Range, Segment, BMP, Stream)
- 6 MetricCards (Total Farms, Total Funding, Acres, N/P/S Reductions)
- InsightsCard
- Charts: Funding Over Time, Funding Source donut, BMP table, BMP Distribution bar, Environmental Impact, Contracts & Acres Timeline
- Funding Analysis section: Budget by Segment, Funding by Source, Budget by BMP Type
- Map (outside chartsRef — Leaflet tiles don't export via html2canvas)
- DataTable with expandable BMP breakdown rows

## Files Modified
- `src/utils/excelParser.js` — Added `parseCostShareHistory()`, updated `fetchAndParseExcel()` return
- `src/context/DataContext.jsx` — Parallel CSV loading via `Promise.all`, exposes `costShareFunding`

## Key Considerations
- Map outside export capture area (html2canvas can't capture Leaflet tiles due to CORS)
- Environmental metrics use Combined/synergistic values (per user preference)
- CSV loaded in DataContext alongside Excel — small file, negligible overhead
- Fund label: "Other" (not CWSRF-WQ)
- Map click: simple Leaflet popup (not ProfileModal)

## Verification
1. `npm run dev` → `/#/cost-share` renders with real data
2. All 6 metric cards show values
3. All charts render: funding area, donut, BMP bar, env impact, timeline, map, budget overview, funding by source, budget by BMP type
4. Map shows farm markers across SD with correct popups
5. Filters work — Year Range, Segment, BMP, Stream update metrics/charts/table/map
6. Table search, sort, expand (BMP breakdown) work
7. Export Image → PNG of metrics + charts (excluding map)
8. Export Data → multi-sheet Excel
9. Export Table Data → transaction-level Excel
10. Dark mode works
11. `npm run build` → clean build
