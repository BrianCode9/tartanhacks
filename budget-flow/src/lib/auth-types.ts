// User authentication types
export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    accountID: string;
}

export interface UserSession {
    id: string;
    name: string;
    email: string;
    accountID: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    accountID: string;
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
