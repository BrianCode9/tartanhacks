import { BudgetSankeyData, SpendingCategory, MonthlySpending, MerchantSpending } from "./types";

export const mockCategories: SpendingCategory[] = [
  {
    name: "Housing",
    amount: 1800,
    color: "#6366f1",
    subcategories: [
      { name: "Rent", amount: 1500 },
      { name: "Utilities", amount: 200 },
      { name: "Internet", amount: 100 },
    ],
  },
  {
    name: "Food & Dining",
    amount: 850,
    color: "#10b981",
    subcategories: [
      { name: "Groceries", amount: 450 },
      { name: "Restaurants", amount: 280 },
      { name: "Coffee", amount: 120 },
    ],
  },
  {
    name: "Transportation",
    amount: 420,
    color: "#f59e0b",
    subcategories: [
      { name: "Gas", amount: 180 },
      { name: "Car Insurance", amount: 150 },
      { name: "Parking", amount: 90 },
    ],
  },
  {
    name: "Entertainment",
    amount: 350,
    color: "#ec4899",
    subcategories: [
      { name: "Streaming", amount: 45 },
      { name: "Games", amount: 60 },
      { name: "Events", amount: 150 },
      { name: "Hobbies", amount: 95 },
    ],
  },
  {
    name: "Shopping",
    amount: 520,
    color: "#8b5cf6",
    subcategories: [
      { name: "Clothing", amount: 250 },
      { name: "Electronics", amount: 180 },
      { name: "Home Goods", amount: 90 },
    ],
  },
  {
    name: "Health",
    amount: 280,
    color: "#ef4444",
    subcategories: [
      { name: "Insurance", amount: 150 },
      { name: "Pharmacy", amount: 80 },
      { name: "Gym", amount: 50 },
    ],
  },
  {
    name: "Savings",
    amount: 780,
    color: "#14b8a6",
    subcategories: [
      { name: "Emergency Fund", amount: 400 },
      { name: "Investments", amount: 280 },
      { name: "Vacation Fund", amount: 100 },
    ],
  },
];

export const mockIncome = 5000;

export function buildSankeyData(income: number, categories: SpendingCategory[]): BudgetSankeyData {
  // The Sankey layout is driven by link values, so we explicitly include income
  // as a source, route spending through an "Expenses" hub, and show either
  // "Unallocated" (income > spending) or "Debt / Shortfall" (spending > income).
  const nodes: { name: string }[] = [];
  const links: { source: number; target: number; value: number }[] = [];

  const totalSpending = categories.reduce((sum, cat) => sum + cat.amount, 0);

  const incomeIndex = nodes.length;
  nodes.push({ name: "Income" });

  const expensesIndex = nodes.length;
  nodes.push({ name: "Expenses" });

  // Income funds expenses up to the smaller of the two.
  links.push({
    source: incomeIndex,
    target: expensesIndex,
    value: Math.max(0, Math.min(income, totalSpending)),
  });

  if (income > totalSpending) {
    const unallocatedIndex = nodes.length;
    nodes.push({ name: "Unallocated" });
    links.push({
      source: incomeIndex,
      target: unallocatedIndex,
      value: income - totalSpending,
    });
  } else if (totalSpending > income) {
    const shortfallIndex = nodes.length;
    nodes.push({ name: "Debt / Shortfall" });
    links.push({
      source: shortfallIndex,
      target: expensesIndex,
      value: totalSpending - income,
    });
  }

  // Add category nodes
  categories.forEach((cat) => {
    const catIndex = nodes.length;
    nodes.push({ name: cat.name });
    links.push({ source: expensesIndex, target: catIndex, value: cat.amount });

    // Add subcategory nodes
    cat.subcategories.forEach((sub) => {
      const subIndex = nodes.length;
      nodes.push({ name: sub.name });
      links.push({ source: catIndex, target: subIndex, value: sub.amount });
    });
  });

  return { nodes, links };
}

