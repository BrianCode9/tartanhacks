# BudgetFlow Database Setup Guide

Quick setup instructions for collaborators to get the PostgreSQL database running locally.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL installed locally

---

## Step 1: Install PostgreSQL

### macOS (Homebrew)
```bash
brew install postgresql@16
brew services start postgresql@16
```

### Alternative: Docker
```bash
docker run --name budgetflow-postgres \
  -e POSTGRES_DB=budgetflow \
  -p 5432:5432 \
  -d postgres:16
```

---

## Step 2: Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create the database
CREATE DATABASE budgetflow;

# Exit
\q
```

---

## Step 3: Configure Environment

Create a `.env` file in the `budget-flow/` directory:

```bash
# Copy the example
cp .env.example .env
```

Then edit `.env` with your database connection:

```env
# For macOS Homebrew (replace YOUR_USERNAME with your system username)
DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/budgetflow"

# For Docker
# DATABASE_URL="postgresql://postgres@localhost:5432/budgetflow"

# AI API (optional for now)
DEDALUS_API_KEY=your_key_here
DEDALUS_API_URL=https://api.dedaluslabs.ai/v1

# NextAuth
NEXTAUTH_SECRET=any_random_string_here
NEXTAUTH_URL=http://localhost:3000
```

**To find your username:**
```bash
whoami
```

---

## Step 4: Install Dependencies

```bash
npm install
```

---

## Step 5: Run Database Migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

This creates all the database tables (users, accounts, transactions, merchants, sessions).

---

## Step 6: Seed Demo Data

```bash
npx prisma db seed
```

This creates:
- 5 demo users (all with password: `root`)
- 20 merchants
- 450 realistic transactions over 3 months

**Demo Accounts:**
- alex.johnson@gmail.com
- jordan.smith@gmail.com
- taylor.williams@gmail.com
- morgan.brown@gmail.com
- casey.davis@gmail.com

---

## Step 7: Start the App

```bash
npm run dev
```

Visit `http://localhost:3000` and log in with any demo account!

---

## Viewing the Database

### Prisma Studio (GUI)
```bash
npx prisma studio
```
Opens at `http://localhost:5555` - browse and edit data visually

### Command Line
```bash
psql budgetflow
\dt                    # List tables
SELECT * FROM users;   # View users
\q                     # Quit
```

---

## Troubleshooting

### "Environment variable not found: DATABASE_URL"
- Make sure you created the `.env` file in the `budget-flow/` directory
- Check that `DATABASE_URL` is set correctly

### "User was denied access on database"
- Update `DATABASE_URL` to use your system username (run `whoami` to find it)
- Remove password from connection string: `postgresql://username@localhost:5432/budgetflow`

### "Can't reach database server"
Check PostgreSQL is running:
```bash
# Homebrew
brew services list

# Docker
docker ps
```

### "Database doesn't exist"
```bash
psql postgres -c "CREATE DATABASE budgetflow;"
```

---

## Reset Database (if needed)

```bash
npx prisma migrate reset
```

This will drop all data and re-run migrations + seed script.
