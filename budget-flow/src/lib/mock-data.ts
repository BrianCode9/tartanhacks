import { BudgetSankeyData, SpendingCategory, MonthlySpending, MerchantSpending, DailySpending, PlannedEvent, Debt, DebtUserProfile, DebtStrategy, DebtPayoffResult, DebtPayoffScheduleItem } from "./types";

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
  const nodes: { name: string; color?: string }[] = [];
  const links: { source: number; target: number; value: number }[] = [];

  const totalSpending = categories.reduce((sum, cat) => sum + cat.amount, 0);

  const incomeIndex = nodes.length;
  nodes.push({ name: "Income", color: "#22c55e" });

  const expensesIndex = nodes.length;
  nodes.push({ name: "Expenses", color: "#94a3b8" });

  // Income funds expenses up to the smaller of the two.
  links.push({
    source: incomeIndex,
    target: expensesIndex,
    value: Math.max(0, Math.min(income, totalSpending)),
  });

  if (income > totalSpending) {
    const unallocatedIndex = nodes.length;
    nodes.push({ name: "Unallocated", color: "#06b6d4" });
    links.push({
      source: incomeIndex,
      target: unallocatedIndex,
      value: income - totalSpending,
    });
  } else if (totalSpending > income) {
    const shortfallIndex = nodes.length;
    nodes.push({ name: "Debt / Shortfall", color: "#ef4444" });
    links.push({
      source: shortfallIndex,
      target: expensesIndex,
      value: totalSpending - income,
    });
  }

  // Add category nodes
  categories.forEach((cat) => {
    const catIndex = nodes.length;
    nodes.push({ name: cat.name, color: cat.color });
    links.push({ source: expensesIndex, target: catIndex, value: cat.amount });

    // Add subcategory nodes
    cat.subcategories.forEach((sub) => {
      const subIndex = nodes.length;
      nodes.push({ name: sub.name, color: cat.color });
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

// Budget plan targets (what the user planned to spend per category)
export const mockBudgetPlan: { name: string; budgeted: number }[] = [
  { name: "Housing", budgeted: 1800 },
  { name: "Food & Dining", budgeted: 700 },
  { name: "Transportation", budgeted: 400 },
  { name: "Entertainment", budgeted: 250 },
  { name: "Shopping", budgeted: 400 },
  { name: "Health", budgeted: 300 },
  { name: "Savings", budgeted: 1000 },
];

/**
 * Build a Sankey diagram showing budget vs actual variance.
 *
 * Layout:
 *   Budget Plan ─┬→ [Categories] ─→ Spent as Planned
 *   Overspending ┘                ─→ Over Budget
 *                                 ─→ Under Budget (Saved)
 *
 * Each category receives its budgeted amount from "Budget Plan". If actual
 * spending exceeded the budget, the extra flows in from "Overspending" and
 * out to "Over Budget". If actual was less, the difference flows to
 * "Under Budget (Saved)".
 */
export function buildBudgetVsActualSankeyData(
  budgetPlan: { name: string; budgeted: number }[],
  actual: SpendingCategory[]
): BudgetSankeyData {
  const nodes: { name: string; color?: string }[] = [];
  const links: { source: number; target: number; value: number }[] = [];

  // Source nodes
  const budgetIndex = nodes.length;
  nodes.push({ name: "Budget Plan", color: "#6366f1" });

  // Outcome nodes
  const spentIndex = nodes.length;
  nodes.push({ name: "Spent as Planned", color: "#94a3b8" });

  const underBudgetIndex = nodes.length;
  nodes.push({ name: "Under Budget (Saved)", color: "#22c55e" });

  const overBudgetIndex = nodes.length;
  nodes.push({ name: "Over Budget", color: "#ef4444" });

  let totalOver = 0;

  // First pass: calculate total overspend so we can add the source node
  budgetPlan.forEach((plan) => {
    const actualCat = actual.find(
      (c) => c.name.toLowerCase() === plan.name.toLowerCase()
    );
    const actualAmount = actualCat ? actualCat.amount : 0;
    if (actualAmount > plan.budgeted) {
      totalOver += actualAmount - plan.budgeted;
    }
  });

  // Add overspending source if needed
  let overspendIndex = -1;
  if (totalOver > 0) {
    overspendIndex = nodes.length;
    nodes.push({ name: "Overspending", color: "#ef4444" });
  }

  // Second pass: build links
  budgetPlan.forEach((plan) => {
    const actualCat = actual.find(
      (c) => c.name.toLowerCase() === plan.name.toLowerCase()
    );
    const actualAmount = actualCat ? actualCat.amount : 0;
    const budgeted = plan.budgeted;
    const diff = actualAmount - budgeted;

    const catIndex = nodes.length;
    nodes.push({ name: plan.name, color: actualCat?.color || "#64748b" });

    // Budget Plan → Category (always the budgeted amount)
    links.push({ source: budgetIndex, target: catIndex, value: budgeted });

    if (diff > 0) {
      // Over budget: extra money flows in from Overspending source
      links.push({ source: overspendIndex, target: catIndex, value: diff });
      // Category → Spent as Planned (budgeted portion)
      links.push({ source: catIndex, target: spentIndex, value: budgeted });
      // Category → Over Budget (excess)
      links.push({ source: catIndex, target: overBudgetIndex, value: diff });
    } else if (diff < 0) {
      // Under budget: what was spent + what was saved
      const spent = actualAmount;
      const saved = Math.abs(diff);
      if (spent > 0) {
        links.push({ source: catIndex, target: spentIndex, value: spent });
      }
      links.push({ source: catIndex, target: underBudgetIndex, value: saved });
    } else {
      // Exactly on budget
      links.push({ source: catIndex, target: spentIndex, value: budgeted });
    }
  });

  return { nodes, links };
}

// Format date to YYYY-MM-DD string (local time)
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Generate mock daily spending for the past 365 days (to cover 12 months shown in heatmap)
export function generateDailySpending(): DailySpending[] {
  const data: DailySpending[] = [];
  const today = new Date();
  
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = formatLocalDate(date);
    const dayOfWeek = date.getDay();
    
    // Simulate realistic spending patterns
    let baseAmount = 50 + Math.floor(Math.random() * 80);
    
    // Weekends tend to have higher spending
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      baseAmount += 30 + Math.floor(Math.random() * 50);
    }
    
    // First of month (rent/bills spike)
    if (date.getDate() === 1) {
      baseAmount = 1500 + Math.floor(Math.random() * 300);
    }
    
    // 15th (mid-month bills)
    if (date.getDate() === 15) {
      baseAmount += 200 + Math.floor(Math.random() * 100);
    }
    
    // Some random low-spending days
    if (Math.random() < 0.15) {
      baseAmount = Math.floor(Math.random() * 20);
    }
    
    // Some random high-spending days (events, shopping)
    if (Math.random() < 0.08) {
      baseAmount += 150 + Math.floor(Math.random() * 200);
    }
    
    const transactions = baseAmount > 200 ? 3 + Math.floor(Math.random() * 5) : 1 + Math.floor(Math.random() * 3);
    
    data.push({
      date: dateStr,
      amount: baseAmount,
      transactions,
    });
  }
  
  return data;
}

export const mockPlannedEvents: PlannedEvent[] = [
  {
    id: "1",
    name: "Spring Break Trip",
    date: "2026-03-15",
    estimatedCost: 1200,
    category: "vacation",
    notes: "Flight + hotel for 4 nights in Miami",
  },
  {
    id: "2",
    name: "New Laptop",
    date: "2026-02-28",
    estimatedCost: 1500,
    category: "purchase",
    notes: "MacBook Pro for work",
  },
  {
    id: "3",
    name: "Concert Tickets",
    date: "2026-04-10",
    estimatedCost: 250,
    category: "event",
    notes: "Taylor Swift Eras Tour",
  },
];

export function calculateDailyBudget(
  monthlyIncome: number,
  monthlyFixedExpenses: number,
  plannedEvents: PlannedEvent[],
  daysUntilEndOfMonth: number
): { dailyBudget: number; adjustedForEvents: number; eventsCost: number } {
  const availableBudget = monthlyIncome - monthlyFixedExpenses;
  const baseDailyBudget = availableBudget / 30;
  
  // Calculate upcoming events within the month
  const today = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const upcomingEventsCost = plannedEvents
    .filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate <= endOfMonth;
    })
    .reduce((sum, event) => sum + event.estimatedCost, 0);
  
  const adjustedBudget = (availableBudget - upcomingEventsCost) / Math.max(daysUntilEndOfMonth, 1);
  
  return {
    dailyBudget: baseDailyBudget,
    adjustedForEvents: Math.max(adjustedBudget, 0),
    eventsCost: upcomingEventsCost,
  };
}