export const mockMonthlySpending: MonthlySpending[] = [
  { month: "Aug", amount: 4100 },
  { month: "Sep", amount: 4350 },
  { month: "Oct", amount: 3900 },
  { month: "Nov", amount: 4600 },
  { month: "Dec", amount: 5200 },
  { month: "Jan", amount: 4220 },
];

export const mockMerchants: MerchantSpending[] = [
  { name: "Whole Foods", amount: 320, category: "Groceries", visits: 8 },
  { name: "Amazon", amount: 280, category: "Shopping", visits: 12 },
  { name: "Shell Gas", amount: 180, category: "Gas", visits: 6 },
  { name: "Spotify", amount: 15, category: "Streaming", visits: 1 },
  { name: "Netflix", amount: 18, category: "Streaming", visits: 1 },
  { name: "Chipotle", amount: 96, category: "Restaurants", visits: 8 },
  { name: "Target", amount: 210, category: "Shopping", visits: 4 },
  { name: "Starbucks", amount: 120, category: "Coffee", visits: 20 },
  { name: "CVS Pharmacy", amount: 80, category: "Pharmacy", visits: 3 },
  { name: "Planet Fitness", amount: 50, category: "Gym", visits: 1 },
];

export const mockStrategyNodes = [
  {
    id: "income",
    type: "income" as const,
    label: "Monthly Income",
    description: "Total monthly take-home pay",
    amount: 5000,
  },
  {
    id: "essentials",
    type: "goal" as const,
    label: "Essential Expenses",
    description: "Housing, utilities, insurance — keep under 50% of income",
    amount: 2500,
  },
  {
    id: "wants",
    type: "goal" as const,
    label: "Wants & Lifestyle",
    description: "Dining, entertainment, shopping — target 30% of income",
    amount: 1500,
  },
  {
    id: "savings",
    type: "goal" as const,
    label: "Savings & Debt",
    description: "Emergency fund, investments, debt payoff — aim for 20%",
    amount: 1000,
  },
  {
    id: "reduce-dining",
    type: "strategy" as const,
    label: "Reduce Dining Out",
    description: "You spent $280 on restaurants. Try meal prepping to save ~$150/month",
    amount: 150,
  },
  {
    id: "coffee-savings",
    type: "suggestion" as const,
    label: "Cut Coffee Spending",
    description: "20 Starbucks visits/month. Brewing at home saves ~$90/month",
    amount: 90,
  },
  {
    id: "emergency-fund",
    type: "strategy" as const,
    label: "Build Emergency Fund",
    description: "Redirect dining savings to reach 3-month emergency fund by June",
    amount: 400,
  },
  {
    id: "high-spending-alert",
    type: "warning" as const,
    label: "December Overspend",
    description: "Last month exceeded budget by $200. Holiday spending spike detected.",
    amount: -200,
  },
  {
    id: "invest",
    type: "suggestion" as const,
    label: "Start Index Fund",
    description: "With $280/month in savings, consider low-cost index fund investing",
    amount: 280,
  },
  {
    id: "subscription-audit",
    type: "strategy" as const,
    label: "Audit Subscriptions",
    description: "Review $63/month in streaming. Cancel unused services.",
    amount: 30,
  },
];

export const mockStrategyEdges = [
  { source: "income", target: "essentials", label: "50% rule" },
  { source: "income", target: "wants", label: "30% rule" },
  { source: "income", target: "savings", label: "20% rule" },
  { source: "wants", target: "reduce-dining", label: "optimization" },
  { source: "wants", target: "coffee-savings", label: "quick win" },
  { source: "reduce-dining", target: "emergency-fund", label: "redirect savings" },
  { source: "coffee-savings", target: "emergency-fund", label: "redirect savings" },
  { source: "savings", target: "emergency-fund", label: "priority" },
  { source: "savings", target: "invest", label: "growth" },
  { source: "essentials", target: "subscription-audit", label: "review" },
  { source: "high-spending-alert", target: "reduce-dining", label: "action needed" },
];
