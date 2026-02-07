import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_USERS = [
    { name: 'Alex Johnson', email: 'alex.johnson@gmail.com', password: 'root', monthlyIncome: 5500 },
    { name: 'Jordan Smith', email: 'jordan.smith@gmail.com', password: 'root', monthlyIncome: 6200 },
    { name: 'Taylor Williams', email: 'taylor.williams@gmail.com', password: 'root', monthlyIncome: 4800 },
    { name: 'Morgan Brown', email: 'morgan.brown@gmail.com', password: 'root', monthlyIncome: 7000 },
    { name: 'Casey Davis', email: 'casey.davis@gmail.com', password: 'root', monthlyIncome: 5200 },
];

const MERCHANTS = [
    { name: 'Whole Foods', category: 'Groceries', subcategory: 'Food & Dining' },
    { name: 'Trader Joes', category: 'Groceries', subcategory: 'Food & Dining' },
    { name: 'Amazon', category: 'Shopping', subcategory: 'Shopping' },
    { name: 'Target', category: 'Shopping', subcategory: 'Shopping' },
    { name: 'Shell Gas', category: 'Gas', subcategory: 'Transportation' },
    { name: 'Chevron', category: 'Gas', subcategory: 'Transportation' },
    { name: 'Starbucks', category: 'Coffee', subcategory: 'Food & Dining' },
    { name: 'Chipotle', category: 'Restaurants', subcategory: 'Food & Dining' },
    { name: 'Panera Bread', category: 'Restaurants', subcategory: 'Food & Dining' },
    { name: 'Spotify', category: 'Streaming', subcategory: 'Entertainment' },
    { name: 'Netflix', category: 'Streaming', subcategory: 'Entertainment' },
    { name: 'CVS Pharmacy', category: 'Pharmacy', subcategory: 'Health' },
    { name: 'Planet Fitness', category: 'Gym', subcategory: 'Health' },
    { name: 'Uber', category: 'Transportation', subcategory: 'Transportation' },
    { name: 'Best Buy', category: 'Electronics', subcategory: 'Shopping' },
    { name: 'IKEA', category: 'Home Goods', subcategory: 'Shopping' },
    { name: 'Rent Payment', category: 'Rent', subcategory: 'Housing' },
    { name: 'Electric Company', category: 'Utilities', subcategory: 'Housing' },
    { name: 'Internet Provider', category: 'Internet', subcategory: 'Housing' },
    { name: 'State Farm', category: 'Insurance', subcategory: 'Transportation' },
];

