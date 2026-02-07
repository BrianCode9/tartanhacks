"use client";

import dynamic from "next/dynamic";
import { mockStrategyNodes, mockStrategyEdges } from "@/lib/mock-data";
import { Target, TrendingUp, Lightbulb, AlertTriangle } from "lucide-react";

const StrategyGraph = dynamic(() => import("@/components/StrategyGraph"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-bg-card border border-border-main rounded-xl flex items-center justify-center">
      <div className="text-text-secondary">Loading strategy graph...</div>
    </div>
  ),
});

export default function StrategyPage() {
  const summaryItems = [
    {
      icon: Target,
      label: "Active Goals",
      value: mockStrategyNodes.filter((n) => n.type === "goal").length,
      color: "text-accent-blue",
      bg: "bg-accent-blue/10",
    },
    {
      icon: TrendingUp,
      label: "Strategies",
      value: mockStrategyNodes.filter((n) => n.type === "strategy").length,
      color: "text-accent-purple",
      bg: "bg-accent-purple/10",
    },
    {
      icon: Lightbulb,
      label: "Suggestions",
      value: mockStrategyNodes.filter((n) => n.type === "suggestion").length,
      color: "text-accent-yellow",
      bg: "bg-accent-yellow/10",
    },
    {
      icon: AlertTriangle,
      label: "Warnings",
      value: mockStrategyNodes.filter((n) => n.type === "warning").length,
      color: "text-accent-red",
      bg: "bg-accent-red/10",
    },
  ];

  const potentialSavings = mockStrategyNodes
    .filter((n) => n.type === "strategy" || n.type === "suggestion")
    .reduce((sum, n) => sum + (n.amount || 0), 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">
          Budget Strategy
        </h1>
        <p className="text-text-secondary mt-1">
          AI-generated workflow of budget goals, strategies, and money-saving
          suggestions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="bg-bg-card border border-border-main rounded-xl p-4 flex items-center gap-4"
            >
              <div className={`${item.bg} p-3 rounded-lg`}>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {item.value}
                </p>
                <p className="text-sm text-text-secondary">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Potential Savings Banner */}
      <div className="bg-accent-green/10 border border-accent-green/20 rounded-xl p-5 mb-8 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-accent-green text-lg">
            Potential Monthly Savings
          </h3>
          <p className="text-text-secondary text-sm mt-1">
            By following the suggested strategies, you could save this much each
            month
          </p>
        </div>
        <div className="text-3xl font-bold text-accent-green">
          +${potentialSavings.toLocaleString()}
        </div>
      </div>

      {/* Strategy Graph */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
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
        <StrategyGraph
          strategyNodes={mockStrategyNodes}
          strategyEdges={mockStrategyEdges}
        />
      </div>

      {/* Strategy Details List */}
      <div className="bg-bg-card border border-border-main rounded-xl p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Action Items
        </h2>
        <div className="space-y-3">
          {mockStrategyNodes
            .filter((n) => n.type !== "income")
            .map((node) => {
              const typeColors: Record<string, string> = {
                goal: "border-accent-blue/30 bg-accent-blue/5",
                strategy: "border-accent-purple/30 bg-accent-purple/5",
                suggestion: "border-accent-yellow/30 bg-accent-yellow/5",
                warning: "border-accent-red/30 bg-accent-red/5",
              };
              const typeBadge: Record<string, string> = {
                goal: "bg-accent-blue/20 text-accent-blue",
                strategy: "bg-accent-purple/20 text-accent-purple",
                suggestion: "bg-accent-yellow/20 text-accent-yellow",
                warning: "bg-accent-red/20 text-accent-red",
              };
              return (
                <div
                  key={node.id}
                  className={`border rounded-lg p-4 ${typeColors[node.type]}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${typeBadge[node.type]}`}
                      >
                        {node.type}
                      </span>
                      <h3 className="font-medium text-text-primary">
                        {node.label}
                      </h3>
                    </div>
                    {node.amount !== undefined && (
                      <span
                        className={`font-bold ${
                          node.amount >= 0
                            ? "text-accent-green"
                            : "text-accent-red"
                        }`}
                      >
                        {node.amount >= 0 ? "+" : ""}${Math.abs(node.amount)}/mo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary mt-2">
                    {node.description}
                  </p>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
