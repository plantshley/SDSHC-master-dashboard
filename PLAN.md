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
