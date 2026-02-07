"use client";

import { useState } from "react";
import { BookOpen, GraduationCap, TrendingUp, DollarSign, PieChart, ChevronDown, ChevronUp } from "lucide-react";

interface EducationItem {
    id: string;
    title: string;
    content: string;
    icon: React.ElementType;
}

const EDUCATION_ITEMS: EducationItem[] = [
    {
        id: "compound",
        title: "What is compound interest?",
        content: "Compound interest is earning interest on your interest. Over time, this snowball effect can turn small regular savings into significant wealth. The earlier you start, the more powerful it becomes.",
        icon: TrendingUp
    },
    {
        id: "asset-classes",
        title: "Stocks vs Bonds vs ETFs",
        content: "Stocks are ownership in a company (higher risk/reward). Bonds are loans to governments/companies (lower risk/reward). ETFs are baskets of many stocks/bonds providing instant diversification.",
        icon: PieChart
    },
    {
        id: "dca",
        title: "What is dollar-cost averaging?",
        content: "DCA means investing a fixed amount regularly regardless of market price. This removes emotional timing decisions and often lowers your average cost per share over time.",
        icon: DollarSign
    },
    {
        id: "emergency",
        title: "Why start with an emergency fund?",
        content: "An emergency fund (3-6 months expenses) protects you from being forced to sell investments at a loss when life happens. It gives you the financial stability to take calculated investment risks.",
        icon: BookOpen
    }
];

export default function InvestingEducation() {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleItem = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="bg-bg-card border border-border-main rounded-xl p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
                <div className="bg-accent-blue/10 p-2 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-accent-blue" />
                </div>
                <h2 className="text-lg font-semibold text-text-primary">Investing 101</h2>
            </div>

            <div className="space-y-3">
                {EDUCATION_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isExpanded = expandedId === item.id;

                    return (
                        <div
                            key={item.id}
                            className={`border rounded-lg transition-all duration-200 overflow-hidden ${isExpanded
                                    ? "bg-bg-secondary border-accent-blue/30"
                                    : "bg-bg-secondary/30 border-border-main hover:bg-bg-secondary"
                                }`}
                        >
                            <button
                                onClick={() => toggleItem(item.id)}
                                className="w-full flex items-center justify-between p-3 text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`w-4 h-4 ${isExpanded ? "text-accent-blue" : "text-text-secondary"}`} />
                                    <span className={`font-medium text-sm ${isExpanded ? "text-text-primary" : "text-text-secondary"}`}>
                                        {item.title}
                                    </span>
                                </div>
                                {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-text-secondary" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-text-secondary" />
                                )}
                            </button>

                            {isExpanded && (
                                <div className="px-3 pb-3 pl-10">
                                    <p className="text-sm text-text-secondary leading-relaxed">
                                        {item.content}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
