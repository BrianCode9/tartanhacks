# BudgetFlow Developer Guide

This guide tells you exactly where to look when you need to change, debug, or extend anything in the app.

---

## Project Structure at a Glance

All application code lives inside `budget-flow/src/`. Everything else at the root is repo-level config.

```
tartanhacks/
├── budget-flow/               <-- The actual Next.js app
│   ├── src/
│   │   ├── app/               <-- Pages + API routes (Next.js App Router)
│   │   ├── components/        <-- Reusable React components
│   │   └── lib/               <-- Utilities, API clients, types, mock data
│   ├── public/                <-- Static assets (SVGs, favicon)
│   ├── .env.local             <-- API keys and secrets (DO NOT COMMIT)
│   ├── package.json           <-- Dependencies and scripts
│   ├── globals.css            <-- Theme, colors, and global styles
│   └── next.config.ts         <-- Next.js settings
├── LICENSE
├── README.md                  <-- Project README for GitHub
└── DEVELOPER_GUIDE.md         <-- This file
```

---

## Where to Look: Quick Reference

| I want to...                          | Look here                                      |
|---------------------------------------|-------------------------------------------------|
| Change the sidebar / navigation       | `src/components/Sidebar.tsx`                    |
| Edit the dashboard page               | `src/app/dashboard/page.tsx`                    |
| Edit the statistics/analytics page    | `src/app/statistics/page.tsx`                   |
| Edit the strategy page                | `src/app/strategy/page.tsx`                     |
| Change the Sankey (money flow) diagram| `src/components/SankeyDiagram.tsx`              |
| Change the strategy workflow graph    | `src/components/StrategyGraph.tsx`              |
| Modify colors, theme, or dark mode    | `src/app/globals.css`                           |
| Change the app layout / wrapper       | `src/app/layout.tsx`                            |
| Update TypeScript types               | `src/lib/types.ts`                              |
| Edit mock/demo data                   | `src/lib/mock-data.ts`                          |
| Modify banking API calls              | `src/lib/nessie.ts` + `src/app/api/nessie/route.ts` |
| Modify AI API calls                   | `src/lib/dedalus.ts` + `src/app/api/ai/route.ts`    |
| Change API keys or env vars           | `.env.local`                                    |
| Add/remove dependencies               | `package.json`                                  |

---

## Pages (What the User Sees)

All pages live in `src/app/`. Each folder is a route.

### Dashboard (`src/app/dashboard/page.tsx`)
- **Route:** `/dashboard` (also the home page via redirect in `src/app/page.tsx`)
- **What it shows:** Income, spending, net savings stat cards + a Sankey diagram + category breakdown cards
- **Data source:** `mock-data.ts` (categories, income, sankey builder)
- **Key component:** `SankeyDiagram` from `src/components/SankeyDiagram.tsx`

### Statistics (`src/app/statistics/page.tsx`)
- **Route:** `/statistics`
- **What it shows:** Spending trend area chart, category donut chart, top merchants bar chart, merchant details table
- **Data source:** `mock-data.ts` (monthly spending, merchants)
- **Charts library:** Recharts (`recharts` package)

### Strategy (`src/app/strategy/page.tsx`)
- **Route:** `/strategy`
- **What it shows:** Summary cards, savings banner, interactive strategy workflow graph, action items list
- **Data source:** `mock-data.ts` (strategy nodes and edges)
- **Key component:** `StrategyGraph` from `src/components/StrategyGraph.tsx` (loaded with `dynamic()` to avoid SSR)

### Home (`src/app/page.tsx`)
- **Route:** `/`
- **Does one thing:** Redirects to `/dashboard`

---

## Components

### Sidebar (`src/components/Sidebar.tsx`)
- Fixed 256px left sidebar present on every page
- Navigation links, logo, user profile section
- **To add a new page:** Add a new nav item to the `navItems` array in this file, then create the corresponding page folder under `src/app/`

### SankeyDiagram (`src/components/SankeyDiagram.tsx`)
- D3-based Sankey diagram showing income flowing through spending categories
- Uses `d3-sankey` for layout and raw D3 for rendering
- Responsive via `ResizeObserver`
- Tooltip on hover showing flow amounts
- **To change the flow data:** Edit `buildSankeyData()` in `src/lib/mock-data.ts`

### StrategyGraph (`src/components/StrategyGraph.tsx`)
- React Flow (`@xyflow/react`) interactive node graph
- Nodes are color-coded by type: income (green), goal (blue), strategy (purple), suggestion (yellow), warning (red)
- Has zoom, pan, minimap controls
- **To change strategy data:** Edit `mockStrategyNodes` and `mockStrategyEdges` in `src/lib/mock-data.ts`

---

## API Routes (Backend)

API routes are serverless functions that proxy requests to external services. They live in `src/app/api/`.

### Banking API (`src/app/api/nessie/route.ts`)
- Proxies requests to Capital One's Nessie API (`http://api.nessieisreal.com`)
- Supports GET and POST
- Uses `NESSIE_API_KEY` from `.env.local`
- Client helper: `src/lib/nessie.ts` (has functions like `getCustomers()`, `getAccounts()`, `getPurchases()`, etc.)

### AI API (`src/app/api/ai/route.ts`)
- Proxies requests to the Dedalus AI service (Claude-powered)
- POST only, with `prompt` and `type` fields
- Two modes: `budget-analysis` and `strategy`
- Uses `DEDALUS_API_KEY` and `DEDALUS_API_URL` from `.env.local`
- Client helper: `src/lib/dedalus.ts` (has `analyzeBudget()` and `generateStrategies()`)

