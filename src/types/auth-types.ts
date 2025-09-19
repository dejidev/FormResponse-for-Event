import type { AxiosError } from "axios";

// types/auth.ts
export interface User {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    createdAt?: string;
    updatedAt?: string;
    // Add other user properties based on your backend response
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupData {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
}

export interface AuthResponse {
    success: boolean;
    user?: User;
    message?: string;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    user?: User;
}

export interface AuthState {
    user: User | null | true;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface AuthActions {
    signup: (userData: SignupData) => Promise<{ success: boolean; user?: User; error?: string }>;
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; user?: User; error?: string }>;
    logout: () => Promise<{ success: boolean; error?: string }>;
    refreshToken: () => Promise<{ success: boolean; user?: User; error?: string }>;
    clearError: () => void;
    initializeAuth: () => Promise<void>;
}

export type AuthStore = AuthState & AuthActions;









//Error
export interface ErrorResponse {
    error: string;
}

export type ApiError = AxiosError<ErrorResponse>;