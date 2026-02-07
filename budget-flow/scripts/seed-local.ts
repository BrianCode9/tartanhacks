import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });
dotenv.config(); // Fallback to .env

const prisma = new PrismaClient();

// Define the expected format for the input JSON
interface ImportData {
    user: {
        email: string;
        name: string;
        monthlyIncome?: number;
    };
    transactions: {
        date: string;
        merchant: string;
        amount: number;
        category: string;
        description?: string;
    }[];
}

async function main() {
    const dataPath = path.join(process.cwd(), "data", "import.json");

    if (!fs.existsSync(dataPath)) {
        console.error(`\n❌ File not found: ${dataPath}`);
        console.log("Please create this file with your data to import it.\n");
        process.exit(1);
    }

    const rawData = fs.readFileSync(dataPath, "utf-8");
    const data: ImportData = JSON.parse(rawData);

    console.log(`\n🌱 Starting import for user: ${data.user.email}`);

    // 1. Create or Get User
    const user = await prisma.user.upsert({
        where: { email: data.user.email },
        update: {},
        create: {
            email: data.user.email,
            name: data.user.name,
            passwordHash: "$2a$10$YourHashedPasswordHere", // Placeholder, in real app use bcrypt
            monthlyIncome: data.user.monthlyIncome || 5000,
            accounts: {
                create: {
                    type: "Checking",
                    nickname: "Main Checking",
                    balance: 0,
                },
            },
        },
        include: { accounts: true },
    });

    const account = user.accounts[0];
    if (!account) {
        throw new Error("User has no account to import transactions into.");
    }

    console.log(`✅ User loaded: ${user.name} (${user.id})`);

    // 2. Process Transactions
    console.log(`\n📦 Processing ${data.transactions.length} transactions...`);

    for (const tx of data.transactions) {
        // 2a. Find or Create Merchant
        const merchant = await prisma.merchant.upsert({
            where: {
                // We don't have a unique name constraint in schema, so we stick to findFirst/create
                // But for upsert we need a unique ID.
                // Let's use findFirst then create if not exists
                id: "placeholder"
            },
            update: {},
            create: {
                name: tx.merchant,
                category: tx.category
            }
        }).catch(() => null); // upsert requires unique, which name isn't.

        // Correct approach for non-unique field "name":
        let dbMerchant = await prisma.merchant.findFirst({
            where: { name: tx.merchant },
        });

        if (!dbMerchant) {
            dbMerchant = await prisma.merchant.create({
                data: {
                    name: tx.merchant,
                    category: tx.category,
                },
            });
        }

        // 2b. Create Transaction
        await prisma.transaction.create({
            data: {
                accountId: account.id,
                merchantId: dbMerchant.id,
                amount: tx.amount,
                transactionDate: new Date(tx.date),
                description: tx.description || tx.category,
                status: "completed",
            },
        });
    }

    console.log(`\n✨ Successfully imported ${data.transactions.length} transactions!`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
