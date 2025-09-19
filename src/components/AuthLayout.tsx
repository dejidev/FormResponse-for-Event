import { Navigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    const { user, isLoading } = useAuthStore();
    const [searchParams] = useSearchParams();

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen bg-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // If already authenticated, redirect to return URL or dashboard
    if (user) {
        const returnUrl = searchParams.get('returnUrl');
        if (returnUrl) {
            return <Navigate to={decodeURIComponent(returnUrl)} replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    // User is not authenticated, show auth form
    return (
        <div className="min-h-screen bg-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                {children}
            </div>
        </div>
    );
}