async function main() {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await prisma.transaction.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.merchant.deleteMany({});
    await prisma.budget.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('✅ Cleared existing data');

    // Create merchants
    const merchantRecords = await Promise.all(
        MERCHANTS.map((merchant) =>
            prisma.merchant.create({
                data: merchant,
            })
        )
    );
    console.log(`✅ Created ${merchantRecords.length} merchants`);

    // Create users with accounts and transactions
    for (const userData of DEMO_USERS) {
        const passwordHash = await bcrypt.hash(userData.password, 10);

        const user = await prisma.user.create({
            data: {
                name: userData.name,
                email: userData.email,
                passwordHash,
                monthlyIncome: userData.monthlyIncome,
            },
        });

        // Create checking account
        const checkingBalance = 3000 + Math.random() * 7000; // $3k-$10k
        const checkingAccount = await prisma.account.create({
            data: {
                userId: user.id,
                type: 'Checking',
                nickname: 'Main Checking',
                balance: checkingBalance.toFixed(2),
            },
        });

        // Create savings account (optional, 70% chance)
        let savingsAccount = null;
        if (Math.random() > 0.3) {
            const savingsBalance = 1000 + Math.random() * 5000; // $1k-$6k
            savingsAccount = await prisma.account.create({
                data: {
                    userId: user.id,
                    type: 'Savings',
                    nickname: 'Savings Account',
                    balance: savingsBalance.toFixed(2),
                },
            });
        }

        // Generate transactions for the past 3 months
        const transactionsToCreate = [];
        const now = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);

        // Recurring monthly transactions (rent, utilities, subscriptions)
        const recurringTransactions = [
            { merchantName: 'Rent Payment', amount: 1500, day: 1, type: 'recurring' },
            { merchantName: 'Electric Company', amount: 150, day: 5, type: 'recurring' },
            { merchantName: 'Internet Provider', amount: 80, day: 10, type: 'recurring' },
            { merchantName: 'Spotify', amount: 11, day: 15, type: 'subscription' },
            { merchantName: 'Netflix', amount: 16, day: 15, type: 'subscription' },
            { merchantName: 'Planet Fitness', amount: 50, day: 1, type: 'subscription' },
            { merchantName: 'State Farm', amount: 150, day: 1, type: 'recurring' },
        ];

        for (let month = 0; month < 3; month++) {
            const monthDate = new Date();
            monthDate.setMonth(now.getMonth() - month);

            for (const recurring of recurringTransactions) {
                const merchant = merchantRecords.find((m: any) => m.name === recurring.merchantName);
                if (merchant) {
                    const transactionDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), recurring.day);
                    transactionsToCreate.push({
                        accountId: checkingAccount.id,
                        merchantId: merchant.id,
                        amount: recurring.amount,
                        description: `Monthly ${recurring.merchantName}`,
                        transactionDate,
                        status: 'completed',
                        type: recurring.type,
                    });
                }
            }
        }

        // Random weekly/daily transactions
        const variableTransactions = [
            { merchantName: 'Whole Foods', minAmount: 40, maxAmount: 120, frequency: 8 },
            { merchantName: 'Trader Joes', minAmount: 30, maxAmount: 80, frequency: 4 },
            { merchantName: 'Starbucks', minAmount: 5, maxAmount: 12, frequency: 20 },
            { merchantName: 'Chipotle', minAmount: 12, maxAmount: 25, frequency: 6 },
            { merchantName: 'Panera Bread', minAmount: 10, maxAmount: 18, frequency: 4 },
            { merchantName: 'Shell Gas', minAmount: 35, maxAmount: 60, frequency: 5 },
            { merchantName: 'Chevron', minAmount: 35, maxAmount: 55, frequency: 3 },
            { merchantName: 'Amazon', minAmount: 20, maxAmount: 150, frequency: 8 },
            { merchantName: 'Target', minAmount: 30, maxAmount: 120, frequency: 3 },
            { merchantName: 'CVS Pharmacy', minAmount: 15, maxAmount: 50, frequency: 2 },
            { merchantName: 'Uber', minAmount: 12, maxAmount: 35, frequency: 4 },
            { merchantName: 'Best Buy', minAmount: 50, maxAmount: 300, frequency: 1 },
            { merchantName: 'IKEA', minAmount: 40, maxAmount: 200, frequency: 1 },
        ];

        for (const variable of variableTransactions) {
            const merchant = merchantRecords.find((m: any) => m.name === variable.merchantName);
            if (merchant) {
                for (let i = 0; i < variable.frequency; i++) {
                    const daysAgo = Math.floor(Math.random() * 90);
                    const transactionDate = new Date();
                    transactionDate.setDate(now.getDate() - daysAgo);

                    const amount = variable.minAmount + Math.random() * (variable.maxAmount - variable.minAmount);

                    transactionsToCreate.push({
                        accountId: checkingAccount.id,
                        merchantId: merchant.id,
                        amount: parseFloat(amount.toFixed(2)),
                        description: variable.merchantName,
                        transactionDate,
                        status: 'completed',
                        type: 'day-to-day',
                    });
                }
            }
        }

        // Create all transactions
        await prisma.transaction.createMany({
            data: transactionsToCreate,
        });

        console.log(`✅ Created user ${user.email} with ${transactionsToCreate.length} transactions`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('Email: alex.johnson@gmail.com');
    console.log('Password: root');
    console.log('\n(All demo accounts use password: root)');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
