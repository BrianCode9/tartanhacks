"use client";

import { useMemo } from "react";
import Link from "next/link";
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
  Lightbulb,
  AlertTriangle,
  Target,
  CalendarDays,
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

      {/* Quick Insights */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Spending Category */}
        <div className="bg-bg-card border border-border-main rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-accent-yellow/10 p-2 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-accent-yellow" />
            </div>
            <span className="text-sm font-medium text-text-secondary">Top Spending</span>
          </div>
          {categories.length > 0 && (
            <>
              <p className="text-xl font-bold text-text-primary">
                {categories.reduce((max, cat) => cat.amount > max.amount ? cat : max, categories[0]).name}
              </p>
              <p className="text-sm text-text-secondary mt-1">
                ${categories.reduce((max, cat) => cat.amount > max.amount ? cat : max, categories[0]).amount.toLocaleString()} this month
              </p>
            </>
          )}
        </div>

        {/* Daily Budget */}
        <div className="bg-bg-card border border-border-main rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-accent-green/10 p-2 rounded-lg">
              <Target className="w-4 h-4 text-accent-green" />
            </div>
            <span className="text-sm font-medium text-text-secondary">Daily Budget</span>
          </div>
          <p className="text-xl font-bold text-accent-green">
            ${((income - totalSpending) / 30).toFixed(2)}
          </p>
          <p className="text-sm text-text-secondary mt-1">
            Available per day to stay on track
          </p>
        </div>

        {/* Planner CTA */}
        <Link 
          href="/planner"
          className="bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 border border-accent-purple/30 rounded-xl p-5 hover:from-accent-purple/30 hover:to-accent-blue/30 transition-all"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-accent-purple/20 p-2 rounded-lg">
              <CalendarDays className="w-4 h-4 text-accent-purple" />
            </div>
            <span className="text-sm font-medium text-accent-purple">Plan Ahead</span>
          </div>
          <p className="text-lg font-bold text-text-primary">Budget Planner</p>
          <p className="text-sm text-text-secondary mt-1">
            View spending heatmap & plan future expenses
          </p>
        </Link>
      </div>

      {/* AI Insight */}
      <div className="mt-4 bg-gradient-to-r from-accent-blue/10 to-accent-teal/10 border border-accent-blue/20 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="bg-accent-blue/20 p-2 rounded-lg">
            <Lightbulb className="w-5 h-5 text-accent-blue" />
          </div>
          <div>
            <h3 className="font-medium text-text-primary mb-1">AI Insight</h3>
            <p className="text-sm text-text-secondary">
              {Number(savingsRate) >= 20 
                ? `Great job! You're saving ${savingsRate}% of your income. Consider investing the extra $${Math.max(0, (income - totalSpending) - (income * 0.2)).toFixed(0)} in an index fund for long-term growth.`
                : `Your savings rate is ${savingsRate}%. To hit the recommended 20%, try reducing your top spending category by $${((income * 0.2) - (income - totalSpending)).toFixed(0)}/month.`
              }
            </p>
          </div>
        </div>
      </div>

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
