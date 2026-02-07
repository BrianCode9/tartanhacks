"use client";

import dynamic from "next/dynamic";
import { mockStrategyNodes, mockStrategyEdges } from "@/lib/mock-data";
import { useBudgetData } from "@/lib/use-budget-data";
import { useStrategyData } from "@/lib/use-strategy-data";
import {
  Target,
  TrendingUp,
  Lightbulb,
  AlertTriangle,
  Loader2,
  Database,
  Sparkles,
} from "lucide-react";

const StrategyGraph = dynamic(() => import("@/components/StrategyGraph"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[800px] bg-bg-card border border-border-main rounded-xl flex items-center justify-center">
      <div className="text-text-secondary">Loading strategy graph...</div>
    </div>
  ),
});

export default function StrategyPage() {
  const budgetData = useBudgetData();
  const strategyData = useStrategyData({
    categories: budgetData.categories,
    income: budgetData.income,
    isReady: !budgetData.isLoading,
  });

  // Use AI data when available, otherwise mock
  const nodes = strategyData.isLoading
    ? mockStrategyNodes
    : strategyData.nodes.length > 0
      ? strategyData.nodes
      : mockStrategyNodes;
  const edges = strategyData.isLoading
    ? mockStrategyEdges
    : strategyData.edges.length > 0
      ? strategyData.edges
      : mockStrategyEdges;
  const showAiBadge = !strategyData.isLoading && !strategyData.isUsingMockData && strategyData.nodes.length > 0;

  if (budgetData.isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-accent-blue animate-spin" />
          <p className="text-text-secondary">Loading budget data...</p>
        </div>
      </div>
    );
  }

  const potentialSavings = nodes
    .filter((n) => n.type === "strategy" || n.type === "suggestion")
    .reduce((sum, n) => sum + (n.amount || 0), 0);

  const summaryItems = [
    {
      icon: Target,
      label: "Active Goals",
      value: nodes.filter((n) => n.type === "goal").length,
      color: "text-accent-blue",
      bg: "bg-accent-blue/10",
    },
    {
      icon: TrendingUp,
      label: "Strategies",
      value: nodes.filter((n) => n.type === "strategy").length,
      color: "text-accent-purple",
      bg: "bg-accent-purple/10",
    },
    {
      icon: Lightbulb,
      label: "Suggestions",
      value: nodes.filter((n) => n.type === "suggestion").length,
      color: "text-accent-yellow",
      bg: "bg-accent-yellow/10",
    },
    {
      icon: AlertTriangle,
      label: "Warnings",
      value: nodes.filter((n) => n.type === "warning").length,
      color: "text-accent-red",
      bg: "bg-accent-red/10",
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Budget Strategy
          </h1>
          <p className="text-text-secondary mt-1">
            Click any node to see details. Drag nodes to rearrange.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {strategyData.isLoading && (
            <div className="flex items-center gap-2 text-xs text-accent-purple bg-accent-purple/10 border border-accent-purple/20 rounded-full px-3 py-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              Generating AI strategies...
            </div>
          )}
          {!strategyData.isLoading && showAiBadge && (
            <div className="flex items-center gap-2 text-xs text-accent-purple bg-accent-purple/10 border border-accent-purple/20 rounded-full px-3 py-1.5">
              <Sparkles className="w-3 h-3" />
              AI Generated
            </div>
          )}
          {!strategyData.isLoading && !showAiBadge && (
            <div className="flex items-center gap-2 text-xs text-text-secondary bg-bg-card border border-border-main rounded-full px-3 py-1.5">
              <Database className="w-3 h-3" />
              Demo Strategy
            </div>
          )}
        </div>
      </div>

      {/* Strategy Graph — full width, tall */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-text-primary">
            Strategy Workflow
          </h2>
          <div className="flex gap-4">
            {Object.entries({
              Income: "bg-accent-green",
              Goals: "bg-accent-blue",
              Strategies: "bg-accent-purple",
              Suggestions: "bg-accent-yellow",
              Warnings: "bg-accent-red",
            }).map(([label, color]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="text-xs text-text-secondary">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="h-[calc(100vh-280px)] min-h-[600px]">
          <StrategyGraph strategyNodes={nodes} strategyEdges={edges} />
        </div>
      </div>

      {/* Summary Cards + Savings — below the chart */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {summaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="bg-bg-card border border-border-main rounded-xl p-4 flex items-center gap-3"
            >
              <div className={`${item.bg} p-2.5 rounded-lg`}>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {item.value}
                </p>
                <p className="text-xs text-text-secondary">{item.label}</p>
              </div>
            </div>
          );
        })}

        {/* Potential Savings as the 5th card */}
        {potentialSavings > 0 && (
          <div className="bg-accent-green/10 border border-accent-green/20 rounded-xl p-4 flex items-center gap-3">
            <div className="bg-accent-green/20 p-2.5 rounded-lg">
              <TrendingUp className="w-5 h-5 text-accent-green" />
            </div>
            <div>
              <p className="text-2xl font-bold text-accent-green">
                +${potentialSavings.toLocaleString()}
              </p>
              <p className="text-xs text-text-secondary">Potential Savings/mo</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
