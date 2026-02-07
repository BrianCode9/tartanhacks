"use client";

import { useMemo } from "react";
import { Calculator, Calendar, TrendingDown, DollarSign } from "lucide-react";
import { calculateDebtPayoff } from "@/lib/mock-data";
import { Debt, DebtStrategy } from "@/lib/types";

interface DebtPayoffCalculatorProps {
    debts: Debt[];
    strategy: DebtStrategy;
    extraPayment: number;
    onExtraPaymentChange: (amount: number) => void;
}

export default function DebtPayoffCalculator({
    debts,
    strategy,
    extraPayment,
    onExtraPaymentChange
}: DebtPayoffCalculatorProps) {

    // Calculate scenarios based on REAL data passed from parent
    const currentScenario = useMemo(
        () => calculateDebtPayoff(debts, 0, strategy),
        [debts, strategy]
    );

    const acceleratedScenario = useMemo(
        () => calculateDebtPayoff(debts, extraPayment, strategy),
        [debts, extraPayment, strategy]
    );

    const timeSaved = currentScenario.totalMonthsToDebtFree - acceleratedScenario.totalMonthsToDebtFree;
    const interestSaved = currentScenario.totalInterestPaid - acceleratedScenario.totalInterestPaid;

    const formatMoney = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

    return (
        <div className="bg-bg-card border border-border-main rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-accent-blue/10 rounded-lg">
                    <Calculator className="w-5 h-5 text-accent-blue" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-text-primary">Payoff Simulator</h2>
                    <p className="text-sm text-text-secondary">See how extra payments affect your <strong>{strategy}</strong> strategy</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm text-text-secondary mb-2">
                            Extra Monthly Payment: <span className="text-accent-green font-bold">+${extraPayment}</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="2000"
                            step="50"
                            value={extraPayment}
                            onChange={(e) => onExtraPaymentChange(Number(e.target.value))}
                            className="w-full accent-accent-green"
                        />
                        <div className="flex justify-between text-xs text-text-secondary mt-1">
                            <span>$0</span>
                            <span>$2,000</span>
                        </div>
                    </div>

                    <div className="p-4 bg-bg-secondary/30 rounded-lg border border-border-main">
                        <h3 className="text-sm font-medium text-text-primary mb-2">Current Strategy Breakdown</h3>
                        <div className="space-y-2 text-sm text-text-secondary">
                            <div className="flex justify-between">
                                <span>Total Debt:</span>
                                <span className="text-text-primary">{formatMoney(debts.reduce((sum, d) => sum + d.balance, 0))}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Monthly Minimums:</span>
                                <span className="text-text-primary">{formatMoney(debts.reduce((sum, d) => sum + d.minimumPayment, 0))}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="bg-bg-secondary/50 rounded-xl p-6 border border-border-main flex flex-col justify-center">
                    <div className="text-center mb-8">
                        <p className="text-text-secondary mb-2">By adding <span className="text-accent-green font-bold">+${extraPayment}/mo</span></p>
                        <div className="text-3xl font-bold text-accent-green mb-1">
                            Save {formatMoney(Math.max(0, interestSaved))}
                        </div>
                        <p className="text-sm text-text-secondary">in total interest</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-bg-card rounded-lg border border-border-main">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-accent-blue" />
                                <span className="text-sm text-text-secondary">Time to Debt Free</span>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-text-primary">
                                    {Math.floor(acceleratedScenario.totalMonthsToDebtFree / 12)}y {acceleratedScenario.totalMonthsToDebtFree % 12}m
                                </div>
                                {timeSaved > 0 && (
                                    <div className="text-xs text-accent-green">
                                        {Math.floor(timeSaved / 12)}y {timeSaved % 12}m sooner
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-bg-card rounded-lg border border-border-main">
                            <div className="flex items-center gap-3">
                                <TrendingDown className="w-4 h-4 text-accent-purple" />
                                <span className="text-sm text-text-secondary">Total Interest Paid</span>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-text-primary">{formatMoney(acceleratedScenario.totalInterestPaid)}</div>
                                <div className="text-xs text-text-secondary line-through opacity-75">
                                    {formatMoney(currentScenario.totalInterestPaid)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
