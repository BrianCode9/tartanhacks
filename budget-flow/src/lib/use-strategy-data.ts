"use client";

import { useState, useEffect } from "react";
import { SpendingCategory, StrategyNode, StrategyEdge } from "./types";
import { mockStrategyNodes, mockStrategyEdges } from "./mock-data";

interface StrategyData {
  nodes: StrategyNode[];
  edges: StrategyEdge[];
  isLoading: boolean;
  isUsingMockData: boolean;
}

interface StrategyInput {
  categories: SpendingCategory[];
  income: number;
  isReady: boolean;
}

export function useStrategyData({ categories, income, isReady }: StrategyInput): StrategyData {
  const [data, setData] = useState<StrategyData>({
    nodes: [],
    edges: [],
    isLoading: true,
    isUsingMockData: false,
  });

  useEffect(() => {
    if (!isReady) return;

    let cancelled = false;

    async function fetchStrategy() {
      try {
        const totalSpending = categories.reduce((sum, c) => sum + c.amount, 0);

        const budgetSummary = [
          `Monthly Income: $${income}`,
          `Total Spending: $${totalSpending}`,
          `Net Savings: $${income - totalSpending}`,
          ``,
          `Spending Breakdown:`,
          ...categories.map(
            (c) =>
              `- ${c.name}: $${c.amount} (${((c.amount / totalSpending) * 100).toFixed(1)}%)` +
              (c.subcategories.length > 0
                ? "\n" +
                  c.subcategories
                    .map((s) => `  - ${s.name}: $${s.amount}`)
                    .join("\n")
                : "")
          ),
        ].join("\n");

        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "strategy",
            prompt: budgetSummary,
          }),
        });

        if (!res.ok) throw new Error(`AI API error: ${res.status}`);

        const result = await res.json();
        const content = result.response;

        // Parse JSON from the response (may be wrapped in markdown code blocks)
        let jsonStr = content;
        const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
          jsonStr = codeBlockMatch[1];
        }

        const parsed = JSON.parse(jsonStr.trim());

        if (!parsed.nodes || !parsed.edges) {
          throw new Error("Invalid strategy response format");
        }

        if (!cancelled) {
          setData({
            nodes: parsed.nodes,
            edges: parsed.edges,
            isLoading: false,
            isUsingMockData: false,
          });
        }
      } catch (error) {
        console.warn("Failed to fetch AI strategy, using mock data:", error);
        if (!cancelled) {
          setData({
            nodes: mockStrategyNodes,
            edges: mockStrategyEdges,
            isLoading: false,
            isUsingMockData: true,
          });
        }
      }
    }

    fetchStrategy();

    return () => {
      cancelled = true;
    };
  }, [categories, income, isReady]);

  return data;
}
