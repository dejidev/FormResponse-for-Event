

import { create } from "zustand";
import api from "@/services/authService";
import { getErrorMessage } from "@/utils/error";

export type FieldType = "TEXT" | "MCQ" | "CHECKBOX" | "DROPDOWN";

export interface FormField {
    id: string;
    label: string;
    required: boolean;
    type: FieldType;
    options: string[];
    formId: string;
    createdAt: string;
}

interface FormFieldStore {
    fields: FormField[];
    isLoading: boolean;
    error: string | null;

    addField: (data: {
        formId: string;
        label: string;
        type: FieldType;
        required: boolean;
        options?: string[];
    }) => Promise<{ success: boolean; field?: FormField; error?: string }>;

    getForm: (
        formId: string
    ) => Promise<{ success: boolean; form?: unknown; error?: string }>;

    updateField: (
        id: string,
        updates: Partial<FormField>
    ) => Promise<{ success: boolean; field?: FormField; error?: string }>;

    deleteField: (
        fieldId: string
    ) => Promise<{ success: boolean; error?: string }>;
}

export const useFormFieldStore = create<FormFieldStore>((set) => ({
    fields: [],
    isLoading: false,
    error: null,

    addField: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post("/forms/field", data);
            set((state) => ({
                fields: [...state.fields, res.data.body],
                isLoading: false,
            }));
            return { success: true, field: res.data.body };
        } catch (error: unknown) {
            const msg = getErrorMessage(error);
            set({ error: msg, isLoading: false });
            return { success: false, error: msg };
        }
    },

    getForm: async (formId) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get(`/forms/${formId}`);
            set({ fields: res.data.body.fields || [], isLoading: false });
            return { success: true, form: res.data.body };
        } catch (error: unknown) {
            const msg = getErrorMessage(error);
            set({ error: msg, isLoading: false });
            return { success: false, error: msg };
        }
    },

    updateField: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.patch(`/forms/field/${id}`, updates);
            const updatedField = res.data.body;

            set((state) => ({
                fields: state.fields.map((f) =>
                    f.id === id ? { ...f, ...updatedField } : f
                ),
                isLoading: false,
            }));

            return { success: true, field: updatedField };
        } catch (error: unknown) {
            const msg = getErrorMessage(error);
            set({ error: msg, isLoading: false });
            return { success: false, error: msg };
        }
    },

    deleteField: async (fieldId) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/forms/field/${fieldId}`);
            set((state) => ({
                fields: state.fields.filter((f) => f.id !== fieldId),
                isLoading: false,
            }));
            return { success: true };
        } catch (error: unknown) {
            const msg = getErrorMessage(error);
            set({ error: msg, isLoading: false });
            return { success: false, error: msg };
        }
    },
}));
