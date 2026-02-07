# BudgetFlow

A beautiful, AI-powered budgeting application that visualizes your finances as an interactive mosaic. Built with Next.js, PostgreSQL, and Prisma.

## ✨ Features

- 🎨 **Interactive Financial Mosaic** - Visualize spending with dynamic Sankey flow diagrams
- 🤖 **AI-Powered Insights** - Get personalized budget recommendations
- 📊 **Category Tracking** - Organize spending into colorful, intuitive categories
- 🔐 **Secure Authentication** - bcrypt password hashing + NextAuth.js sessions
- 💾 **Local PostgreSQL** - All data stored securely in your local database

---

## 🚀 Quick Start for Collaborators

### 1. Clone & Install
```bash
git clone <repo-url>
cd budget-flow
npm install
```

### 2. Database Setup
See **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** for detailed instructions.

**Quick version:**
```bash
# Install PostgreSQL (macOS)
brew install postgresql@16
brew services start postgresql@16

# Create database
psql postgres -c "CREATE DATABASE budgetflow;"

# Configure environment
cp .env.example .env
# Edit .env and set your username in DATABASE_URL

# Run migrations & seed data
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 3. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` and log in with demo credentials:
- Email: `alex.johnson@gmail.com`
- Password: `root`

---

## 📁 Project Structure

```
budget-flow/
├── prisma/
│   ├── schema.prisma       # Database schema (5 tables)
│   └── seed.ts            # Demo data generator
├── src/
│   ├── app/
│   │   ├── api/           # REST API routes
│   │   │   ├── auth/      # Login & registration
│   │   │   ├── transactions/
│   │   │   ├── accounts/
│   │   │   └── merchants/
│   │   ├── dashboard/     # Main app dashboard
│   │   └── page.tsx       # Landing page
│   └── lib/
│       ├── prisma.ts      # Database client
│       ├── auth.ts        # Password hashing
│       └── use-budget-data.ts  # Data fetching hook
└── DATABASE_SETUP.md      # Setup guide for team
```

---

## 🗄️ Database Schema

- **users** - User accounts with hashed passwords
- **accounts** - Bank accounts (checking, savings)
- **merchants** - Stores & vendors (categorized)
- **transactions** - Purchase history with dates & amounts
- **sessions** - NextAuth.js session management

View the database visually:
```bash
npx prisma studio
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js + bcryptjs
- **Styling:** Tailwind CSS 4
- **Visualization:** Nivo, D3.js, Recharts
- **AI:** Dedalus API integration

---

## 🧪 Demo Data

The seed script creates:
- 5 users with realistic spending patterns
- 20 common merchants (groceries, gas, streaming services, etc.)
- 450 transactions spanning 3 months
- Recurring bills (rent, utilities) + variable expenses

All demo accounts use password: `root`

---

## 📝 Environment Variables

Required in `.env`:
```env
DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/budgetflow"
NEXTAUTH_SECRET="your_random_secret"
NEXTAUTH_URL="http://localhost:3000"
```

Optional (for AI features):
```env
DEDALUS_API_KEY="your_api_key"
DEDALUS_API_URL="https://api.dedaluslabs.ai/v1"
```

---

## 🙏 Credits

Built with 💜 at **TartanHacks 2026** - Carnegie Mellon University

---

## 📄 License

MIT License - see LICENSE for details
