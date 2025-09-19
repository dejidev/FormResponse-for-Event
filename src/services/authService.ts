import axios from "axios";

// Create the main API instance with interceptors
const api = axios.create({
    baseURL: import.meta.env.PROD
        ? "https://nithub-event-backend.onrender.com/api/v1"
        : "/api", // proxy in dev, full URL in prod
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

// 🔁 Axios interceptor to refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.log('❌ Request failed:', error.response?.status, error.config.url);

        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log('🔄 Attempting token refresh...');
            originalRequest._retry = true;

            try {
                // Dynamic import to avoid circular dependency
                const { useAuthStore } = await import("../store/auth-store");
                const { refreshToken } = useAuthStore.getState();
                const result = await refreshToken();

                console.log('🔄 Refresh result:', result);

                if (result.success) {
                    console.log('✅ Refresh successful, retrying original request');
                    return api(originalRequest); // retry request
                } else {
                    console.log('❌ Refresh failed, logging out');
                    useAuthStore.getState().logout();
                    return Promise.reject(error);
                }
            } catch (refreshError) {
                console.log('❌ Refresh error:', refreshError);
                // Dynamic import here too in case of error
                const { useAuthStore } = await import("../store/auth-store");
                useAuthStore.getState().logout();
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default api;