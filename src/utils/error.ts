import { AxiosError } from "axios";

export function getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
        return (
            (error.response?.data as { message?: string; error?: string })?.message ||
            (error.response?.data as { message?: string; error?: string })?.error ||
            error.message
        );
    }
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === "string") {
        return error;
    }
    return "An unexpected error occurred.";
}
