import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/accounts
 * Fetch all accounts for a user (requires userId query param)
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

        const accounts = await prisma.account.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        // Convert Decimal to number for JSON serialization
        const serialized = accounts.map((account: any) => ({
            ...account,
            balance: Number(account.balance),
        }));

        return NextResponse.json(serialized);
    } catch (error) {
        console.error("Failed to fetch accounts:", error);
        return NextResponse.json(
            { error: "Failed to fetch accounts", details: String(error) },
            { status: 500 }
        );
    }
}

/**
 * POST /api/accounts
 * Create a new account for a user
 */
export async function POST(request: NextRequest) {
    try {
        const { userId, type, nickname, balance } = await request.json();

        if (!userId || !type || !nickname) {
            return NextResponse.json(
                { error: "userId, type, and nickname are required" },
                { status: 400 }
            );
        }

        const account = await prisma.account.create({
            data: {
                userId,
                type,
                nickname,
                balance: balance || 0,
            },
        });

        const serialized = {
            ...account,
            balance: Number(account.balance),
        };

        return NextResponse.json(serialized, { status: 201 });
    } catch (error) {
        console.error("Failed to create account:", error);
        return NextResponse.json(
            { error: "Failed to create account", details: String(error) },
            { status: 500 }
        );
    }
}
