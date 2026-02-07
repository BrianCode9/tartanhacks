import {
  NessiePurchase,
  NessieMerchant,
  SpendingCategory,
  MonthlySpending,
  MerchantSpending,
} from "./types";

const CATEGORY_COLORS = [
  "#6366f1", // indigo
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ec4899", // pink
  "#8b5cf6", // violet
  "#ef4444", // red
  "#14b8a6", // teal
  "#f97316", // orange
  "#06b6d4", // cyan
  "#84cc16", // lime
];

// Map Nessie merchant categories to friendly display names
const CATEGORY_MAP: Record<string, string> = {
  food: "Food & Dining",
  restaurant: "Food & Dining",
  grocery: "Food & Dining",
  groceries: "Food & Dining",
  dining: "Food & Dining",
  coffee: "Food & Dining",
  transportation: "Transportation",
  gas: "Transportation",
  fuel: "Transportation",
  parking: "Transportation",
  auto: "Transportation",
  entertainment: "Entertainment",
  streaming: "Entertainment",
  games: "Entertainment",
  music: "Entertainment",
  shopping: "Shopping",
  clothing: "Shopping",
  electronics: "Shopping",
  retail: "Shopping",
  health: "Health",
  pharmacy: "Health",
  medical: "Health",
  gym: "Health",
  fitness: "Health",
  housing: "Housing",
  rent: "Housing",
  utilities: "Housing",
  internet: "Housing",
  education: "Education",
  books: "Education",
  travel: "Travel",
  hotel: "Travel",
  airline: "Travel",
  services: "Services",
  subscription: "Services",
};

function normalizeCategoryName(raw: string): string {
  const lower = raw.toLowerCase().trim();
  return CATEGORY_MAP[lower] || raw.charAt(0).toUpperCase() + raw.slice(1);
}

function getMerchantCategory(merchant: NessieMerchant | undefined): string {
  if (!merchant || !merchant.category || merchant.category.length === 0) {
    return "Other";
  }
  return normalizeCategoryName(merchant.category[0]);
}

function getMerchantSubcategory(merchant: NessieMerchant | undefined): string {
  if (!merchant) return "Other";
  // Use merchant name as subcategory for granularity
  return merchant.name;
}

export interface TransformedBudgetData {
  categories: SpendingCategory[];
  monthlySpending: MonthlySpending[];
  merchants: MerchantSpending[];
  income: number;
}

export function transformNessieData(
  purchases: NessiePurchase[],
  merchantsById: Map<string, NessieMerchant>,
  accountBalance: number
): TransformedBudgetData {
  // Filter only completed purchases
  const completedPurchases = purchases.filter(
    (p) => p.status === "completed" || p.status === "pending"
  );

  // --- Build SpendingCategory[] ---
  // Group by category, then by subcategory (merchant name)
  const categoryMap = new Map<
    string,
    { total: number; subcategories: Map<string, number> }
  >();

  for (const purchase of completedPurchases) {
    const merchant = merchantsById.get(purchase.merchant_id);
    const categoryName = getMerchantCategory(merchant);
    const subcategoryName = getMerchantSubcategory(merchant);

    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, { total: 0, subcategories: new Map() });
    }
    const cat = categoryMap.get(categoryName)!;
    cat.total += purchase.amount;
    cat.subcategories.set(
      subcategoryName,
      (cat.subcategories.get(subcategoryName) || 0) + purchase.amount
    );
  }

  const categories: SpendingCategory[] = [];
  let colorIndex = 0;
  // Sort categories by amount descending
  const sortedCategories = [...categoryMap.entries()].sort(
    (a, b) => b[1].total - a[1].total
  );

  for (const [name, data] of sortedCategories) {
    const subcategories = [...data.subcategories.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([subName, amount]) => ({
        name: subName,
        amount: Math.round(amount * 100) / 100,
      }));

    categories.push({
      name,
      amount: Math.round(data.total * 100) / 100,
      color: CATEGORY_COLORS[colorIndex % CATEGORY_COLORS.length],
      subcategories,
    });
    colorIndex++;
  }

  // --- Build MonthlySpending[] ---
  const monthlyMap = new Map<string, number>();
  for (const purchase of completedPurchases) {
    const date = new Date(purchase.purchase_date);
    const monthKey = date.toLocaleString("en-US", {
      month: "short",
      year: "2-digit",
    });
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + purchase.amount);
  }

  // Sort by date
  const monthlySpending: MonthlySpending[] = [...monthlyMap.entries()]
    .sort((a, b) => {
      // Parse back to compare dates
      const dateA = new Date(`1 ${a[0]}`);
      const dateB = new Date(`1 ${b[0]}`);
      return dateA.getTime() - dateB.getTime();
    })
    .map(([month, amount]) => ({
      month: month.split(" ")[0], // Just the month abbreviation
      amount: Math.round(amount * 100) / 100,
    }));

  // --- Build MerchantSpending[] ---
  const merchantSpendMap = new Map<
    string,
    { amount: number; category: string; visits: number }
  >();

  for (const purchase of completedPurchases) {
    const merchant = merchantsById.get(purchase.merchant_id);
    const merchantName = merchant?.name || "Unknown";
    const category = getMerchantCategory(merchant);

    if (!merchantSpendMap.has(merchantName)) {
      merchantSpendMap.set(merchantName, { amount: 0, category, visits: 0 });
    }
    const m = merchantSpendMap.get(merchantName)!;
    m.amount += purchase.amount;
    m.visits += 1;
  }

  const merchants: MerchantSpending[] = [...merchantSpendMap.entries()]
    .sort((a, b) => b[1].amount - a[1].amount)
    .map(([name, data]) => ({
      name,
      amount: Math.round(data.amount * 100) / 100,
      category: data.category,
      visits: data.visits,
    }));

  // Income: use the account balance or a default
  const income = accountBalance > 0 ? accountBalance : 5000;

  return { categories, monthlySpending, merchants, income };
}
