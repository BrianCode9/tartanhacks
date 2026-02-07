"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
    monthlyIncome?: number;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    isLoading: boolean;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUserState] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('budgetflow_user');
        if (storedUser) {
            try {
                setUserState(JSON.parse(storedUser));
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                localStorage.removeItem('budgetflow_user');
            }
        }
        setIsLoading(false);
    }, []);

    const setUser = (newUser: User | null) => {
        setUserState(newUser);
        if (newUser) {
            localStorage.setItem('budgetflow_user', JSON.stringify(newUser));
        } else {
            localStorage.removeItem('budgetflow_user');
        }
    };

    const logout = () => {
        setUser(null);
        window.location.href = '/';
    };

    return (
        <UserContext.Provider value={{ user, setUser, isLoading, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
