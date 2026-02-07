import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/transactions
 * Fetch all transactions for a user (requires userId query param for now)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required" },
                { status: 400 }
            );
        }

        // Fetch all transactions for user's accounts
        const transactions = await prisma.transaction.findMany({
            where: {
                account: {
                    userId: userId,
                },
            },
            include: {
                merchant: true,
            },
            orderBy: {
                transactionDate: "desc",
            },
        });

        // Convert Decimal to number for JSON serialization
        const serialized = transactions.map((t: any) => ({
            ...t,
            amount: Number(t.amount),
        }));

        return NextResponse.json(serialized);
    } catch (error) {
        console.error("Failed to fetch transactions:", error);
        return NextResponse.json(
            { error: "Failed to fetch transactions", details: String(error) },
            { status: 500 }
        );
    }
}

/**
 * POST /api/transactions
 * Create a new transaction
 */
export async function POST(request: NextRequest) {
    try {
        const { accountId, merchantId, amount, description, transactionDate } =
            await request.json();

        if (!accountId || !merchantId || !amount) {
            return NextResponse.json(
                { error: "accountId, merchantId, and amount are required" },
                { status: 400 }
            );
        }

        const transaction = await prisma.transaction.create({
            data: {
                accountId,
                merchantId,
                amount,
                description,
                transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
                status: "completed",
            },
            include: {
                merchant: true,
            },
        });

        const serialized = {
            ...transaction,
            amount: Number(transaction.amount),
        };

        return NextResponse.json(serialized, { status: 201 });
    } catch (error) {
        console.error("Failed to create transaction:", error);
        return NextResponse.json(
            { error: "Failed to create transaction", details: String(error) },
            { status: 500 }
        );
    }
}
