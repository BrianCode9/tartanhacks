"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { useBudgetData } from "@/lib/use-budget-data";
import { useUser } from "@/lib/user-context";
import { buildBudgetVsActualSankeyData, mockBudgetPlan, mockTransactions } from "@/lib/mock-data";
import SankeyDiagram from "@/components/SankeyDiagram";
import AIInsights, { preloadAIInsights } from "@/components/AIInsights";
import {
  TrendingUp,
  ShoppingCart,
  Calendar,
  CreditCard,
  Loader2,
  Database,
  GitCompareArrows,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X,
  Brain,
  Tag,
} from "lucide-react";

const RADIAN = Math.PI / 180;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomPieLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="#9ca3af"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize="12"
    >
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  );
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-card border border-border-main rounded-lg p-3 shadow-xl">
      <p className="text-text-primary font-medium mb-1">{label}</p>
      {payload.map((item, i) => (
        <p key={i} className="text-sm" style={{ color: item.color }}>
          {item.name}: ${item.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function StatisticsPage() {
  const { user } = useUser();
  const { categories, income, monthlySpending, merchants, isLoading, isUsingMockData } = useBudgetData(user?.id);
  const [budgets, setBudgets] = useState<{ id: string; category: string; budgeted: number }[]>([]);
  const [budgetsLoading, setBudgetsLoading] = useState(true);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showAISidebar, setShowAISidebar] = useState(false);
  const [aiPreloaded, setAiPreloaded] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [aiBudgetPlan, setAiBudgetPlan] = useState<{ name: string; budgeted: number }[]>([]);
  const [aiBudgetLoading, setAiBudgetLoading] = useState(true);

  // Collapsible states
  const [showRecurring, setShowRecurring] = useState(false);
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const [showDayToDay, setShowDayToDay] = useState(false);

  // Fetch real transactions
  useEffect(() => {
    if (!user?.id) return;

    setTransactionsLoading(true);
    fetch(`/api/transactions?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data);
        setTransactionsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch transactions:", err);
        setTransactionsLoading(false);
      });
  }, [user?.id]);

  // Preload AI insights in background when page loads
  useEffect(() => {
    if (!aiPreloaded && !isLoading && transactions.length > 0) {
      setAiPreloaded(true);
      const recurringExpenses = transactions.filter((t) => t.type === 'recurring' || t.type === 'subscription');
      preloadAIInsights(
        transactions.map((t) => ({ merchant: t.merchant?.name || t.description || 'Unknown', amount: t.amount, category: t.merchant?.category || 'Uncategorized', date: t.transactionDate })),
        recurringExpenses.map((e) => ({ merchant: e.merchant?.name || e.description || 'Unknown', amount: e.amount, category: e.merchant?.category || 'Uncategorized' })),
        transactions.reduce((sum, t) => sum + t.amount, 0),
        income
      );
    }
  }, [isLoading, aiPreloaded, income, transactions]);

  // Fetch AI budget flow
  useEffect(() => {
    if (!user?.id) return;

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    setAiBudgetLoading(true);
    fetch(`/api/budget-flow?userId=${user.id}&month=${month}&year=${year}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.nodes) {
          const categoryNodes = data.nodes.filter((n: any) => n.type === "category");
          const plan = categoryNodes.map((n: any) => ({
            name: n.name,
            budgeted: parseFloat(n.amount),
          }));
          setAiBudgetPlan(plan);
        }
        setAiBudgetLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch AI budget flow:", err);
        setAiBudgetLoading(false);
      });
  }, [user?.id]);

  // Fetch user budgets
  useEffect(() => {
    if (!user?.id) return;

    setBudgetsLoading(true);
    fetch(`/api/budgets?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setBudgets(data);
        setBudgetsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch budgets:', err);
        setBudgetsLoading(false);
      });
  }, [user?.id]);

  // Convert budgets to budget plan format
  const budgetPlan = budgets.length > 0 ? budgets.map(b => ({
    name: b.category,
    budgeted: b.budgeted
  })) : [];

  // AI Budget vs Actual derived values
  const aiBudgetVsActualSankey =
    categories.length > 0 && aiBudgetPlan.length > 0
      ? buildBudgetVsActualSankeyData(aiBudgetPlan, categories)
      : null;

  const aiBudgetVariance = aiBudgetPlan.map((plan) => {
    const actual = categories.find((c) => c.name.toLowerCase() === plan.name.toLowerCase());
    const actualAmount = actual ? actual.amount : 0;
    return {
      name: plan.name,
      budgeted: plan.budgeted,
      actual: actualAmount,
      diff: actualAmount - plan.budgeted,
    };
  });

  const aiTotalBudgeted = aiBudgetPlan.reduce((s, p) => s + p.budgeted, 0);
  const aiTotalOverBudget = aiBudgetVariance.filter((v) => v.diff > 0).reduce((s, v) => s + v.diff, 0);
  const aiTotalUnderBudget = aiBudgetVariance.filter((v) => v.diff < 0).reduce((s, v) => s + Math.abs(v.diff), 0);

  // Avoid hook-order issues by keeping these as plain derived values.
  const budgetVsActualSankey =
    categories.length > 0 && budgetPlan.length > 0
      ? buildBudgetVsActualSankeyData(budgetPlan, categories)
      : null;

  const budgetVariance = budgetPlan.map((plan) => {
    const actual = categories.find((c) => c.name.toLowerCase() === plan.name.toLowerCase());
    const actualAmount = actual ? actual.amount : 0;
    return {
      name: plan.name,
      budgeted: plan.budgeted,
      actual: actualAmount,
      diff: actualAmount - plan.budgeted,
    };
  });

  if (isLoading || budgetsLoading || transactionsLoading || aiBudgetLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-accent-blue animate-spin" />
          <p className="text-text-secondary">Loading statistics...</p>
        </div>
      </div>
    );
  }

  const totalSpending = categories.reduce(
    (sum, cat) => sum + cat.amount,
    0
  );
  const avgMonthly =
    monthlySpending.length > 0
      ? monthlySpending.reduce((sum, m) => sum + m.amount, 0) / monthlySpending.length
      : totalSpending;
  const sortedMerchants = [...merchants].sort((a, b) => b.amount - a.amount);
  const topMerchant = sortedMerchants[0];
  const totalTransactions = merchants.reduce(
    (sum, m) => sum + m.visits,
    0
  );

  const totalBudgeted = budgetPlan.reduce((s, p) => s + p.budgeted, 0);
  const totalOverBudget = budgetVariance.filter((v) => v.diff > 0).reduce((s, v) => s + v.diff, 0);
  const totalUnderBudget = budgetVariance.filter((v) => v.diff < 0).reduce((s, v) => s + Math.abs(v.diff), 0);

  const pieData = categories.map((cat) => ({
    name: cat.name,
    value: cat.amount,
    color: cat.color,
  }));

  const merchantBarData = sortedMerchants.slice(0, 8);

  // Categorize transactions
  const recurringTrans = transactions.filter(t => t.type === 'recurring');
  const subscriptionTrans = transactions.filter(t => t.type === 'subscription');
  const dayToDayTrans = transactions.filter(t => t.type === 'day-to-day' || !t.type);

  const totalRecurring = recurringTrans.reduce((sum, t) => sum + t.amount, 0);
  const totalSubscriptions = subscriptionTrans.reduce((sum, t) => sum + t.amount, 0);
  const totalDayToDay = dayToDayTrans.reduce((sum, t) => sum + t.amount, 0);

  // Group transactions by merchant for Recurring/Subscriptions
  const groupTransactionsByMerchant = (txs: any[]) => {
    const groups: { [key: string]: { merchant: string; category: string; amount: number; totalSpent: number; history: any[] } } = {};

    txs.forEach(tx => {
      const key = tx.merchantId || tx.merchant?.name || tx.description;
      if (!groups[key]) {
        groups[key] = {
          merchant: tx.merchant?.name || tx.description,
          category: tx.merchant?.category || 'Uncategorized',
          amount: tx.amount, // Will update to most recent
          totalSpent: 0,
          history: []
        };
      }
      groups[key].history.push(tx);
      groups[key].totalSpent += tx.amount;
    });

    // Sort history by date desc
    Object.values(groups).forEach(group => {
      group.history.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
      group.amount = group.history[0].amount; // Use most recent amount
    });

    return Object.values(groups);
  };

  const GroupedTransactionList = ({ title, transactions, total, isOpen, onToggle }: { title: string, transactions: any[], total: number, isOpen: boolean, onToggle: () => void }) => {
    const grouped = groupTransactionsByMerchant(transactions);
    const [expandedMerchant, setExpandedMerchant] = useState<string | null>(null);

    // Calculate total monthly cost (sum of most recent transaction for each vendor)
    // The passed 'total' is sum of ALL transactions in time period. 
    // For "Cost per month", we might want just sum of latest amounts, strictly speaking.
    // But let's stick to the total passed for the header to match the pie charts/etc for now, 
    // or arguably "Cost per month" implies future projection. 
    // Let's use the sum of latest amounts for the header to be more accurate to "Monthly Cost" intent.
    const monthlyTotal = grouped.reduce((sum, g) => sum + g.amount, 0);

    return (
      <div className="bg-bg-card border border-border-main rounded-xl p-6 mb-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={onToggle}
        >
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            <span className="text-xs bg-bg-secondary px-2 py-1 rounded-full text-text-secondary">
              {grouped.length} vendors
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold text-text-primary text-right">
              ${monthlyTotal.toFixed(2)} / mo
            </span>
            {isOpen ? <ChevronUp className="w-5 h-5 text-text-secondary" /> : <ChevronDown className="w-5 h-5 text-text-secondary" />}
          </div>
        </div>

        {isOpen && (
          <div className="mt-4 space-y-3">
            {grouped.length > 0 ? (
              grouped.map((group) => {
                const isExpanded = expandedMerchant === group.merchant;
                return (
                  <div key={group.merchant} className="bg-bg-secondary rounded-lg border border-border-main overflow-hidden">
                    {/* Vendor Row */}
                    <div
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-bg-primary/50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedMerchant(isExpanded ? null : group.merchant);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{group.merchant}</p>
                          <p className="text-xs text-text-secondary">{group.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-text-primary">${group.amount.toFixed(2)}/mo</p>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-text-secondary" /> : <ChevronDown className="w-4 h-4 text-text-secondary" />}
                      </div>
                    </div>

                    {/* Expanded History */}
                    {isExpanded && (
                      <div className="p-3 border-t border-border-main bg-bg-primary/30">
                        <div className="mb-3 flex justify-between items-center">
                          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Recent Payments</h4>
                          <button className="text-xs bg-accent-red/10 text-accent-red px-2 py-1 rounded hover:bg-accent-red/20 transition-colors">
                            Cancel Subscription
                          </button>
                        </div>
                        <div className="space-y-2 mb-3">
                          {group.history.map((tx: any) => (
                            <div key={tx.id} className="flex justify-between text-sm">
                              <span className="text-text-secondary">{new Date(tx.transactionDate).toLocaleDateString()}</span>
                              <span className="text-text-primary">${tx.amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        {/* Total Spent Footer */}
                        <div className="pt-3 border-t border-border-main/50 flex justify-between items-center bg-bg-primary/50 -mx-3 -mb-3 p-3">
                          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Total Spent on {group.merchant}</span>
                          <span className="text-sm font-bold text-text-primary">${group.totalSpent.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-text-secondary">No subscriptions found.</p>
            )}
          </div>
        )}
      </div>
    );
  };

  const CategoryGroupedList = ({ title, transactions, total, isOpen, onToggle }: { title: string, transactions: any[], total: number, isOpen: boolean, onToggle: () => void }) => {
    // Group by category
    const groups: { [key: string]: { category: string; amount: number; history: any[] } } = {};

    transactions.forEach(tx => {
      const cat = tx.merchant?.category || 'Uncategorized';
      if (!groups[cat]) {
        groups[cat] = {
          category: cat,
          amount: 0,
          history: []
        };
      }
      groups[cat].amount += tx.amount;
      groups[cat].history.push(tx);
    });

    const sortedGroups = Object.values(groups).sort((a, b) => b.amount - a.amount);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    return (
      <div className="bg-bg-card border border-border-main rounded-xl p-6 mb-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={onToggle}
        >
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            <span className="text-xs bg-bg-secondary px-2 py-1 rounded-full text-text-secondary">
              {sortedGroups.length} categories
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold text-text-primary">${total.toFixed(2)}</span>
            {isOpen ? <ChevronUp className="w-5 h-5 text-text-secondary" /> : <ChevronDown className="w-5 h-5 text-text-secondary" />}
          </div>
        </div>

        {isOpen && (
          <div className="mt-4 space-y-3">
            {sortedGroups.length > 0 ? (
              sortedGroups.map((group) => {
                const isExpanded = expandedCategory === group.category;
                return (
                  <div key={group.category} className="bg-bg-secondary rounded-lg border border-border-main overflow-hidden">
                    {/* Category Row */}
                    <div
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-bg-primary/50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedCategory(isExpanded ? null : group.category);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center text-accent-purple">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{group.category}</p>
                          <p className="text-xs text-text-secondary">{group.history.length} transactions</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-text-primary">${group.amount.toFixed(2)}</p>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-text-secondary" /> : <ChevronDown className="w-4 h-4 text-text-secondary" />}
                      </div>
                    </div>

                    {/* Expanded History */}
                    {isExpanded && (
                      <div className="p-3 border-t border-border-main bg-bg-primary/30">
                        <div className="space-y-2">
                          {group.history.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()).map((tx: any) => (
                            <div key={tx.id} className="flex items-center justify-between text-sm">
                              <div className="flex flex-col">
                                <span className="text-text-primary">{tx.merchant?.name || tx.description}</span>
                                <span className="text-xs text-text-secondary">{new Date(tx.transactionDate).toLocaleDateString()}</span>
                              </div>
                              <span className="text-text-primary font-medium">${tx.amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-text-secondary">No day-to-day expenses found.</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Spending Statistics
          </h1>
          <p className="text-text-secondary mt-1">
            Detailed analytics of your purchasing patterns and trends
          </p>
        </div>
        {isUsingMockData && (
          <div className="flex items-center gap-2 text-xs text-text-secondary bg-bg-card border border-border-main rounded-full px-3 py-1.5">
            <Database className="w-3 h-3" />
            Demo Data
          </div>
        )}
        <button
          onClick={() => setShowAISidebar(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity shadow-lg"
        >
          <Sparkles className="w-4 h-4" />
          AI Budget Insights
        </button>
      </div>

      {/* AI Sidebar */}
      {showAISidebar && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowAISidebar(false)}
          />
          {/* Sidebar */}
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-bg-primary border-l border-border-main z-50 overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-bg-primary border-b border-border-main p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-accent-purple to-accent-pink p-2 rounded-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h2 className="font-semibold text-text-primary">AI Budget Insights</h2>
              </div>
              <button
                onClick={() => setShowAISidebar(false)}
                className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
            <div className="p-4">
              <AIInsights
                transactions={transactions.map(t => ({
                  merchant: t.merchant?.name || t.description || 'Unknown',
                  amount: t.amount,
                  category: t.merchant?.category || 'Uncategorized',
                  date: t.transactionDate,
                }))}
                recurringExpenses={recurringTrans.concat(subscriptionTrans).map(e => ({
                  merchant: e.merchant?.name || e.description || 'Unknown',
                  amount: e.amount,
                  category: e.merchant?.category || 'Uncategorized',
                }))}
                totalSpending={totalSpending}
                income={income}
              />
            </div>
          </div>
        </>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: ShoppingCart,
            label: "Total Spending",
            value: `$${totalSpending.toLocaleString()}`,
            sub: "This month",
            color: "text-accent-pink",
            bg: "bg-accent-pink/10",
          },
          {
            icon: TrendingUp,
            label: "Monthly Average",
            value: `$${avgMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            sub: monthlySpending.length > 0 ? `Last ${monthlySpending.length} months` : "This month",
            color: "text-accent-blue",
            bg: "bg-accent-blue/10",
          },
          {
            icon: CreditCard,
            label: "Transactions",
            value: totalTransactions.toString(),
            sub: "This month",
            color: "text-accent-purple",
            bg: "bg-accent-purple/10",
          },
          {
            icon: Calendar,
            label: "Top Merchant",
            value: topMerchant ? topMerchant.name : "N/A",
            sub: topMerchant ? `$${topMerchant.amount} spent` : "",
            color: "text-accent-yellow",
            bg: "bg-accent-yellow/10",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-bg-card border border-border-main rounded-xl p-5"
            >
              <div className={`${stat.bg} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-text-primary">
                {stat.value}
              </p>
              <p className="text-sm text-text-secondary">{stat.label}</p>
              <p className="text-xs text-text-secondary mt-1">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Transaction Type Sections */}
      <div className="mb-8">
        <GroupedTransactionList
          title="Recurring Expenses"
          transactions={recurringTrans}
          total={totalRecurring}
          isOpen={showRecurring}
          onToggle={() => setShowRecurring(!showRecurring)}
        />

        <GroupedTransactionList
          title="Subscriptions"
          transactions={subscriptionTrans}
          total={totalSubscriptions}
          isOpen={showSubscriptions}
          onToggle={() => setShowSubscriptions(!showSubscriptions)}
        />

        <CategoryGroupedList
          title="Day-to-Day Expenses (by Category)"
          transactions={dayToDayTrans}
          total={totalDayToDay}
          isOpen={showDayToDay}
          onToggle={() => setShowDayToDay(!showDayToDay)}
        />
      </div>

      {/* AI Budget vs Actual Sankey */}
      {aiBudgetVsActualSankey && (
        <div className="bg-bg-card border border-border-main rounded-xl p-6 mb-8 relative overflow-hidden">
          {/* Purple accent border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-purple to-accent-pink" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-accent-purple to-accent-pink p-2 rounded-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-text-primary">
                    AI Budget vs Actual Spending
                  </h2>
                  <span className="text-xs bg-accent-purple/20 text-accent-purple px-2 py-0.5 rounded-full font-medium">
                    AI Recommended
                  </span>
                </div>
                <p className="text-sm text-text-secondary">
                  Compare your AI-recommended budget allocations against actual spending
                </p>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-accent-green" />
                <span className="text-text-secondary">Under Budget</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-accent-red" />
                <span className="text-text-secondary">Over Budget</span>
              </div>
            </div>
          </div>

          {/* Summary stats row */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-bg-primary/50 rounded-lg p-3 text-center">
              <p className="text-xs text-text-secondary">AI Recommended Total</p>
              <p className="text-lg font-bold text-text-primary">${aiTotalBudgeted.toLocaleString()}</p>
            </div>
            <div className="bg-accent-green/5 border border-accent-green/20 rounded-lg p-3 text-center">
              <p className="text-xs text-text-secondary">Under Budget (Saved)</p>
              <p className="text-lg font-bold text-accent-green">${aiTotalUnderBudget.toLocaleString()}</p>
            </div>
            <div className="bg-accent-red/5 border border-accent-red/20 rounded-lg p-3 text-center">
              <p className="text-xs text-text-secondary">Over Budget</p>
              <p className="text-lg font-bold text-accent-red">${aiTotalOverBudget.toLocaleString()}</p>
            </div>
          </div>

          <SankeyDiagram data={aiBudgetVsActualSankey} />

          {/* Per-category variance chips */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {aiBudgetVariance.map((v) => (
              <div
                key={v.name}
                className={`rounded-lg p-2 text-center text-xs ${v.diff > 0
                  ? "bg-accent-red/10 border border-accent-red/20"
                  : v.diff < 0
                    ? "bg-accent-green/10 border border-accent-green/20"
                    : "bg-bg-primary/50 border border-border-main"
                  }`}
              >
                <p className="text-text-secondary truncate">{v.name}</p>
                <p
                  className={`font-bold ${v.diff > 0 ? "text-accent-red" : v.diff < 0 ? "text-accent-green" : "text-text-primary"
                    }`}
                >
                  {v.diff > 0 ? "+" : ""}${v.diff.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget vs Actual Sankey */}
      {budgetVsActualSankey && (
        <div className="bg-bg-card border border-border-main rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-accent-purple/10 p-2 rounded-lg">
                <GitCompareArrows className="w-5 h-5 text-accent-purple" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Budget vs Actual Spending
                </h2>
                <p className="text-sm text-text-secondary">
                  See how your actual spending compares to your budget plan
                </p>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-accent-green" />
                <span className="text-text-secondary">Under Budget</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-accent-red" />
                <span className="text-text-secondary">Over Budget</span>
              </div>
            </div>
          </div>

          {/* Summary stats row */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-bg-primary/50 rounded-lg p-3 text-center">
              <p className="text-xs text-text-secondary">Total Budgeted</p>
              <p className="text-lg font-bold text-text-primary">${totalBudgeted.toLocaleString()}</p>
            </div>
            <div className="bg-accent-green/5 border border-accent-green/20 rounded-lg p-3 text-center">
              <p className="text-xs text-text-secondary">Saved (Under Budget)</p>
              <p className="text-lg font-bold text-accent-green">${totalUnderBudget.toLocaleString()}</p>
            </div>
            <div className="bg-accent-red/5 border border-accent-red/20 rounded-lg p-3 text-center">
              <p className="text-xs text-text-secondary">Overspent</p>
              <p className="text-lg font-bold text-accent-red">${totalOverBudget.toLocaleString()}</p>
            </div>
          </div>

          <SankeyDiagram data={budgetVsActualSankey} />

          {/* Per-category breakdown */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {budgetVariance.map((v) => (
              <div
                key={v.name}
                className={`rounded-lg p-2 text-center text-xs ${v.diff > 0
                  ? "bg-accent-red/10 border border-accent-red/20"
                  : v.diff < 0
                    ? "bg-accent-green/10 border border-accent-green/20"
                    : "bg-bg-primary/50 border border-border-main"
                  }`}
              >
                <p className="text-text-secondary truncate">{v.name}</p>
                <p
                  className={`font-bold ${v.diff > 0 ? "text-accent-red" : v.diff < 0 ? "text-accent-green" : "text-text-primary"
                    }`}
                >
                  {v.diff > 0 ? "+" : ""}${v.diff.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Spending Trend */}
        <div className="bg-bg-card border border-border-main rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Monthly Spending Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlySpending}>
              <defs>
                <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#spendingGradient)"
                name="Spending"
              />
              <Line
                type="monotone"
                dataKey={() => income}
                stroke="#10b981"
                strokeDasharray="5 5"
                strokeWidth={1}
                dot={false}
                name="Income"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Spending by Category (Pie) */}
        <div className="bg-bg-card border border-border-main rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Spending by Category
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomPieLabel}
                outerRadius={100}
                innerRadius={50}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => `$${Number(value).toLocaleString()}`}
                contentStyle={{
                  background: "#1a1c25",
                  border: "1px solid #2a2d3a",
                  borderRadius: "8px",
                  color: "#f0f0f5",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Merchant Spending Overview - Combined Chart + Details */}
      <div className="bg-bg-card border border-border-main rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Merchant Spending Overview
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={merchantBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={(v) => `$${v}`}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#9ca3af"
                  fontSize={12}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" name="Amount" radius={[0, 6, 6, 0]}>
                  {merchantBarData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        [
                          "#6366f1",
                          "#8b5cf6",
                          "#ec4899",
                          "#f59e0b",
                          "#10b981",
                          "#14b8a6",
                          "#ef4444",
                          "#6366f1",
                        ][index]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Details Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-border-main">
                  <th className="pb-2 font-medium">Merchant</th>
                  <th className="pb-2 font-medium text-right">Visits</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                  <th className="pb-2 font-medium text-right">Avg</th>
                </tr>
              </thead>
              <tbody>
                {sortedMerchants.slice(0, 8).map((merchant) => (
                  <tr
                    key={merchant.name}
                    className="border-b border-border-main/50"
                  >
                    <td className="py-2 font-medium text-text-primary">
                      {merchant.name}
                    </td>
                    <td className="py-2 text-right text-text-secondary">
                      {merchant.visits}
                    </td>
                    <td className="py-2 text-right font-medium text-text-primary">
                      ${merchant.amount.toLocaleString()}
                    </td>
                    <td className="py-2 text-right text-text-secondary">
                      ${(merchant.amount / merchant.visits).toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
