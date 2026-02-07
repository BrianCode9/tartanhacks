import { NextRequest, NextResponse } from "next/server";
import { validateCredentials, toUserSession } from "@/lib/db";
import { LoginRequest, AuthResponse } from "@/lib/auth-types";

export async function POST(request: NextRequest) {
    try {
        const body: LoginRequest = await request.json();
        const { email, password } = body;

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: "Email and password are required" } as AuthResponse,
                { status: 400 }
            );
        }

        // Validate credentials
        const user = await validateCredentials(email, password);

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Invalid email or password" } as AuthResponse,
                { status: 401 }
            );
        }

        const userSession = toUserSession(user);

        return NextResponse.json(
            { success: true, user: userSession, message: "Login successful" } as AuthResponse,
            { status: 200 }
        );
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to login" } as AuthResponse,
            { status: 500 }
        );
    }
}
