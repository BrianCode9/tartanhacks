"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Snowflake,
  Mountain,
  Brain,
  Check,
  ThumbsUp,
  ThumbsDown,
  X,
  Blend,
  Wrench,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  mockDebts,
  mockDebtProfile,
  calculateDebtPayoff,
  getDebtRecommendation,
} from "@/lib/mock-data";
import { DebtStrategy, DebtPayoffResult, Debt } from "@/lib/types";
import DebtPayoffCalculator from "@/components/DebtPayoffCalculator";
import DebtEditor from "@/components/DebtEditor";

const DebtGraph = dynamic(() => import("@/components/DebtGraph"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-bg-card border border-border-main rounded-xl flex items-center justify-center">
      <div className="text-text-secondary">Loading debt graph...</div>
    </div>
  ),
});

const strategyButtons: { key: DebtStrategy; label: string; icon: typeof Snowflake; activeColor: string }[] = [
  { key: "snowball", label: "Snowball", icon: Snowflake, activeColor: "bg-accent-blue/20 text-accent-blue border border-accent-blue/30" },
  { key: "avalanche", label: "Avalanche", icon: Mountain, activeColor: "bg-accent-purple/20 text-accent-purple border border-accent-purple/30" },
  { key: "hybrid", label: "Hybrid", icon: Blend, activeColor: "bg-accent-green/20 text-accent-green border border-accent-green/30" },
  { key: "custom", label: "Custom", icon: Wrench, activeColor: "bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30" },
];

function strategySubtitle(strategy: DebtStrategy): string {
  switch (strategy) {
    case "snowball": return "Lowest Balance First";
    case "avalanche": return "Highest Interest First";
    case "hybrid": return "High Interest First, Then Smallest Balance";
    case "custom": return "Your Custom Payoff Order";
  }
}

function ComparisonValue({ value, isBest, format }: { value: number; isBest: boolean; format: "currency" | "months" }) {
  const text = format === "currency"
    ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    : `${value} months`;
  return (
    <span className={`text-lg font-bold ${isBest ? "text-accent-green" : "text-text-primary"}`}>
      {text}
      {isBest && <Check className="w-4 h-4 inline ml-1 text-accent-green" />}
    </span>
  );
}

