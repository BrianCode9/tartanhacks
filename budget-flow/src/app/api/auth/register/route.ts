import { NextRequest, NextResponse } from "next/server";
import { createUser, toUserSession } from "@/lib/db";
import { RegisterRequest, AuthResponse } from "@/lib/auth-types";

export async function POST(request: NextRequest) {
    try {
        const body: RegisterRequest = await request.json();
        const { name, email, password, accountID } = body;

        // Validate input
        if (!name || !email || !password || !accountID) {
            return NextResponse.json(
                { success: false, message: "Name, email, password, and accountID are required" } as AuthResponse,
                { status: 400 }
            );
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, message: "Invalid email format" } as AuthResponse,
                { status: 400 }
            );
        }

        // Create user with provided accountID
        const user = createUser(name, email, password, accountID);
        const userSession = toUserSession(user);

        return NextResponse.json(
            { success: true, user: userSession, message: "User created successfully" } as AuthResponse,
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof Error && error.message.includes("already exists")) {
            return NextResponse.json(
                { success: false, message: "User with this email already exists" } as AuthResponse,
                { status: 409 }
            );
        }

        console.error("Registration error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to create user" } as AuthResponse,
            { status: 500 }
        );
    }
}
