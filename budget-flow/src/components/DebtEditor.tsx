"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Check, X, DollarSign, Percent } from "lucide-react";
import { Debt } from "@/lib/types";

interface DebtEditorProps {
    debts: Debt[];
    onChange: (debts: Debt[]) => void;
}

export default function DebtEditor({ debts, onChange }: DebtEditorProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Debt>>({});
    const [isAdding, setIsAdding] = useState(false);

    const startEditing = (debt: Debt) => {
        setEditingId(debt.id);
        setEditForm({ ...debt });
        setIsAdding(false);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({});
        setIsAdding(false);
    };

    const saveEdit = () => {
        if (!editForm.name || !editForm.balance || !editForm.interestRate || !editForm.minimumPayment) return;

        const newDebts = debts.map(d => d.id === editingId ? { ...d, ...editForm } as Debt : d);
        onChange(newDebts);
        cancelEditing();
    };

    const startAdding = () => {
        setIsAdding(true);
        setEditingId(null);
        setEditForm({
            id: Math.random().toString(36).substr(2, 9),
            name: "New Debt",
            balance: 1000,
            interestRate: 15,
            minimumPayment: 50,
            type: "credit-card"
        });
    };

    const saveAdd = () => {
        if (!editForm.name || !editForm.balance || !editForm.interestRate || !editForm.minimumPayment) return;

        onChange([...debts, editForm as Debt]);
        cancelEditing();
    };

    const deleteDebt = (id: string) => {
        onChange(debts.filter(d => d.id !== id));
    };

    const formatMoney = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

    return (
        <div className="bg-bg-card border border-border-main rounded-xl overflow-hidden">
            <div className="p-4 bg-bg-secondary/30 border-b border-border-main flex items-center justify-between">
                <h3 className="font-semibold text-text-primary">Your Debts</h3>
                <button
                    onClick={startAdding}
                    disabled={isAdding || editingId !== null}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-blue/10 text-accent-blue rounded-lg text-sm font-medium hover:bg-accent-blue/20 transition-colors disabled:opacity-50"
                >
                    <Plus className="w-4 h-4" />
                    Add Debt
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-bg-secondary/50 text-text-secondary">
                        <tr>
                            <th className="p-4 font-medium">Name</th>
                            <th className="p-4 font-medium">Balance</th>
                            <th className="p-4 font-medium">Interest Rate</th>
                            <th className="p-4 font-medium">Min Payment</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-main">
                        {/* Adding Row */}
                        {isAdding && (
                            <tr className="bg-accent-blue/5">
                                <td className="p-4">
                                    <input
                                        className="w-full bg-bg-card border border-border-main rounded px-2 py-1 text-text-primary focus:border-accent-blue outline-none"
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        placeholder="Debt Name"
                                        autoFocus
                                    />
                                </td>
                                <td className="p-4">
                                    <div className="relative">
                                        <DollarSign className="absolute left-2 top-1.5 w-3 h-3 text-text-secondary" />
                                        <input
                                            type="number"
                                            className="w-full bg-bg-card border border-border-main rounded pl-6 pr-2 py-1 text-text-primary focus:border-accent-blue outline-none"
                                            value={editForm.balance}
                                            onChange={e => setEditForm({ ...editForm, balance: Number(e.target.value) })}
                                        />
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="relative">
                                        <Percent className="absolute right-2 top-1.5 w-3 h-3 text-text-secondary" />
                                        <input
                                            type="number"
                                            className="w-full bg-bg-card border border-border-main rounded pl-2 pr-6 py-1 text-text-primary focus:border-accent-blue outline-none"
                                            value={editForm.interestRate}
                                            onChange={e => setEditForm({ ...editForm, interestRate: Number(e.target.value) })}
                                        />
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="relative">
                                        <DollarSign className="absolute left-2 top-1.5 w-3 h-3 text-text-secondary" />
                                        <input
                                            type="number"
                                            className="w-full bg-bg-card border border-border-main rounded pl-6 pr-2 py-1 text-text-primary focus:border-accent-blue outline-none"
                                            value={editForm.minimumPayment}
                                            onChange={e => setEditForm({ ...editForm, minimumPayment: Number(e.target.value) })}
                                        />
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={saveAdd} className="p-1.5 bg-accent-green/10 text-accent-green rounded hover:bg-accent-green/20">
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button onClick={cancelEditing} className="p-1.5 bg-bg-secondary text-text-secondary rounded hover:text-text-primary">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Existing Debts */}
                        {debts.map(debt => (
                            <tr key={debt.id} className="group hover:bg-bg-secondary/20 transition-colors">
                                {editingId === debt.id ? (
                                    <>
                                        <td className="p-4">
                                            <input
                                                className="w-full bg-bg-card border border-border-main rounded px-2 py-1 text-text-primary focus:border-accent-blue outline-none"
                                                value={editForm.name}
                                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <input
                                                type="number"
                                                className="w-24 bg-bg-card border border-border-main rounded px-2 py-1 text-text-primary focus:border-accent-blue outline-none"
                                                value={editForm.balance}
                                                onChange={e => setEditForm({ ...editForm, balance: Number(e.target.value) })}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <input
                                                type="number"
                                                className="w-16 bg-bg-card border border-border-main rounded px-2 py-1 text-text-primary focus:border-accent-blue outline-none"
                                                value={editForm.interestRate}
                                                onChange={e => setEditForm({ ...editForm, interestRate: Number(e.target.value) })}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <input
                                                type="number"
                                                className="w-20 bg-bg-card border border-border-main rounded px-2 py-1 text-text-primary focus:border-accent-blue outline-none"
                                                value={editForm.minimumPayment}
                                                onChange={e => setEditForm({ ...editForm, minimumPayment: Number(e.target.value) })}
                                            />
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={saveEdit} className="p-1.5 bg-accent-green/10 text-accent-green rounded hover:bg-accent-green/20">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button onClick={cancelEditing} className="p-1.5 bg-bg-secondary text-text-secondary rounded hover:text-text-primary">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="p-4 font-medium text-text-primary">{debt.name}</td>
                                        <td className="p-4 text-text-primary">{formatMoney(debt.balance)}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${debt.interestRate >= 15 ? "bg-accent-red/10 text-accent-red" :
                                                    debt.interestRate >= 7 ? "bg-accent-yellow/10 text-accent-yellow" :
                                                        "bg-accent-green/10 text-accent-green"
                                                }`}>
                                                {debt.interestRate}%
                                            </span>
                                        </td>
                                        <td className="p-4 text-text-secondary">{formatMoney(debt.minimumPayment)}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => startEditing(debt)}
                                                    className="p-1.5 hover:bg-bg-secondary text-text-secondary hover:text-accent-blue rounded"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteDebt(debt.id)}
                                                    className="p-1.5 hover:bg-bg-secondary text-text-secondary hover:text-accent-red rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
