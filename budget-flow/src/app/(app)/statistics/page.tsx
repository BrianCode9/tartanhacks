"use client";

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
import { buildBudgetVsActualSankeyData, mockBudgetPlan } from "@/lib/mock-data";
import SankeyDiagram from "@/components/SankeyDiagram";
import {
  TrendingUp,
  ShoppingCart,
  Calendar,
  CreditCard,
  Loader2,
  Database,
  GitCompareArrows,
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
  const { categories, income, monthlySpending, merchants, isLoading, isUsingMockData } = useBudgetData();

  // Avoid hook-order issues by keeping these as plain derived values.
  const budgetVsActualSankey =
    categories.length > 0
      ? buildBudgetVsActualSankeyData(mockBudgetPlan, categories)
      : null;

  const budgetVariance = mockBudgetPlan.map((plan) => {
    const actual = categories.find((c) => c.name.toLowerCase() === plan.name.toLowerCase());
    const actualAmount = actual ? actual.amount : 0;
    return {
      name: plan.name,
      budgeted: plan.budgeted,
      actual: actualAmount,
      diff: actualAmount - plan.budgeted,
    };
  });

  if (isLoading) {
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

  const totalBudgeted = mockBudgetPlan.reduce((s, p) => s + p.budgeted, 0);
  const totalOverBudget = budgetVariance.filter((v) => v.diff > 0).reduce((s, v) => s + v.diff, 0);
  const totalUnderBudget = budgetVariance.filter((v) => v.diff < 0).reduce((s, v) => s + Math.abs(v.diff), 0);

  const pieData = categories.map((cat) => ({
    name: cat.name,
    value: cat.amount,
    color: cat.color,
  }));

  const merchantBarData = sortedMerchants.slice(0, 8);

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
      </div>

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
                className={`rounded-lg p-2 text-center text-xs ${
                  v.diff > 0
                    ? "bg-accent-red/10 border border-accent-red/20"
                    : v.diff < 0
                    ? "bg-accent-green/10 border border-accent-green/20"
                    : "bg-bg-primary/50 border border-border-main"
                }`}
              >
                <p className="text-text-secondary truncate">{v.name}</p>
                <p
                  className={`font-bold ${
                    v.diff > 0 ? "text-accent-red" : v.diff < 0 ? "text-accent-green" : "text-text-primary"
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

      {/* Top Merchants Bar Chart */}
      <div className="bg-bg-card border border-border-main rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Top Merchants by Spending
        </h2>
        <ResponsiveContainer width="100%" height={350}>
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

      {/* Merchant Details Table */}
      <div className="bg-bg-card border border-border-main rounded-xl p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Merchant Details
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-text-secondary border-b border-border-main">
                <th className="pb-3 font-medium">Merchant</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium text-right">Visits</th>
                <th className="pb-3 font-medium text-right">Total Spent</th>
                <th className="pb-3 font-medium text-right">Avg per Visit</th>
              </tr>
            </thead>
            <tbody>
              {sortedMerchants.map((merchant) => (
                <tr
                  key={merchant.name}
                  className="border-b border-border-main/50 hover:bg-bg-card-hover transition-colors"
                >
                  <td className="py-3 font-medium text-text-primary">
                    {merchant.name}
                  </td>
                  <td className="py-3">
                    <span className="text-xs bg-bg-primary px-2 py-1 rounded-full text-text-secondary">
                      {merchant.category}
                    </span>
                  </td>
                  <td className="py-3 text-right text-text-secondary">
                    {merchant.visits}
                  </td>
                  <td className="py-3 text-right font-medium text-text-primary">
                    ${merchant.amount.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-text-secondary">
                    ${(merchant.amount / merchant.visits).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
