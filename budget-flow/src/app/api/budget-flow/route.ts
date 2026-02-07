import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/budget-flow - Fetch budget flow for current month
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const month = searchParams.get("month");
        const year = searchParams.get("year");

        if (!userId) {
            return NextResponse.json({ error: "userId is required" }, { status: 400 });
        }

        // Use current month/year if not specified
        const now = new Date();
        const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
        const targetYear = year ? parseInt(year) : now.getFullYear();

        const budgetFlow = await prisma.budgetFlow.findUnique({
            where: {
                userId_month_year: {
                    userId,
                    month: targetMonth,
                    year: targetYear,
                },
            },
            include: {
                nodes: {
                    orderBy: { order: "asc" },
                },
                links: {
                    include: {
                        source: true,
                        target: true,
                    },
                },
            },
        });

        return NextResponse.json(budgetFlow || null);
    } catch (error) {
        console.error("Error fetching budget flow:", error);
        return NextResponse.json(
            { error: "Failed to fetch budget flow" },
            { status: 500 }
        );
    }
}

// POST /api/budget-flow - Save/update budget flow
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, month, year, nodes, links } = body;

        if (!userId || !month || !year) {
            return NextResponse.json(
                { error: "userId, month, and year are required" },
                { status: 400 }
            );
        }

        // Upsert budget flow
        const budgetFlow = await prisma.budgetFlow.upsert({
            where: {
                userId_month_year: {
                    userId,
                    month,
                    year,
                },
            },
            update: {
                updatedAt: new Date(),
            },
            create: {
                userId,
                month,
                year,
            },
        });

        // Delete existing nodes and links (cascade will handle links via nodes)
        await prisma.budgetFlowNode.deleteMany({
            where: { budgetFlowId: budgetFlow.id },
        });

        // Create new nodes
        const createdNodes = await Promise.all(
            nodes.map((node: any) =>
                prisma.budgetFlowNode.create({
                    data: {
                        budgetFlowId: budgetFlow.id,
                        name: node.name,
                        type: node.type,
                        amount: node.amount,
                        color: node.color,
                        order: node.order || 0,
                    },
                })
            )
        );

        // Create a map of temporary node IDs to actual UUIDs
        const nodeIdMap = new Map();
        nodes.forEach((node: any, index: number) => {
            nodeIdMap.set(node.id || node.name, createdNodes[index].id);
        });

        // Create new links using the mapped IDs
        if (links && links.length > 0) {
            await Promise.all(
                links.map((link: any) =>
                    prisma.budgetFlowLink.create({
                        data: {
                            budgetFlowId: budgetFlow.id,
                            sourceId: nodeIdMap.get(link.sourceId || link.source),
                            targetId: nodeIdMap.get(link.targetId || link.target),
                            amount: link.amount,
                        },
                    })
                )
            );
        }

        // Fetch complete budget flow with relations
        const updatedBudgetFlow = await prisma.budgetFlow.findUnique({
            where: { id: budgetFlow.id },
            include: {
                nodes: {
                    orderBy: { order: "asc" },
                },
                links: {
                    include: {
                        source: true,
                        target: true,
                    },
                },
            },
        });

        return NextResponse.json(updatedBudgetFlow);
    } catch (error) {
        console.error("Error saving budget flow:", error);
        return NextResponse.json(
            { error: "Failed to save budget flow" },
            { status: 500 }
        );
    }
}

// DELETE /api/budget-flow - Delete budget flow
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const month = searchParams.get("month");
        const year = searchParams.get("year");

        if (!userId || !month || !year) {
            return NextResponse.json(
                { error: "userId, month, and year are required" },
                { status: 400 }
            );
        }

        await prisma.budgetFlow.delete({
            where: {
                userId_month_year: {
                    userId,
                    month: parseInt(month),
                    year: parseInt(year),
                },
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting budget flow:", error);
        return NextResponse.json(
            { error: "Failed to delete budget flow" },
            { status: 500 }
        );
    }
}
