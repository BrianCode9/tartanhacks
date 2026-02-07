# BudgetFlow

An AI-powered budget management and financial visualization app built for TartanHacks 2026.

BudgetFlow helps users understand their spending habits through interactive visualizations and receive AI-generated financial strategies tailored to their data.

## Features

- **Budget Dashboard** - Overview of income, spending, and savings with an interactive Sankey diagram showing how money flows through spending categories
- **Spending Analytics** - Monthly spending trends, category breakdowns, and top merchant analysis with interactive charts
- **AI Strategy Engine** - AI-generated financial strategies presented as an interactive workflow graph with actionable recommendations
- **Banking Integration** - Connects to Capital One's Nessie API for real banking data (accounts, transactions, merchants)
- **AI Financial Advisor** - Powered by Claude via the Dedalus API for intelligent budget analysis and strategy generation

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Visualizations:** D3.js (Sankey diagrams), Recharts (charts), React Flow (strategy graphs)
- **Backend:** Next.js API Routes (serverless)
- **APIs:** Capital One Nessie (banking data), Dedalus (AI analysis)
- **Auth:** NextAuth.js

## Getting Started

You need **Node.js 18+** and **npm** installed. That's it.

### 1. Clone the repo

```bash
git clone https://github.com/BrianCode9/tartanhacks.git
```

### 2. Navigate into the app directory

The Next.js app lives inside the `budget-flow/` folder, not the repo root.

```bash
cd tartanhacks/budget-flow
```

### 3. Install dependencies

```bash
npm install
```

### 4. Set up environment variables

Create a file called `.env.local` inside `budget-flow/`:

```env
NESSIE_API_KEY=your_nessie_api_key
DEDALUS_API_KEY=your_dedalus_api_key
DEDALUS_API_URL=https://api.dedaluslabs.ai/v1
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

- **Nessie API key** - Sign up at [http://api.nessieisreal.com](http://api.nessieisreal.com) to get one
- **Dedalus API key** - Required for AI features (budget analysis and strategy generation)
- **NextAuth secret** - Any random string (e.g. run `openssl rand -base64 32` to generate one)

> The app will still load without API keys — the dashboard, statistics, and strategy pages all work with built-in mock data. You only need the keys to use live banking data or AI features.

### 5. Start the dev server

```bash
npm run dev
```

### 6. Open the app

Go to [http://localhost:3000](http://localhost:3000) in your browser. You'll land on the dashboard automatically.

## Project Structure

```
budget-flow/src/
├── app/
│   ├── api/
│   │   ├── ai/route.ts           # AI proxy endpoint
│   │   └── nessie/route.ts       # Banking API proxy endpoint
│   ├── dashboard/page.tsx         # Budget overview + Sankey diagram
│   ├── statistics/page.tsx        # Spending analytics + charts
│   ├── strategy/page.tsx          # AI strategy workflow
│   ├── layout.tsx                 # Root layout with sidebar
│   ├── globals.css                # Theme and global styles
│   └── page.tsx                   # Home (redirects to dashboard)
├── components/
│   ├── Sidebar.tsx                # Navigation sidebar
│   ├── SankeyDiagram.tsx          # D3 money flow visualization
│   └── StrategyGraph.tsx          # React Flow strategy graph
└── lib/
    ├── types.ts                   # TypeScript type definitions
    ├── mock-data.ts               # Demo data for development
    ├── nessie.ts                  # Banking API client
    └── dedalus.ts                 # AI API client
```

For a detailed breakdown of every file and how to work with the codebase, see the [Developer Guide](DEVELOPER_GUIDE.md).

## Scripts

| Command          | Description                |
|------------------|----------------------------|
| `npm run dev`    | Start development server   |
| `npm run build`  | Build for production       |
| `npm run start`  | Start production server    |
| `npm run lint`   | Run ESLint                 |

## License

MIT License - see [LICENSE](LICENSE) for details.
