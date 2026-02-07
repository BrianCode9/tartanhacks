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
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  mockCategories,
  mockMonthlySpending,
  mockMerchants,
  mockIncome,
} from "@/lib/mock-data";
import {
  TrendingUp,
  ShoppingCart,
  Calendar,
  CreditCard,
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
  const totalSpending = mockCategories.reduce(
    (sum, cat) => sum + cat.amount,
    0
  );
  const avgMonthly =
    mockMonthlySpending.reduce((sum, m) => sum + m.amount, 0) /
    mockMonthlySpending.length;
  const topMerchant = mockMerchants.sort((a, b) => b.amount - a.amount)[0];
  const totalTransactions = mockMerchants.reduce(
    (sum, m) => sum + m.visits,
    0
  );

  const pieData = mockCategories.map((cat) => ({
    name: cat.name,
    value: cat.amount,
    color: cat.color,
  }));

  const merchantBarData = mockMerchants
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">
          Spending Statistics
        </h1>
        <p className="text-text-secondary mt-1">
          Detailed analytics of your purchasing patterns and trends
        </p>
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
            sub: "Last 6 months",
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
            value: topMerchant.name,
            sub: `$${topMerchant.amount} spent`,
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Spending Trend */}
        <div className="bg-bg-card border border-border-main rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Monthly Spending Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockMonthlySpending}>
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
                dataKey={() => mockIncome}
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
              {mockMerchants
                .sort((a, b) => b.amount - a.amount)
                .map((merchant) => (
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
