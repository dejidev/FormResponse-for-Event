// import { create } from "zustand";
// import type { AxiosResponse } from "axios";
// import api from "@/services/authService";

// // ---------- Types ---------- //
// export interface Form {
//     id: string;
//     createdAt: string;
//     // Later we’ll add fields[] once you start adding form fields
// }

// export interface FormResponse {
//     message: string;
//     body: Form;
// }

// interface FormStore {
//     form: Form | null;
//     isLoading: boolean;
//     error: string | null;

//     createForm: (eventId: string) => Promise<{ success: boolean; form?: Form; error?: string }>;
//     getFormById: (id: string) => Promise<{ success: boolean; form?: Form; error?: string }>;
//     deleteForm: (id: string) => Promise<{ success: boolean; error?: string }>;
// }

// // ---------- Store Implementation ---------- //
// export const useFormStore = create<FormStore>((set) => ({
//     form: null,
//     isLoading: false,
//     error: null,

//     createForm: async (eventId) => {
//         set({ isLoading: true, error: null });
//         try {
//             const res: AxiosResponse<FormResponse> = await api.post("/forms", { eventId });
//             set({ form: res.data.body, isLoading: false });
//             return { success: true, form: res.data.body };
//         } catch (error: any) {
//             const errorMsg =
//                 error?.response?.data?.message ||
//                 error.message ||
//                 "Failed to create form.";
//             set({ error: errorMsg, isLoading: false });
//             return { success: false, error: errorMsg };
//         }
//     },

//     getFormById: async (id) => {
//         set({ isLoading: true, error: null });
//         try {
//             const res: AxiosResponse<FormResponse> = await api.get(`/forms/${id}`);
//             set({ form: res.data.body, isLoading: false });
//             return { success: true, form: res.data.body };
//         } catch (error: any) {
//             const errorMsg =
//                 error?.response?.data?.message ||
//                 error.message ||
//                 "Failed to fetch form.";
//             set({ error: errorMsg, isLoading: false });
//             return { success: false, error: errorMsg };
//         }
//     },

//     deleteForm: async (id) => {
//         set({ isLoading: true, error: null });
//         try {
//             await api.delete(`/forms/${id}`);
//             set({ form: null, isLoading: false });
//             return { success: true };
//         } catch (error: any) {
//             const errorMsg =
//                 error?.response?.data?.message ||
//                 error.message ||
//                 "Failed to delete form.";
//             set({ error: errorMsg, isLoading: false });
//             return { success: false, error: errorMsg };
//         }
//     },
// }));




















import { create } from "zustand";
import type { AxiosResponse } from "axios";
import api from "../services/authService";
import { getErrorMessage } from "../utils/error";


// ---------- Types ---------- //
export interface Form {
    id: string;
    createdAt: string;
    // Later we’ll add fields[] once you start adding form fields
}

export interface FormResponse {
    message: string;
    body: Form;
}

interface FormStore {
    form: Form | null;
    isLoading: boolean;
    error: string | null;

    createForm: (
        eventId: string
    ) => Promise<{ success: boolean; form?: Form; error?: string }>;

    getFormById: (
        id: string
    ) => Promise<{ success: boolean; form?: Form; error?: string }>;

    deleteForm: (id: string) => Promise<{ success: boolean; error?: string }>;
}

// ---------- Store Implementation ---------- //
export const useFormStore = create<FormStore>((set) => ({
    form: null,
    isLoading: false,
    error: null,

    createForm: async (eventId) => {
        set({ isLoading: true, error: null });
        try {
            const res: AxiosResponse<FormResponse> = await api.post("/forms", {
                eventId,
            });
            set({ form: res.data.body, isLoading: false });
            return { success: true, form: res.data.body };
        } catch (error: unknown) {
            const errorMsg = getErrorMessage(error);
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    getFormById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const res: AxiosResponse<FormResponse> = await api.get(`/forms/${id}`);
            set({ form: res.data.body, isLoading: false });
            return { success: true, form: res.data.body };
        } catch (error: unknown) {
            const errorMsg = getErrorMessage(error);
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },

    deleteForm: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/forms/${id}`);
            set({ form: null, isLoading: false });
            return { success: true };
        } catch (error: unknown) {
            const errorMsg = getErrorMessage(error);
            set({ error: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
        }
    },
}));
