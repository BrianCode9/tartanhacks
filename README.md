# BudgetFlow

BudgetFlow is a budget management and financial visualization app built for TartanHacks 2026.

The Next.js app lives in `budget-flow/`.

## Features

- Budget Flow dashboard with editable income, categories, and a live-updating Sankey diagram
- Spending analytics (trends, donut chart, merchants)
- Budget planner (calendar heatmap + planned events)
- Strategy page (interactive graph of money-saving strategies)
- Debt payoff planner
- Optional integrations: Capital One Nessie (banking data) and Dedalus (AI)

## Getting Started

Prereqs: Node.js 18+

```bash
cd budget-flow
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables (Optional)

Create `budget-flow/.env.local`:

```env
NESSIE_API_KEY=your_nessie_api_key
DEDALUS_API_KEY=your_dedalus_api_key
DEDALUS_API_URL=https://api.dedaluslabs.ai/v1
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

The UI still works without these keys using built-in mock data.

## Seed Nessie Data (Optional)

With the dev server running:

```bash
curl -X POST http://localhost:3000/api/seed
```

To fetch the generated credentials list:

```bash
curl http://localhost:3000/api/seed
```

## Project Structure (Highlights)

```text
budget-flow/
  src/
    app/
      (app)/
        dashboard/page.tsx
        planner/page.tsx
        statistics/page.tsx
        strategy/page.tsx
        debt-payoff/page.tsx
      api/
        ai/route.ts
        nessie/route.ts
        seed/route.ts
    components/
      CategoryCard.tsx
      SankeyDiagram.tsx
      StrategyGraph.tsx
      DebtGraph.tsx
    lib/
      mock-data.ts
      types.ts
      use-budget-data.ts
      use-strategy-data.ts
```

For deeper pointers, see `DEVELOPER_GUIDE.md`.