export default function DebtPayoffPage() {
  const [debts, setDebts] = useState<Debt[]>(mockDebts);
  const [strategy, setStrategy] = useState<DebtStrategy>("snowball");
  const [customOrder, setCustomOrder] = useState<string[]>(() => mockDebts.map((d) => d.id));
  const [customKey, setCustomKey] = useState(0); // bump to force remount graph
  const [extraPayment, setExtraPayment] = useState(mockDebtProfile.extraMonthlyPayment);

  const snowballResult = useMemo(
    () => calculateDebtPayoff(debts, extraPayment, "snowball"),
    [debts, extraPayment]
  );
  const avalancheResult = useMemo(
    () => calculateDebtPayoff(debts, extraPayment, "avalanche"),
    [debts, extraPayment]
  );
  const hybridResult = useMemo(
    () => calculateDebtPayoff(debts, extraPayment, "hybrid"),
    [debts, extraPayment]
  );
  const customResult = useMemo(
    () => calculateDebtPayoff(debts, extraPayment, "custom", customOrder),
    [debts, extraPayment, customOrder]
  );

  const resultMap: Record<DebtStrategy, DebtPayoffResult> = {
    snowball: snowballResult,
    avalanche: avalancheResult,
    hybrid: hybridResult,
    custom: customResult,
  };

  const activeResult = resultMap[strategy];

  const recommendation = useMemo(
    () => getDebtRecommendation(mockDebtProfile.impulsivityScore, snowballResult, avalancheResult, hybridResult),
    [snowballResult, avalancheResult, hybridResult]
  );

  const isRecommended = strategy === recommendation.recommended;

  const handleCustomOrderChange = useCallback((newOrder: string[]) => {
    setCustomOrder(newOrder);
  }, []);

  const handleResetCustom = useCallback(() => {
    setCustomOrder(debts.map((d) => d.id));
    setCustomKey((k) => k + 1);
  }, [debts]);

  // For comparison: all 4 strategies
  const allResults: { strategy: DebtStrategy; label: string; icon: typeof Snowflake; result: DebtPayoffResult }[] = [
    { strategy: "snowball", label: "Snowball", icon: Snowflake, result: snowballResult },
    { strategy: "avalanche", label: "Avalanche", icon: Mountain, result: avalancheResult },
    { strategy: "hybrid", label: "Hybrid", icon: Blend, result: hybridResult },
  ];
  // Add custom to comparison only when viewing custom
  if (strategy === "custom") {
    allResults.push({ strategy: "custom", label: "Custom", icon: Wrench, result: customResult });
  }

  const bestInterest = Math.min(...allResults.map((r) => r.result.totalInterestPaid));
  const bestMonths = Math.min(...allResults.map((r) => r.result.totalMonthsToDebtFree));
  const bestTotal = Math.min(...allResults.map((r) => r.result.totalAmountPaid));

  return (
    <div className="p-8">
      {/* Header + Strategy Toggle */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Debt Payoff Planner</h1>
          <p className="text-text-secondary mt-1">
            {strategy === "custom"
              ? "Drag handles to connect nodes in your preferred order. Click edges to remove them."
              : "Visualize your path to becoming debt-free. Click nodes for details."}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-bg-card border border-border-main rounded-xl p-1">
          {strategyButtons.map(({ key, label, icon: Icon, activeColor }) => (
            <button
              key={key}
              onClick={() => setStrategy(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${strategy === key
                ? activeColor
                : "text-text-secondary hover:text-text-primary hover:bg-bg-secondary"
                }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Calculator */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-4">Calculator</h2>
          <DebtPayoffCalculator
            debts={debts}
            strategy={strategy}
            extraPayment={extraPayment}
            onExtraPaymentChange={setExtraPayment}
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-4">Your Debts</h2>
          <DebtEditor debts={debts} onChange={setDebts} />
        </div>
      </div>

      {/* AI Recommendation Card */}
      <div
        className={`mb-6 rounded-2xl p-5 border-2 transition-colors ${isRecommended
          ? "bg-accent-purple/10 border-accent-purple/30"
          : "bg-bg-card border-border-main"
          }`}
      >
        <div className="flex items-start gap-4">
          <div className="bg-accent-purple/20 rounded-xl p-2.5 flex-shrink-0">
            <Brain className="w-6 h-6 text-accent-purple" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-text-primary">
                {recommendation.title}
              </h3>
              <span className="text-xs font-semibold uppercase tracking-wider bg-accent-purple/20 text-accent-purple px-2 py-0.5 rounded-full">
                AI Insight
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-3">
              {recommendation.explanation}
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-text-secondary bg-bg-secondary/50 rounded-lg px-3 py-1.5">
                <span>Impulsivity Score:</span>
                <span className="font-bold text-text-primary">{mockDebtProfile.impulsivityScore}/100</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary bg-bg-secondary/50 rounded-lg px-3 py-1.5">
                <span>Interest Savings Difference:</span>
                <span className="font-bold text-accent-green">
                  ${recommendation.savingsDifference.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              {isRecommended && (
                <div className="flex items-center gap-1 text-xs font-semibold text-accent-green bg-accent-green/10 rounded-lg px-3 py-1.5">
                  <Check className="w-3 h-3" />
                  Viewing recommended strategy
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom mode: reset button */}
      {strategy === "custom" && (
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={handleResetCustom}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-bg-card border border-border-main text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Order
          </button>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Sparkles className="w-3 h-3 text-accent-yellow" />
            Current order: {customOrder.map((id) => debts.find((d) => d.id === id)?.name).filter(Boolean).join(" → ")}
          </div>
        </div>
      )}

      {/* Legend + Graph */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-text-primary">
            Payoff Order ({strategySubtitle(strategy)})
          </h2>
          <div className="flex gap-4">
            {[
              { label: "High Risk (≥15%)", color: "bg-accent-red" },
              { label: "Medium Risk (≥7%)", color: "bg-accent-yellow" },
              { label: "Low Risk (<7%)", color: "bg-accent-green" },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="text-xs text-text-secondary">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="h-[calc(100vh-520px)] min-h-[400px]">
          <DebtGraph
            key={`${strategy}-${customKey}-${debts.length}`}
            debts={debts}
            schedule={activeResult.schedule}
            strategy={strategy}
            onOrderChange={strategy === "custom" ? handleCustomOrderChange : undefined}
          />
        </div>
      </div>

      {/* Comparison Summary Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-text-primary mb-3">
          Strategy Comparison
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Interest Paid */}
          <div className="bg-bg-card border border-border-main rounded-xl p-5">
            <p className="text-sm text-text-secondary mb-3">Total Interest Paid</p>
            <div className="space-y-2">
              {allResults.map(({ strategy: s, label, icon: Icon, result }) => (
                <div key={s} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </span>
                  <ComparisonValue
                    value={result.totalInterestPaid}
                    isBest={result.totalInterestPaid <= bestInterest}
                    format="currency"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Months to Debt-Free */}
          <div className="bg-bg-card border border-border-main rounded-xl p-5">
            <p className="text-sm text-text-secondary mb-3">Months to Debt-Free</p>
            <div className="space-y-2">
              {allResults.map(({ strategy: s, label, icon: Icon, result }) => (
                <div key={s} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </span>
                  <ComparisonValue
                    value={result.totalMonthsToDebtFree}
                    isBest={result.totalMonthsToDebtFree <= bestMonths}
                    format="months"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Total Amount Paid */}
          <div className="bg-bg-card border border-border-main rounded-xl p-5">
            <p className="text-sm text-text-secondary mb-3">Total Amount Paid</p>
            <div className="space-y-2">
              {allResults.map(({ strategy: s, label, icon: Icon, result }) => (
                <div key={s} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </span>
                  <ComparisonValue
                    value={result.totalAmountPaid}
                    isBest={result.totalAmountPaid <= bestTotal}
                    format="currency"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pros/Cons Section */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-3">
          Pros & Cons
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Snowball */}
          <div className="bg-bg-card border border-border-main rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Snowflake className="w-5 h-5 text-accent-blue" />
              <h3 className="text-lg font-semibold text-text-primary">Snowball</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-accent-green mb-2 flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" /> Pros
                </p>
                <ul className="space-y-1.5">
                  {[
                    "Quick wins build motivation",
                    "Reduces number of bills faster",
                    "Psychologically rewarding",
                  ].map((pro) => (
                    <li key={pro} className="text-sm text-text-secondary flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-accent-green flex-shrink-0 mt-0.5" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-accent-red mb-2 flex items-center gap-1">
                  <ThumbsDown className="w-3 h-3" /> Cons
                </p>
                <ul className="space-y-1.5">
                  {[
                    "Pays more interest over time",
                    "High-interest debt accrues longer",
                  ].map((con) => (
                    <li key={con} className="text-sm text-text-secondary flex items-start gap-2">
                      <X className="w-3.5 h-3.5 text-accent-red flex-shrink-0 mt-0.5" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Avalanche */}
          <div className="bg-bg-card border border-border-main rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Mountain className="w-5 h-5 text-accent-purple" />
              <h3 className="text-lg font-semibold text-text-primary">Avalanche</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-accent-green mb-2 flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" /> Pros
                </p>
                <ul className="space-y-1.5">
                  {[
                    "Minimizes total interest paid",
                    "Math-optimal approach",
                    "Saves money long-term",
                  ].map((pro) => (
                    <li key={pro} className="text-sm text-text-secondary flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-accent-green flex-shrink-0 mt-0.5" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-accent-red mb-2 flex items-center gap-1">
                  <ThumbsDown className="w-3 h-3" /> Cons
                </p>
                <ul className="space-y-1.5">
                  {[
                    "First payoff takes a long time",
                    "Less psychological reward early on",
                  ].map((con) => (
                    <li key={con} className="text-sm text-text-secondary flex items-start gap-2">
                      <X className="w-3.5 h-3.5 text-accent-red flex-shrink-0 mt-0.5" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Hybrid */}
          <div className="bg-bg-card border border-border-main rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Blend className="w-5 h-5 text-accent-green" />
              <h3 className="text-lg font-semibold text-text-primary">Hybrid</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-accent-green mb-2 flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" /> Pros
                </p>
                <ul className="space-y-1.5">
                  {[
                    "Kills expensive debt first",
                    "Then gets quick wins on small balances",
                    "Best of both worlds for most people",
                  ].map((pro) => (
                    <li key={pro} className="text-sm text-text-secondary flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-accent-green flex-shrink-0 mt-0.5" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-accent-red mb-2 flex items-center gap-1">
                  <ThumbsDown className="w-3 h-3" /> Cons
                </p>
                <ul className="space-y-1.5">
                  {[
                    "Slightly more complex to follow",
                    "Not as optimal as pure avalanche on interest",
                  ].map((con) => (
                    <li key={con} className="text-sm text-text-secondary flex items-start gap-2">
                      <X className="w-3.5 h-3.5 text-accent-red flex-shrink-0 mt-0.5" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
