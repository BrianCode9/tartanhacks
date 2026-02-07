import prisma from "./prisma";
import { hashPassword, verifyPassword } from "./auth";
import { User, UserSession } from "./auth-types";

/**
 * Find a user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });

    return user as User | null;
}

/**
 * Find a user by ID
 */
export async function findUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
        where: { id },
    });

    return user as User | null;
}

/**
 * Create a new user with hashed password
 */
export async function createUser(
    name: string,
    email: string,
    password: string
): Promise<User> {
    // Check if user already exists
    const existing = await findUserByEmail(email);
    if (existing) {
        throw new Error("User with this email already exists");
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user and default checking account in a transaction
    const user = await prisma.user.create({
        data: {
            name,
            email: email.toLowerCase(),
            passwordHash,
            accounts: {
                create: {
                    type: "Checking",
                    nickname: "Main Checking",
                    balance: 5000, // Starting balance
                },
            },
        },
    });

    return user as User;
}

/**
 * Validate user credentials
 */
export async function validateCredentials(
    email: string,
    password: string
): Promise<User | null> {
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });

    if (!user) {
        return null;
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
        return null;
    }

    return user as User;
}

/**
 * Convert User to UserSession (exclude passwordHash)
 */
export function toUserSession(user: User): UserSession {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
    };
}