// ─── Debt Payoff Data & Calculations ────────────────────────────────────────

export const mockDebts: Debt[] = [
  { id: "cc-a", name: "Credit Card A", balance: 4200, interestRate: 24.99, minimumPayment: 105, type: "credit-card" },
  { id: "cc-b", name: "Credit Card B", balance: 1800, interestRate: 19.99, minimumPayment: 55, type: "credit-card" },
  { id: "student", name: "Student Loan", balance: 28000, interestRate: 5.5, minimumPayment: 300, type: "student-loan" },
  { id: "car", name: "Car Loan", balance: 12500, interestRate: 6.9, minimumPayment: 280, type: "car-loan" },
  { id: "medical", name: "Medical Bill", balance: 3200, interestRate: 0, minimumPayment: 150, type: "medical" },
  { id: "personal", name: "Personal Loan", balance: 8000, interestRate: 11.5, minimumPayment: 200, type: "personal-loan" },
];

export const mockDebtProfile: DebtUserProfile = {
  extraMonthlyPayment: 500,
  impulsivityScore: 65,
};

export function calculateDebtPayoff(
  debts: Debt[],
  extraPayment: number,
  strategy: DebtStrategy,
  customOrder?: string[]
): DebtPayoffResult {
  // Sort debts by strategy
  let sorted: Debt[];
  if (strategy === "custom" && customOrder) {
    const idToDebt = new Map(debts.map((d) => [d.id, d]));
    sorted = customOrder.map((id) => idToDebt.get(id)!).filter(Boolean);
    // Append any debts missing from custom order
    const inOrder = new Set(customOrder);
    for (const d of debts) {
      if (!inOrder.has(d.id)) sorted.push(d);
    }
  } else if (strategy === "hybrid") {
    // Hybrid: high-interest debts first (>=15%), then smallest balance among the rest
    const highInterest = [...debts].filter((d) => d.interestRate >= 15).sort((a, b) => b.interestRate - a.interestRate);
    const rest = [...debts].filter((d) => d.interestRate < 15).sort((a, b) => a.balance - b.balance);
    sorted = [...highInterest, ...rest];
  } else if (strategy === "snowball") {
    sorted = [...debts].sort((a, b) => a.balance - b.balance);
  } else {
    sorted = [...debts].sort((a, b) => b.interestRate - a.interestRate);
  }

  const order = sorted.map((d) => d.id);

  // Track remaining balances and interest paid per debt
  const balances = new Map<string, number>();
  const interestPaid = new Map<string, number>();
  const payoffMonth = new Map<string, number>();
  const paidOff = new Set<string>();

  for (const d of debts) {
    balances.set(d.id, d.balance);
    interestPaid.set(d.id, 0);
  }

  const debtMap = new Map(debts.map((d) => [d.id, d]));
  let month = 0;
  const MAX_MONTHS = 600; // 50 year safety cap

  while (paidOff.size < debts.length && month < MAX_MONTHS) {
    month++;
    let extraRemaining = extraPayment;

    // Apply monthly interest to all unpaid debts
    for (const d of debts) {
      if (paidOff.has(d.id)) continue;
      const bal = balances.get(d.id)!;
      const monthlyRate = d.interestRate / 100 / 12;
      const interest = bal * monthlyRate;
      interestPaid.set(d.id, interestPaid.get(d.id)! + interest);
      balances.set(d.id, bal + interest);
    }

    // Apply minimum payments
    for (const d of debts) {
      if (paidOff.has(d.id)) continue;
      const bal = balances.get(d.id)!;
      const payment = Math.min(d.minimumPayment, bal);
      balances.set(d.id, bal - payment);
      if (balances.get(d.id)! <= 0.01) {
        balances.set(d.id, 0);
        paidOff.add(d.id);
        payoffMonth.set(d.id, month);
        // Roll this debt's minimum into extra pool
        extraRemaining += d.minimumPayment - payment;
      }
    }

    // Apply extra payment to target debt(s) in strategy order
    for (const id of order) {
      if (paidOff.has(id) || extraRemaining <= 0) continue;
      const bal = balances.get(id)!;
      const payment = Math.min(extraRemaining, bal);
      balances.set(id, bal - payment);
      extraRemaining -= payment;
      if (balances.get(id)! <= 0.01) {
        balances.set(id, 0);
        paidOff.add(id);
        payoffMonth.set(id, month);
        // Roll freed minimum into extra
        const debt = debtMap.get(id)!;
        extraRemaining += debt.minimumPayment;
      }
    }
  }

  // Build schedule
  const today = new Date();
  let cumulativePayment = 0;
  const totalMinPayments = debts.reduce((s, d) => s + d.minimumPayment, 0);
  const totalMonthly = totalMinPayments + extraPayment;

  const schedule: DebtPayoffScheduleItem[] = order.map((id) => {
    const debt = debtMap.get(id)!;
    const months = payoffMonth.get(id) ?? MAX_MONTHS;
    const interest = Math.round(interestPaid.get(id)! * 100) / 100;
    const payoffDate = new Date(today);
    payoffDate.setMonth(payoffDate.getMonth() + months);
    const payoffDateStr = payoffDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });

    // Monthly payment for this debt = min + share of extra (simplified for display)
    const monthlyPayment = debt.minimumPayment;
    cumulativePayment += debt.balance + interest;

    return {
      debtId: id,
      monthsToPayoff: months,
      totalInterestPaid: interest,
      payoffDate: payoffDateStr,
      monthlyPayment,
      cumulativePayment: Math.round(cumulativePayment * 100) / 100,
    };
  });

  const totalInterestPaid = schedule.reduce((s, item) => s + item.totalInterestPaid, 0);
  const totalBalance = debts.reduce((s, d) => s + d.balance, 0);
  const totalMonthsToDebtFree = Math.max(...schedule.map((s) => s.monthsToPayoff));

  return {
    strategy,
    order,
    schedule,
    totalInterestPaid: Math.round(totalInterestPaid * 100) / 100,
    totalMonthsToDebtFree,
    totalAmountPaid: Math.round((totalBalance + totalInterestPaid) * 100) / 100,
  };
}

