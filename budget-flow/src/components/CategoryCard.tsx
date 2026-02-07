"use client";

import { useState, useRef, useEffect } from "react";
import { SpendingCategory } from "@/lib/types";
import { Check, X, Edit2 } from "lucide-react";

interface CategoryCardProps {
    category: SpendingCategory;
    onUpdateSubcategory: (subName: string, amount: number) => void;
}

// Reusable component for editable amount
function EditableAmount({
    amount,
    onSave,
    className = ""
}: {
    amount: number,
    onSave: (val: number) => void,
    className?: string
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempAmount, setTempAmount] = useState(amount.toString());
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = () => {
        const val = parseInt(tempAmount.replace(/[^0-9]/g, ""), 10);
        if (!isNaN(val) && val >= 0) {
            onSave(val);
        } else {
            setTempAmount(amount.toString());
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempAmount(amount.toString());
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSave();
        if (e.key === "Escape") handleCancel();
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-1">
                <input
                    ref={inputRef}
                    type="text"
                    value={tempAmount}
                    onChange={(e) => setTempAmount(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-20 px-1 py-0.5 text-right bg-bg-main border border-border-main rounded text-text-primary text-sm focus:outline-none focus:border-accent-blue"
                />
                <button onClick={handleSave} className="p-0.5 hover:bg-accent-green/20 rounded text-accent-green">
                    <Check className="w-3 h-3" />
                </button>
                <button onClick={handleCancel} className="p-0.5 hover:bg-accent-red/20 rounded text-accent-red">
                    <X className="w-3 h-3" />
                </button>
            </div>
        );
    }

    return (
        <div
            onClick={() => {
                setTempAmount(amount.toString());
                setIsEditing(true);
            }}
            className={`cursor-pointer hover:bg-bg-main px-1 py-0.5 rounded transition-colors group/edit flex items-center gap-1 ${className}`}
            title="Click to edit"
        >
            <span>${amount.toLocaleString()}</span>
            <Edit2 className="w-3 h-3 text-text-muted opacity-0 group-hover/edit:opacity-100 transition-opacity" />
        </div>
    );
}

export default function CategoryCard({ category, onUpdateSubcategory }: CategoryCardProps) {
    return (
        <div className="bg-bg-card border border-border-main rounded-xl p-5 hover:bg-bg-card-hover transition-colors group">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                    />
                    <h3 className="font-medium text-text-primary">{category.name}</h3>
                </div>

                {/* Main Category Amount is READ-ONLY */}
                <div className="text-lg font-bold text-text-primary">
                    ${category.amount.toLocaleString()}
                </div>
            </div>

            <div className="space-y-2">
                {category.subcategories.map((sub) => (
                    <div key={sub.name} className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">{sub.name}</span>
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-bg-main rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${category.amount > 0 ? (sub.amount / category.amount) * 100 : 0}%`,
                                        backgroundColor: category.color,
                                        opacity: 0.7,
                                    }}
                                />
                            </div>
                            <div className="w-16 flex justify-end">
                                <EditableAmount
                                    amount={sub.amount}
                                    onSave={(val) => onUpdateSubcategory(sub.name, val)}
                                    className="text-xs text-text-secondary"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
