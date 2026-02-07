import { User, UserSession } from "./auth-types";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// Ensure data directory exists
function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

// Read all users from the database
export function readUsers(): User[] {
    ensureDataDir();

    if (!fs.existsSync(USERS_FILE)) {
        return [];
    }

    try {
        const data = fs.readFileSync(USERS_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading users file:", error);
        return [];
    }
}

// Write users to the database
function writeUsers(users: User[]): void {
    ensureDataDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

// Find a user by email
export function findUserByEmail(email: string): User | null {
    const users = readUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

// Find a user by ID
export function findUserById(id: string): User | null {
    const users = readUsers();
    return users.find((u) => u.id === id) || null;
}

// Create a new user
export function createUser(name: string, email: string, password: string, accountID: string): User {
    const users = readUsers();

    // Check if email already exists
    if (findUserByEmail(email)) {
        throw new Error("User with this email already exists");
    }

    const newUser: User = {
        id: randomUUID(),
        name,
        email,
        password, // Plain text as requested
        accountID, // Use provided Nessie account ID
    };

    users.push(newUser);
    writeUsers(users);

    return newUser;
}

// Validate user credentials
export function validateCredentials(email: string, password: string): User | null {
    const user = findUserByEmail(email);

    if (!user) {
        return null;
    }

    // Direct password comparison (no hashing)
    if (user.password === password) {
        return user;
    }

    return null;
}

// Convert User to UserSession (exclude password)
export function toUserSession(user: User): UserSession {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        accountID: user.accountID,
    };
}
