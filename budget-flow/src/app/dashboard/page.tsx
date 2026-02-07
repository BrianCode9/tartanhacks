"use client";

import { useMemo } from "react";
import SankeyDiagram from "@/components/SankeyDiagram";
import CategoryCard from "@/components/CategoryCard";
import { buildSankeyData } from "@/lib/mock-data";
import { useBudgetData } from "@/lib/use-budget-data";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Database,
} from "lucide-react";

export default function DashboardPage() {
  const { categories, income, isLoading, isUsingMockData, updateCategory, updateSubcategory } = useBudgetData();

  const sankeyData = useMemo(
    () => (categories.length > 0 ? buildSankeyData(income, categories) : null),
    [income, categories]
  );

  const totalSpending = categories.reduce((sum, cat) => sum + cat.amount, 0);
  const savingsRate =
    income > 0 ? (((income - totalSpending) / income) * 100).toFixed(1) : "0";

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-accent-blue animate-spin" />
          <p className="text-text-secondary">Loading budget data...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Monthly Income",
      value: `$${income.toLocaleString()}`,
      icon: Wallet,
      trend: "+3.2%",
      trendUp: true,
      color: "text-accent-green",
      bgColor: "bg-accent-green/10",
    },
    {
      label: "Total Spending",
      value: `$${totalSpending.toLocaleString()}`,
      icon: TrendingDown,
      trend: "-5.1%",
      trendUp: false,
      color: "text-accent-red",
      bgColor: "bg-accent-red/10",
    },
    {
      label: "Net Savings",
      value: `$${(income - totalSpending).toLocaleString()}`,
      icon: PiggyBank,
      trend: `${savingsRate}%`,
      trendUp: true,
      color: "text-accent-teal",
      bgColor: "bg-accent-teal/10",
    },
    {
      label: "Budget Health",
      value: Number(savingsRate) >= 20 ? "Excellent" : "Good",
      icon: TrendingUp,
      trend: "On Track",
      trendUp: true,
      color: "text-accent-blue",
      bgColor: "bg-accent-blue/10",
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Budget Flow</h1>
          <p className="text-text-secondary mt-1">
            Your spending visualized as a workflow — powered by AI analysis
          </p>
        </div>
        {isUsingMockData && (
          <div className="flex items-center gap-2 text-xs text-text-secondary bg-bg-card border border-border-main rounded-full px-3 py-1.5">
            <Database className="w-3 h-3" />
            Demo Data
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-bg-card border border-border-main rounded-xl p-5 hover:bg-bg-card-hover transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? "text-accent-green" : "text-accent-red"
                    }`}
                >
                  {stat.trendUp ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {stat.trend}
                </div>
              </div>
              <p className="text-2xl font-bold text-text-primary">
                {stat.value}
              </p>
              <p className="text-sm text-text-secondary mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Sankey Diagram */}
      {sankeyData && (
        <div className="bg-bg-card border border-border-main rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                Money Flow Diagram
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                How your income flows through spending categories
              </p>
            </div>
            <div className="flex gap-2">
              {categories.slice(0, 5).map((cat) => (
                <div key={cat.name} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-xs text-text-secondary">
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <SankeyDiagram data={sankeyData} />
        </div>
      )}

      {/* Category Breakdown */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Edit Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.name}
              category={cat}
              onUpdateSubcategory={(subName, amount) => updateSubcategory(cat.name, subName, amount)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
