

// ==========================================
// 📁 src/store/auth-store.ts
// ==========================================
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { type AxiosResponse } from "axios";
import type {
    User,
    LoginCredentials,
    SignupData,
    AuthStore,
    ApiResponse,
    ApiError,
} from "../types/auth-types";

// Create a separate axios instance ONLY for refresh calls (no interceptors!)
const refreshApi = axios.create({
    baseURL: import.meta.env.PROD
        ? "https://nithub-event-backend.onrender.com/api/v1"
        : "/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // 🔐 Signup
            signup: async (userData: SignupData) => {
                set({ isLoading: true, error: null });
                try {
                    // Dynamic import to avoid circular dependency
                    const { default: api } = await import("../services/authService");
                    const response: AxiosResponse<ApiResponse<User>> = await api.post(
                        "/auth/signup",
                        userData
                    );

                    const user = response.data.user || response.data.data;
                    if (!user) throw new Error("No user data received from server");

                    set({ user, isAuthenticated: true, isLoading: false });
                    return { success: true, user };
                } catch (err: unknown) {
                    let errorMessage = "Signup failed. Please try again.";

                    if (err && typeof err === "object" && "isAxiosError" in err) {
                        const axiosErr = err as ApiError;
                        errorMessage = axiosErr.response?.data?.error || axiosErr.message;
                    } else if (err instanceof Error) {
                        errorMessage = err.message;
                    }

                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: errorMessage,
                    });
                    return { success: false, error: errorMessage };
                }
            },

            // 🔐 Login
            login: async (credentials: LoginCredentials) => {
                set({ isLoading: true, error: null });
                try {
                    // Dynamic import to avoid circular dependency
                    const { default: api } = await import("../services/authService");
                    const response: AxiosResponse<{ message: string; user?: User }> =
                        await api.post("/auth/login", credentials);

                    if (response.data.message === "Logged in") {
                        set({
                            user: response.data.user ?? true, // backend may not return full user
                            isAuthenticated: true,
                            isLoading: false,
                        });
                        return { success: true };
                    } else {
                        throw new Error(response.data.message || "Login failed");
                    }
                } catch (err: unknown) {
                    let errorMessage = "Login failed. Please check your credentials.";

                    if (err && typeof err === "object" && "isAxiosError" in err) {
                        const axiosErr = err as ApiError;
                        errorMessage = axiosErr.response?.data?.error || axiosErr.message;
                    } else if (err instanceof Error) {
                        errorMessage = err.message;
                    }

                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: errorMessage,
                    });
                    return { success: false, error: errorMessage };
                }
            },

            // 🔓 Logout
            logout: async () => {
                set({ isLoading: true });
                try {
                    // Dynamic import to avoid circular dependency
                    const { default: api } = await import("@/services/authService");
                    await api.post("/auth/logout");
                } finally {
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    });
                }
                return { success: true };
            },

            // 🔄 Refresh - CRITICAL: Uses separate API instance to avoid circular calls
            refreshToken: async () => {
                try {
                    console.log('🔄 Attempting token refresh...');

                    // Use refreshApi (no interceptors) to avoid infinite recursion
                    const response: AxiosResponse<ApiResponse<User>> = await refreshApi.post(
                        "/auth/refresh",
                        {}
                    );

                    const user = response.data.user || response.data.data;
                    if (!user) throw new Error("No user data received from refresh");

                    console.log('✅ Token refresh successful');
                    set({ user, isAuthenticated: true, error: null });
                    return { success: true, user };
                } catch (err: unknown) {
                    console.log('❌ Token refresh failed:', err);
                    let errorMessage = "Session expired";

                    if (err && typeof err === "object" && "isAxiosError" in err) {
                        const axiosErr = err as ApiError;
                        errorMessage = axiosErr.response?.data?.error || axiosErr.message;
                    } else if (err instanceof Error) {
                        errorMessage = err.message;
                    }

                    set({ user: null, isAuthenticated: false, error: errorMessage });
                    return { success: false, error: errorMessage };
                }
            },

            clearError: () => set({ error: null }),

            // 🚀 Initialize auth on app load
            initializeAuth: async () => {
                const { refreshToken } = get();
                await refreshToken();
            },
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
