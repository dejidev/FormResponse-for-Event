// src/components/auth/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";

/**
 * Use for routes that must be fully protected (e.g. admin dashboard).
 * Example:
 * <Route path="/admin" element={<ProtectedRoute><AdminPage/></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children }: { children: JSX.Element }) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const location = useLocation();

    if (!isAuthenticated) {
        // redirect to signin and include original location so we can come back afterwards
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    return children;
}
