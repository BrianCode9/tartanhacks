// User authentication types
export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    monthlyIncome?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserSession {
    id: string;
    name: string;
    email: string;
    monthlyIncome?: number;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    user?: UserSession;
}
