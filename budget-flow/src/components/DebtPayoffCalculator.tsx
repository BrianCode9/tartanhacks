"use client";

import { useState, useMemo } from "react";
import { Calculator, ArrowRight, DollarSign, Calendar, TrendingDown } from "lucide-react";

export default function DebtPayoffCalculator() {
    const [loanAmount, setLoanAmount] = useState(10000);
    const [interestRate, setInterestRate] = useState(18);
    const [monthlyPayment, setMonthlyPayment] = useState(300);
    const [extraPayment, setExtraPayment] = useState(100);

    const calculatePayoff = (extra: number) => {
        let balance = loanAmount;
        let months = 0;
        let totalInterest = 0;
        const monthlyRate = interestRate / 100 / 12;
        const totalPayment = monthlyPayment + extra;

        // Safety break
        if (totalPayment <= balance * monthlyRate) {
            return { months: 999, totalInterest: 0, totalPaid: 0 };
        }

        while (balance > 0 && months < 600) {
            const interest = balance * monthlyRate;
            totalInterest += interest;
            const principal = Math.min(balance, totalPayment - interest);
            balance -= principal;
            months++;
        }

        return {
            months,
            totalInterest,
            totalPaid: loanAmount + totalInterest
        };
    };

    const currentScenario = calculatePayoff(0);
    const acceleratedScenario = calculatePayoff(extraPayment);

    const timeSaved = currentScenario.months - acceleratedScenario.months;
    const interestSaved = currentScenario.totalInterest - acceleratedScenario.totalInterest;

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
                    <p className="text-sm text-text-secondary">See how extra payments save you money</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm text-text-secondary mb-2">Loan Balance</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                            <input
                                type="number"
                                value={loanAmount}
                                onChange={(e) => setLoanAmount(Number(e.target.value))}
                                className="w-full bg-bg-secondary border border-border-main rounded-lg py-2 pl-9 pr-4 text-text-primary focus:outline-none focus:border-accent-blue"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-text-secondary mb-2">Interest Rate (%)</label>
                        <input
                            type="number"
                            value={interestRate}
                            onChange={(e) => setInterestRate(Number(e.target.value))}
                            className="w-full bg-bg-secondary border border-border-main rounded-lg py-2 px-4 text-text-primary focus:outline-none focus:border-accent-blue"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-text-secondary mb-2">Current Monthly Payment</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                            <input
                                type="number"
                                value={monthlyPayment}
                                onChange={(e) => setMonthlyPayment(Number(e.target.value))}
                                className="w-full bg-bg-secondary border border-border-main rounded-lg py-2 pl-9 pr-4 text-text-primary focus:outline-none focus:border-accent-blue"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-text-secondary mb-2">
                            Simulate Extra Monthly Payment: <span className="text-accent-green font-bold">+${extraPayment}</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1000"
                            step="10"
                            value={extraPayment}
                            onChange={(e) => setExtraPayment(Number(e.target.value))}
                            className="w-full accent-accent-green"
                        />
                        <div className="flex justify-between text-xs text-text-secondary mt-1">
                            <span>$0</span>
                            <span>$1,000</span>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="bg-bg-secondary/50 rounded-xl p-6 border border-border-main flex flex-col justify-center">
                    <div className="text-center mb-8">
                        <p className="text-text-secondary mb-2">By adding <span className="text-accent-green font-bold">+${extraPayment}/mo</span></p>
                        <div className="text-3xl font-bold text-accent-green mb-1">
                            Save {formatMoney(interestSaved)}
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
                                <div className="font-bold text-text-primary">{Math.ceil(acceleratedScenario.months / 12)} years, {acceleratedScenario.months % 12} months</div>
                                <div className="text-xs text-accent-green">
                                    {Math.floor(timeSaved / 12)}y {timeSaved % 12}m sooner
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-bg-card rounded-lg border border-border-main">
                            <div className="flex items-center gap-3">
                                <TrendingDown className="w-4 h-4 text-accent-purple" />
                                <span className="text-sm text-text-secondary">Total Interest</span>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-text-primary">{formatMoney(acceleratedScenario.totalInterest)}</div>
                                <div className="text-xs text-text-secondary line-through opacity-75">
                                    {formatMoney(currentScenario.totalInterest)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
