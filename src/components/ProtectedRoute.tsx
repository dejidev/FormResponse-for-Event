// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, isLoading } = useAuthStore();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen bg-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying access...</p>
                </div>
            </div>
        );
    }

    // If not authenticated, redirect to auth page with return URL
    if (!user) {
        // Store the current path (including eventId) as the return URL
        const returnUrl = location.pathname + location.search;
        return (
            <Navigate
                to={`/auth/signin?returnUrl=${encodeURIComponent(returnUrl)}`}
                replace
            />
        );
    }

    // User is authenticated, render the protected content
    return <>{children}</>;
}