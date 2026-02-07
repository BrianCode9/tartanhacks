
import { mockDebts, mockDebtProfile, calculateDebtPayoff } from './src/lib/mock-data.ts';

console.log("Running Debt Payoff Calculation Check...");

const snowball = calculateDebtPayoff(mockDebts, mockDebtProfile.extraMonthlyPayment, "snowball");
const avalanche = calculateDebtPayoff(mockDebts, mockDebtProfile.extraMonthlyPayment, "avalanche");

console.log("\nSnowball Results:");
console.log(`Total Interest: $${snowball.totalInterestPaid}`);
console.log(`Months to Free: ${snowball.totalMonthsToDebtFree}`);

console.log("\nAvalanche Results:");
console.log(`Total Interest: $${avalanche.totalInterestPaid}`);
console.log(`Months to Free: ${avalanche.totalMonthsToDebtFree}`);

console.log("\nDifference (Snowball - Avalanche):");
console.log(`Interest Saved by Avalanche: $${snowball.totalInterestPaid - avalanche.totalInterestPaid}`);
