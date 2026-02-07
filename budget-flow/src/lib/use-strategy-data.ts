"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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

const STRATEGY_CACHE_KEY = "strategy-ai-cache";

interface CachedStrategy {
  categoriesKey: string;
  income: number;
  nodes: StrategyNode[];
  edges: StrategyEdge[];
  timestamp: number;
}

// Cache expires after 1 hour
const CACHE_TTL = 60 * 60 * 1000;

function loadStrategyCache(): CachedStrategy | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(STRATEGY_CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    // Check if cache is still valid
    if (Date.now() - parsed.timestamp > CACHE_TTL) {
      localStorage.removeItem(STRATEGY_CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveStrategyCache(categoriesKey: string, income: number, nodes: StrategyNode[], edges: StrategyEdge[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STRATEGY_CACHE_KEY, JSON.stringify({
      categoriesKey,
      income,
      nodes,
      edges,
      timestamp: Date.now(),
    }));
  } catch {
    // Silent fail
  }
}

export function useStrategyData({ categories, income, isReady }: StrategyInput): StrategyData {
  const [data, setData] = useState<StrategyData>({
    nodes: [],
    edges: [],
    isLoading: true,
    isUsingMockData: false,
  });
  const hasFetched = useRef(false);

  // Stabilize categories into a string key
  const categoriesKey = useMemo(
    () => JSON.stringify(categories.map((c) => ({ n: c.name, a: c.amount }))),
    [categories]
  );

  const incomeKey = JSON.stringify(income);

  useEffect(() => {
    if (!isReady || hasFetched.current) return;

    let cancelled = false;
    hasFetched.current = true;

    async function fetchStrategy() {
      // Check cache first
      const cached = loadStrategyCache();
      if (cached && cached.categoriesKey === categoriesKey && cached.income === income) {
        if (!cancelled) {
          setData({
            nodes: cached.nodes,
            edges: cached.edges,
            isLoading: false,
            isUsingMockData: false,
          });
        }
        return;
      }

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

        // Parse JSON from the response
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
          // Save to cache
          saveStrategyCache(categoriesKey, income, parsed.nodes, parsed.edges);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesKey, incomeKey, isReady]);

  return data;
}
