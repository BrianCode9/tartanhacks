import { NextRequest, NextResponse } from "next/server";
import { findUserById, toUserSession } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
    try {
        // Get user ID from cookie
        const cookieStore = await cookies();
        const userId = cookieStore.get("user_id")?.value;

        if (!userId) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        // Find user
        const user = findUserById(userId);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const userSession = toUserSession(user);

        return NextResponse.json(userSession, { status: 200 });
    } catch (error) {
        console.error("Get user error:", error);
        return NextResponse.json(
            { error: "Failed to get user" },
            { status: 500 }
        );
    }
}
