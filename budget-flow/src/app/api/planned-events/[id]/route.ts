import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * DELETE /api/planned-events/[id]
 * Delete a planned event
 */
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        await prisma.plannedEvent.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete planned event:", error);
        return NextResponse.json(
            { error: "Failed to delete planned event" },
            { status: 500 }
        );
    }
}
