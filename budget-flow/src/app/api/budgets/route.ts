import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/budgets?userId=...
 * Fetch all budget allocations for a user
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

        const budgets = await prisma.budget.findMany({
            where: { userId },
            orderBy: { category: 'asc' }
        });

        // Serialize Decimal fields to numbers
        const serialized = budgets.map(budget => ({
            id: budget.id,
            userId: budget.userId,
            category: budget.category,
            budgeted: Number(budget.budgeted),
            createdAt: budget.createdAt,
            updatedAt: budget.updatedAt
        }));

        return NextResponse.json(serialized);
    } catch (error) {
        console.error("Failed to fetch budgets:", error);
        return NextResponse.json(
            { error: "Failed to fetch budgets" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/budgets
 * Create or update budget allocations (upsert)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, budgets } = body;

        if (!userId || !Array.isArray(budgets)) {
            return NextResponse.json(
                { error: "userId and budgets array required" },
                { status: 400 }
            );
        }

        // Upsert each budget category
        const results = await Promise.all(
            budgets.map((budget: { category: string; budgeted: number }) =>
                prisma.budget.upsert({
                    where: {
                        userId_category: {
                            userId,
                            category: budget.category
                        }
                    },
                    update: {
                        budgeted: budget.budgeted
                    },
                    create: {
                        userId,
                        category: budget.category,
                        budgeted: budget.budgeted
                    }
                })
            )
        );

        // Serialize results
        const serialized = results.map(budget => ({
            id: budget.id,
            userId: budget.userId,
            category: budget.category,
            budgeted: Number(budget.budgeted),
            createdAt: budget.createdAt,
            updatedAt: budget.updatedAt
        }));

        return NextResponse.json(serialized, { status: 200 });
    } catch (error) {
        console.error("Failed to save budgets:", error);
        return NextResponse.json(
            { error: "Failed to save budgets" },
            { status: 500 }
        );
    }
}
