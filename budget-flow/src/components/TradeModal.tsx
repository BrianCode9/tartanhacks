"use client";

import { useState } from "react";
import { X, TrendingUp, DollarSign } from "lucide-react";

interface TradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTrade: (symbol: string, quantity: number, price: number, type: "buy" | "sell") => void;
}

export default function TradeModal({ isOpen, onClose, onTrade }: TradeModalProps) {
    const [symbol, setSymbol] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [price, setPrice] = useState("");
    const [type, setType] = useState<"buy" | "sell">("buy");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!symbol || !quantity || !price) return;

        onTrade(symbol.toUpperCase(), Number(quantity), Number(price), type);
        onClose();
        // Reset form
        setSymbol("");
        setQuantity("1");
        setPrice("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-bg-card border border-border-main rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-accent-purple" />
                        Execute Trade
                    </h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex bg-bg-secondary p-1 rounded-lg mb-6">
                        <button
                            type="button"
                            onClick={() => setType("buy")}
                            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${type === "buy" ? "bg-accent-green text-white shadow" : "text-text-secondary hover:text-text-primary"
                                }`}
                        >
                            Buy
                        </button>
                        <button
                            type="button"
                            onClick={() => setType("sell")}
                            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${type === "sell" ? "bg-accent-red text-white shadow" : "text-text-secondary hover:text-text-primary"
                                }`}
                        >
                            Sell
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide">
                            Symbol
                        </label>
                        <input
                            type="text"
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
                            className="w-full px-4 py-2.5 bg-bg-secondary border border-border-main rounded-lg text-text-primary focus:outline-none focus:border-accent-purple transition-colors uppercase"
                            placeholder="e.g. AAPL"
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide">
                                Quantity
                            </label>
                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full px-4 py-2.5 bg-bg-secondary border border-border-main rounded-lg text-text-primary focus:outline-none focus:border-accent-purple transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide">
                                Price ($)
                            </label>
                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full px-4 py-2.5 bg-bg-secondary border border-border-main rounded-lg text-text-primary focus:outline-none focus:border-accent-purple transition-colors"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Quick Mock Price Button (Demo Only) */}
                    <button
                        type="button"
                        onClick={() => setPrice((Math.random() * 500 + 10).toFixed(2))}
                        className="text-xs text-accent-blue hover:underline w-full text-right"
                    >
                        Fetch current price (Simulated)
                    </button>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className={`w-full py-3 rounded-xl font-semibold text-white shadow-lg shadow-accent-purple/20 transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2 ${type === "buy"
                                    ? "bg-gradient-to-r from-accent-green to-accent-teal"
                                    : "bg-gradient-to-r from-accent-red to-accent-pink"
                                }`}
                        >
                            <DollarSign className="w-4 h-4" />
                            {type === "buy" ? "Confirm Purchase" : "Confirm Sale"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