---

## Utility Libraries (`src/lib/`)

### `types.ts` - TypeScript Interfaces
All shared types in one place. If you add new data shapes, define them here.

Key types:
- `SpendingCategory` - A budget category with subcategories
- `BudgetSankeyData` - Nodes and links for the Sankey diagram
- `StrategyNode` / `StrategyEdge` - Strategy graph data
- `MonthlySpending` - Month-over-month amounts
- `MerchantSpending` - Merchant spending breakdowns
- `NessieCustomer`, `NessieAccount`, `NessiePurchase`, `NessieMerchant` - Banking API shapes

### `mock-data.ts` - Demo Data
All the hardcoded data used for development and demo. This is where you change numbers, categories, merchants, strategy nodes, etc. When you hook up real API data, you'll replace calls to this file with actual API responses.

Key exports:
- `mockCategories` - 7 spending categories with subcategories
- `mockIncome` - Monthly income ($5,000)
- `mockMonthlySpending` - 6 months of trend data
- `mockMerchants` - 10 merchant entries
- `mockStrategyNodes` / `mockStrategyEdges` - Strategy graph data
- `buildSankeyData()` - Converts categories into Sankey format

### `nessie.ts` - Banking API Client
Functions for calling the Nessie banking API. Uses `fetch` with 60-second cache revalidation.

### `dedalus.ts` - AI API Client
Functions for calling the Dedalus AI service. Sends prompts and receives structured JSON responses.

---

## Styling and Theming

### Where styles live
- **Global theme:** `src/app/globals.css` - CSS variables, Tailwind config, custom scrollbar, React Flow overrides
- **Component styles:** Inline Tailwind classes on JSX elements (no separate CSS files per component)

### Color system (defined in `globals.css`)
| Variable           | Hex       | Used for                    |
|--------------------|-----------|-----------------------------|
| `--bg-primary`     | `#0a0b10` | Page background             |
| `--bg-secondary`   | `#12131a` | Section backgrounds         |
| `--bg-card`        | `#1a1c25` | Card backgrounds            |
| `--bg-card-hover`  | `#22242e` | Card hover state            |
| `--border-color`   | `#2a2d3a` | Borders                     |
| `--text-primary`   | `#f0f0f5` | Main text                   |
| `--text-secondary` | `#9ca3af` | Muted text                  |
| `--accent-green`   | `#10b981` | Income, savings, positive   |
| `--accent-blue`    | `#6366f1` | Goals, housing              |
| `--accent-purple`  | `#8b5cf6` | Strategies                  |
| `--accent-pink`    | `#ec4899` | Entertainment               |
| `--accent-yellow`  | `#f59e0b` | Suggestions, transportation |
| `--accent-red`     | `#ef4444` | Warnings, health            |
| `--accent-teal`    | `#14b8a6` | Savings                     |

### To change the theme
1. Edit the CSS variables in `globals.css` under `:root`
2. The Tailwind theme in the `@theme inline` block references these variables
3. All components use Tailwind classes that map to these values

---

## Environment Variables (`.env.local`)

| Variable          | What it's for                                |
|-------------------|----------------------------------------------|
| `NESSIE_API_KEY`  | Capital One Nessie banking API key           |
| `DEDALUS_API_KEY` | AI service API key                           |
| `DEDALUS_API_URL` | AI service base URL                          |
| `NEXTAUTH_SECRET` | NextAuth.js session encryption secret        |
| `NEXTAUTH_URL`    | App URL for auth callbacks (e.g. `http://localhost:3000`) |

---

## Common Tasks

### Adding a new page
1. Create a folder under `src/app/` (e.g. `src/app/settings/`)
2. Add a `page.tsx` inside it
3. Add a nav link in `src/components/Sidebar.tsx`

### Adding a new chart/visualization
1. For Recharts-based charts: add directly in the page file (see `statistics/page.tsx` for examples)
2. For complex D3 or React Flow visuals: create a new component in `src/components/`
3. Import and use it in the relevant page

### Replacing mock data with real API data
1. In the page component, replace imports from `mock-data.ts` with `fetch()` calls to `/api/nessie` or `/api/ai`
2. Use the client functions in `src/lib/nessie.ts` or `src/lib/dedalus.ts`
3. Match the response shape to the types in `src/lib/types.ts` (or update the types)

### Changing the AI prompts
1. Open `src/app/api/ai/route.ts`
2. Edit the system prompts in the `budget-analysis` or `strategy` branches
3. The AI model and temperature are configured in `src/lib/dedalus.ts`

### Debugging API issues
1. Check `.env.local` for correct API keys
2. Test the API route directly: `curl http://localhost:3000/api/nessie?path=/customers`
3. Check the browser dev tools Network tab for request/response details
4. Add `console.log()` in the route handlers (`src/app/api/*/route.ts`) - they print to your terminal

---

## Tech Stack Summary

| Layer          | Technology                      |
|----------------|---------------------------------|
| Framework      | Next.js 16 (App Router)        |
| UI             | React 19 + TypeScript 5        |
| Styling        | Tailwind CSS 4                  |
| Charts         | Recharts 3                      |
| Sankey Diagram | D3 7 + d3-sankey                |
| Flow Graph     | @xyflow/react 12                |
| Icons          | lucide-react                    |
| HTTP Client    | axios + native fetch            |
| Auth           | next-auth 4 (partially set up) |
| Banking API    | Capital One Nessie              |
| AI API         | Dedalus (Claude Opus 4.6)       |
