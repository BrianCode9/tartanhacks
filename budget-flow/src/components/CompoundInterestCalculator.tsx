"use client";

import { useState, useMemo } from "react";
import { Calculator, TrendingUp, DollarSign, Calendar } from "lucide-react";

// Actually I'll stick to standard UI as I don't want to assume Skeleton exists if I haven't seen it recently (though I saw it in other files)

export default function CompoundInterestCalculator() {
    const [initialInvestment, setInitialInvestment] = useState(1000);
    const [monthlyContribution, setMonthlyContribution] = useState(200);
    const [interestRate, setInterestRate] = useState(7);
    const [years, setYears] = useState(10);

    const results = useMemo(() => {
        const monthlyRate = interestRate / 100 / 12;
        const totalMonths = years * 12;

        let balance = initialInvestment;
        let totalContributed = initialInvestment;

        const growthData = [];

        for (let i = 1; i <= totalMonths; i++) {
            balance = (balance + monthlyContribution) * (1 + monthlyRate);
            totalContributed += monthlyContribution;

            if (i % 12 === 0) {
                growthData.push({
                    year: i / 12,
                    balance: Math.round(balance),
                    totalContributed: Math.round(totalContributed),
                    interestEarned: Math.round(balance - totalContributed)
                });
            }
        }

        return {
            finalBalance: balance,
            totalContributed,
            totalInterest: balance - totalContributed,
            growthData
        };
    }, [initialInvestment, monthlyContribution, interestRate, years]);

    const formatMoney = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

    return (
        <div className="bg-bg-card border border-border-main rounded-xl p-6 h-full">
            <div className="flex items-center gap-2 mb-6">
                <div className="bg-accent-green/10 p-2 rounded-lg">
                    <Calculator className="w-5 h-5 text-accent-green" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-text-primary">Growth Calculator</h2>
                    <p className="text-sm text-text-secondary">See the power of compound interest</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-text-secondary mb-1.5">Initial Investment</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                            <input
                                type="number"
                                value={initialInvestment}
                                onChange={(e) => setInitialInvestment(Number(e.target.value))}
                                className="w-full bg-bg-secondary border border-border-main rounded-lg py-2 pl-9 pr-4 text-text-primary focus:outline-none focus:border-accent-green input-number-clean"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-text-secondary mb-1.5">Monthly Contribution</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                            <input
                                type="number"
                                value={monthlyContribution}
                                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                                className="w-full bg-bg-secondary border border-border-main rounded-lg py-2 pl-9 pr-4 text-text-primary focus:outline-none focus:border-accent-green input-number-clean"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-text-secondary mb-1.5">Annual Return (%)</label>
                        <div className="relative">
                            <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                            <input
                                type="number"
                                value={interestRate}
                                onChange={(e) => setInterestRate(Number(e.target.value))}
                                className="w-full bg-bg-secondary border border-border-main rounded-lg py-2 pl-9 pr-4 text-text-primary focus:outline-none focus:border-accent-green input-number-clean"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-text-secondary mb-1.5">Time Period (Years)</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                            <input
                                type="number"
                                value={years}
                                onChange={(e) => setYears(Math.min(50, Math.max(1, Number(e.target.value))))} // Cap at 50 years to keep UI sane
                                className="w-full bg-bg-secondary border border-border-main rounded-lg py-2 pl-9 pr-4 text-text-primary focus:outline-none focus:border-accent-green input-number-clean"
                            />
                        </div>
                    </div>
                </div>

                {/* Results Summary */}
                <div className="bg-bg-secondary/30 rounded-xl p-4 border border-border-main">
                    <div className="text-center mb-6">
                        <p className="text-sm text-text-secondary mb-1">In {years} years, you could have</p>
                        <p className="text-3xl font-bold text-accent-green">{formatMoney(results.finalBalance)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-bg-card rounded-lg border border-border-main">
                            <p className="text-text-secondary mb-1">Total Contributed</p>
                            <p className="font-semibold text-text-primary">{formatMoney(results.totalContributed)}</p>
                        </div>
                        <div className="p-3 bg-bg-card rounded-lg border border-border-main">
                            <p className="text-text-secondary mb-1">Total Interest Earned</p>
                            <p className="font-semibold text-accent-green">+{formatMoney(results.totalInterest)}</p>
                        </div>
                    </div>
                </div>

                {/* Simple Bar Chart Visualization */}
                <div className="pt-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">Growth Over Time</p>
                    <div className="flex items-end justify-between h-32 gap-1">
                        {results.growthData.filter((_, i, arr) => {
                            // detailed bars for short periods (<=10y), sparser for long periods
                            if (years <= 10) return true;
                            if (years <= 20) return i % 2 === 1; // every 2 years
                            return i % 5 === 4; // every 5 years
                        }).map((point) => {
                            const heightPercent = Math.max(5, (point.balance / results.finalBalance) * 100);
                            const contributionPercent = (point.totalContributed / point.balance) * 100;

                            return (
                                <div key={point.year} className="flex flex-col items-center gap-1 group flex-1">
                                    <div className="w-full bg-bg-secondary rounded-t-sm relative overflow-hidden transition-all hover:brightness-110" style={{ height: `${heightPercent}%` }}>
                                        <div className="absolute bottom-0 left-0 right-0 bg-accent-green/20" style={{ height: '100%' }}></div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-accent-blue/30" style={{ height: `${contributionPercent}%` }}></div>
                                    </div>
                                    <span className="text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-5 bg-bg-card px-1 rounded shadow-sm border border-border-main z-10">
                                        {formatMoney(point.balance)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between text-xs text-text-secondary mt-1 px-1">
                        <span>Year 1</span>
                        <span>Year {years}</span>
                    </div>

                    <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-accent-blue/50"></div>
                            <span className="text-text-secondary">Contributions</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-accent-green/50"></div>
                            <span className="text-text-secondary">Interest</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
