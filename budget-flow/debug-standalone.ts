
// Mock Data (copied to avoid import issues)
const mockDebts = [
    { id: "cc-a", name: "Credit Card A", balance: 4200, interestRate: 24.99, minimumPayment: 105, type: "credit-card" },
    { id: "cc-b", name: "Credit Card B", balance: 1800, interestRate: 19.99, minimumPayment: 55, type: "credit-card" },
    { id: "student", name: "Student Loan", balance: 28000, interestRate: 5.5, minimumPayment: 300, type: "student-loan" },
    { id: "car", name: "Car Loan", balance: 12500, interestRate: 6.9, minimumPayment: 280, type: "car-loan" },
    { id: "medical", name: "Medical Bill", balance: 3200, interestRate: 0, minimumPayment: 150, type: "medical" },
    { id: "personal", name: "Personal Loan", balance: 8000, interestRate: 11.5, minimumPayment: 200, type: "personal-loan" },
];

const mockDebtProfile = {
    extraMonthlyPayment: 500,
    impulsivityScore: 65,
};

// Simplified Calculation Logic (copied from mock-data.ts)
function calculateDebtPayoff(
    debts: any[],
    extraPayment: number,
    strategy: "snowball" | "avalanche"
) {
    let sorted: any[];
    if (strategy === "snowball") {
        sorted = [...debts].sort((a, b) => a.balance - b.balance);
    } else {
        sorted = [...debts].sort((a, b) => b.interestRate - a.interestRate);
    }

    const order = sorted.map((d) => d.id);
    const balances = new Map(debts.map(d => [d.id, d.balance]));
    const interestPaid = new Map(debts.map(d => [d.id, 0]));
    const paidOff = new Set<string>();
    const debtMap = new Map(debts.map((d) => [d.id, d]));

    let month = 0;
    const MAX_MONTHS = 600;

    while (paidOff.size < debts.length && month < MAX_MONTHS) {
        month++;
        let extraRemaining = extraPayment;

        // Apply interest
        for (const d of debts) {
            if (paidOff.has(d.id)) continue;
            const bal = balances.get(d.id)!;
            const monthlyRate = d.interestRate / 100 / 12;
            const interest = bal * monthlyRate;
            interestPaid.set(d.id, interestPaid.get(d.id)! + interest);
            balances.set(d.id, bal + interest);
        }

        // Apply minimums
        for (const d of debts) {
            if (paidOff.has(d.id)) continue;
            const bal = balances.get(d.id)!;
            const payment = Math.min(d.minimumPayment, bal);
            balances.set(d.id, bal - payment);

            if (balances.get(d.id)! <= 0.01) {
                balances.set(d.id, 0);
                paidOff.add(d.id);
                extraRemaining += d.minimumPayment - payment; // add unused min to extra
            }
        }

        // Apply extra
        for (const id of order) {
            if (paidOff.has(id) || extraRemaining <= 0) continue;
            const bal = balances.get(id)!;
            const payment = Math.min(extraRemaining, bal);
            balances.set(id, bal - payment);
            extraRemaining -= payment;

            if (balances.get(id)! <= 0.01) {
                balances.set(id, 0);
                paidOff.add(id);
                const debt = debtMap.get(id)!;
                extraRemaining += debt.minimumPayment; // freed up minimum
            }
        }
    }

    const totalInterest = Array.from(interestPaid.values()).reduce((a, b) => a + b, 0);
    return {
        totalInterestPaid: totalInterest,
        totalMonthsToDebtFree: month
    };
}

console.log("Running Standalone Check...");
const snowball = calculateDebtPayoff(mockDebts, mockDebtProfile.extraMonthlyPayment, "snowball");
const avalanche = calculateDebtPayoff(mockDebts, mockDebtProfile.extraMonthlyPayment, "avalanche");

console.log("\nSnowball Results:");
console.log(`Total Interest: $${snowball.totalInterestPaid.toFixed(2)}`);
console.log(`Months: ${snowball.totalMonthsToDebtFree}`);

console.log("\nAvalanche Results:");
console.log(`Total Interest: $${avalanche.totalInterestPaid.toFixed(2)}`);
console.log(`Months: ${avalanche.totalMonthsToDebtFree}`);

console.log("\nSavngs:");
console.log(`$${(snowball.totalInterestPaid - avalanche.totalInterestPaid).toFixed(2)}`);
