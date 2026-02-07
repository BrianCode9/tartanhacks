import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/merchants
 * Fetch all merchants (optionally filtered by category)
 */
export async function GET() {
    try {
        const merchants = await prisma.merchant.findMany({
            orderBy: {
                name: "asc",
            },
        });

        return NextResponse.json(merchants);
    } catch (error) {
        console.error("Failed to fetch merchants:", error);
        return NextResponse.json(
            { error: "Failed to fetch merchants", details: String(error) },
            { status: 500 }
        );
    }
}
