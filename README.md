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

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/tartanhacks.git
cd tartanhacks/budget-flow

# Install dependencies
npm install
```

### Environment Setup

Create a `.env.local` file in the `budget-flow/` directory:

```env
NESSIE_API_KEY=your_nessie_api_key
DEDALUS_API_KEY=your_dedalus_api_key
DEDALUS_API_URL=https://api.dedaluslabs.ai/v1
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

You can get a Nessie API key at [http://api.nessieisreal.com](http://api.nessieisreal.com).

### Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

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
