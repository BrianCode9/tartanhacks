import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/planned-events?userId=...
 * Fetch all planned events for a user
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

        const events = await prisma.plannedEvent.findMany({
            where: { userId },
            orderBy: { date: 'asc' }
        });

        // Serialize Decimal fields to numbers
        const serialized = events.map(event => ({
            ...event,
            estimatedCost: Number(event.estimatedCost)
        }));

        return NextResponse.json(serialized);
    } catch (error) {
        console.error("Failed to fetch planned events:", error);
        return NextResponse.json(
            { error: "Failed to fetch planned events" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/planned-events
 * Create a new planned event
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, name, date, estimatedCost, category, notes } = body;

        if (!userId || !name || !date || estimatedCost === undefined) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const event = await prisma.plannedEvent.create({
            data: {
                userId,
                name,
                date: new Date(date),
                estimatedCost,
                category: category || 'other',
                notes
            }
        });

        // Serialize Decimal to number
        const serialized = {
            ...event,
            estimatedCost: Number(event.estimatedCost)
        };

        return NextResponse.json(serialized, { status: 201 });
    } catch (error) {
        console.error("Failed to create planned event:", error);
        return NextResponse.json(
            { error: "Failed to create planned event" },
            { status: 500 }
        );
    }
}