export function getDebtRiskColor(interestRate: number): "red" | "yellow" | "green" {
  if (interestRate >= 15) return "red";
  if (interestRate >= 7) return "yellow";
  return "green";
}

export function getDebtRecommendation(
  impulsivity: number,
  snowballResult: DebtPayoffResult,
  avalancheResult: DebtPayoffResult,
  hybridResult?: DebtPayoffResult
): { recommended: DebtStrategy; title: string; explanation: string; savingsDifference: number } {
  const results = [
    { strategy: "snowball" as DebtStrategy, result: snowballResult },
    { strategy: "avalanche" as DebtStrategy, result: avalancheResult },
  ];
  if (hybridResult) {
    results.push({ strategy: "hybrid" as DebtStrategy, result: hybridResult });
  }

  const savingsDiff = Math.abs(snowballResult.totalInterestPaid - avalancheResult.totalInterestPaid);

  // If hybrid exists and balances psychology + savings well, recommend it for mid-range impulsivity
  if (hybridResult && impulsivity >= 40 && impulsivity <= 70) {
    const hybridSavings = snowballResult.totalInterestPaid - hybridResult.totalInterestPaid;
    return {
      recommended: "hybrid",
      title: "Hybrid Method Recommended",
      explanation: `With an impulsivity score of ${impulsivity}/100, the Hybrid method is your best fit. It attacks high-interest debt first to save you money, then switches to smallest-balance for motivational wins. You'll save $${Math.max(0, hybridSavings).toLocaleString(undefined, { maximumFractionDigits: 0 })} compared to pure Snowball while still getting quick payoff momentum.`,
      savingsDifference: savingsDiff,
    };
  }

  const recommended: DebtStrategy = impulsivity > 60 ? "snowball" : "avalanche";

  if (recommended === "snowball") {
    return {
      recommended,
      title: "Snowball Method Recommended",
      explanation: `With an impulsivity score of ${impulsivity}/100, you'll benefit from the motivational wins of paying off smaller debts first. While you'll pay $${savingsDiff.toLocaleString(undefined, { maximumFractionDigits: 0 })} more in interest, the psychological momentum will help you stay on track.`,
      savingsDifference: savingsDiff,
    };
  }

  return {
    recommended,
    title: "Avalanche Method Recommended",
    explanation: `With an impulsivity score of ${impulsivity}/100, you have the discipline to tackle high-interest debt first. The Avalanche method will save you $${savingsDiff.toLocaleString(undefined, { maximumFractionDigits: 0 })} in interest over the life of your debts.`,
    savingsDifference: savingsDiff,
  };
}
