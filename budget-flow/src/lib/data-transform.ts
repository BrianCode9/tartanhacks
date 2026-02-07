import { Transaction, Merchant, SpendingCategory } from "./types";

/**
 * Filter transactions to only include those from the current month
 */
export function filterCurrentMonthTransactions<T extends Transaction>(
    transactions: T[]
): T[] {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return transactions.filter(transaction => {
        const date = new Date(transaction.transactionDate);
        return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
    });
}

/**
 * Transform database transactions into spending categories for the app
 */
export function transformTransactionsToCategories(
    transactions: (Transaction & { merchant: Merchant })[]
): SpendingCategory[] {
    // Group transactions by category
    const categoryMap = new Map<string, Map<string, number>>();

    for (const transaction of transactions) {
        const category = transaction.merchant.subcategory || transaction.merchant.category;
        const subcategory = transaction.merchant.category;

        if (!categoryMap.has(category)) {
            categoryMap.set(category, new Map());
        }

        const subcategoryMap = categoryMap.get(category)!;
        const currentAmount = subcategoryMap.get(subcategory) || 0;
        subcategoryMap.set(subcategory, currentAmount + transaction.amount);
    }

    // Convert to SpendingCategory format
    const categories: SpendingCategory[] = [];
    const categoryColors: Record<string, string> = {
        Housing: "#6366f1",
        "Food & Dining": "#10b981",
        Transportation: "#f59e0b",
        Entertainment: "#ec4899",
        Shopping: "#8b5cf6",
        Health: "#ef4444",
        Savings: "#14b8a6",
    };

    for (const [categoryName, subcategoryMap] of categoryMap) {
        const subcategories = Array.from(subcategoryMap.entries()).map(([name, amount]) => ({
            name,
            amount,
        }));

        const totalAmount = subcategories.reduce((sum, sub) => sum + sub.amount, 0);

        categories.push({
            name: categoryName,
            amount: totalAmount,
            color: categoryColors[categoryName] || "#9ca3af",
            subcategories,
        });
    }

    return categories.sort((a, b) => b.amount - a.amount);
}

/**
 * Calculate monthly spending from transactions
 */
export function calculateMonthlySpending(
    transactions: Transaction[]
): { month: string; amount: number }[] {
    const monthlyMap = new Map<string, number>();

    for (const transaction of transactions) {
        const date = new Date(transaction.transactionDate);
        const monthKey = date.toLocaleString("en-US", { month: "short" });

        const currentAmount = monthlyMap.get(monthKey) || 0;
        monthlyMap.set(monthKey, currentAmount + transaction.amount);
    }

    return Array.from(monthlyMap.entries())
        .map(([month, amount]) => ({ month, amount }))
        .reverse()
        .slice(0, 6);
}

/**
 * Calculate merchant spending aggregates
 */
export function calculateMerchantSpending(
    transactions: (Transaction & { merchant: Merchant })[]
): { name: string; amount: number; category: string; visits: number }[] {
    const merchantMap = new Map<
        string,
        { amount: number; category: string; visits: number }
    >();

    for (const transaction of transactions) {
        const merchantName = transaction.merchant.name;
        const existing = merchantMap.get(merchantName);

        if (existing) {
            existing.amount += transaction.amount;
            existing.visits += 1;
        } else {
            merchantMap.set(merchantName, {
                amount: transaction.amount,
                category: transaction.merchant.category,
                visits: 1,
            });
        }
    }

    return Array.from(merchantMap.entries())
        .map(([name, data]) => ({
            name,
            ...data,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);
}

/**
 * Calculate daily spending from transactions for heatmap
 */
export function calculateDailySpending(
    transactions: Transaction[]
): { date: string; amount: number; transactions: number }[] {
    const dailyMap = new Map<string, { amount: number; count: number }>();

    for (const transaction of transactions) {
        // Format date as YYYY-MM-DD
        const date = new Date(transaction.transactionDate);
        const dateStr = date.toISOString().split('T')[0];

        const existing = dailyMap.get(dateStr) || { amount: 0, count: 0 };
        dailyMap.set(dateStr, {
            amount: existing.amount + transaction.amount,
            count: existing.count + 1
        });
    }

    return Array.from(dailyMap.entries())
        .map(([date, data]) => ({
            date,
            amount: data.amount,
            transactions: data.count
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
}
