

// src/store/participant-store.ts
import { create } from "zustand";
import type { AxiosResponse } from "axios";
import api from "../services/authService";
import { getErrorMessage } from "../utils/error";

export interface Participant {
    id: string;
    name: string;
    email: string;
    eventId: string;
    checkedIn: boolean;
    checkedInAt?: string | null;
    responses?: Record<string, string | string[]>;
    registeredAt: string;
}

export interface ParticipantsListResponse {
    body:
    | Participant[]
    | {
        participants?: Participant[];
        items?: Participant[]; // some APIs call it items
        total?: number;
        count?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
        hasNext?: boolean;
        hasPrev?: boolean;
    };
}

interface ParticipantStore {
    participants: Participant[];
    total: number;
    page: number;
    limit: number;
    isLoading: boolean;
    error: string | null;

    createParticipant: (
        payload: unknown
    ) => Promise<{ success: boolean; body?: Participant; error?: string }>;

    getParticipants: (
        eventId: string,
        page?: number,
        limit?: number
    ) => Promise<{ success: boolean; participants?: Participant[]; error?: string }>;

    getParticipantById: (
        id: string
    ) => Promise<{ success: boolean; participant?: Participant; error?: string }>;

    deleteParticipant: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const useParticipantStore = create<ParticipantStore>((set) => ({  ////I removed the get in here (set, get)
    participants: [],
    total: 0,
    page: 1,
    limit: 20,
    isLoading: false,
    error: null,

    createParticipant: async (payload) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post("/participants", payload);
            const created: Participant = res.data?.body || res.data;
            set((s) => ({
                participants: [created, ...s.participants],
                isLoading: false,
            }));
            return { success: true, body: created };
        } catch (err: unknown) {
            const msg = getErrorMessage(err);
            set({ error: msg, isLoading: false });
            return { success: false, error: msg };
        }
    },

    getParticipants: async (eventId, page = 1, limit = 2) => {
        if (!eventId) return { success: false, error: "Missing eventId" };
        set({ isLoading: true, error: null });
        try {
            const res: AxiosResponse<ParticipantsListResponse> = await api.get(
                `/participants/${eventId}?page=${page}&limit=${limit}`
            );

            const body = res.data?.body;
            let participantsArray: Participant[] = [];
            let total = 0;

            if (Array.isArray(body)) {
                participantsArray = body;
                total = body.length;
            } else if (body && Array.isArray(body.participants)) {
                participantsArray = body.participants;
                total = body.total ?? body.count ?? participantsArray.length;
            } else if (body && Array.isArray(body.items)) {
                participantsArray = body.items;
                total = body.total ?? participantsArray.length;
            } else {
                participantsArray = [];
                total = 0;
                console.warn("Unexpected participants response shape", res.data);
            }

            set({
                participants: participantsArray,
                total,
                page,
                limit,
                isLoading: false,
            });

            return { success: true, participants: participantsArray };
        } catch (err: unknown) {
            const msg = getErrorMessage(err);
            console.error("getParticipants error:", err);
            set({ error: msg, isLoading: false });
            return { success: false, error: msg };
        }
    },

    getParticipantById: async (id) => {
        if (!id) return { success: false, error: "Missing id" };
        set({ isLoading: true, error: null });
        try {
            const res = await api.get(`/participants/${id}`);
            const part: Participant = res.data?.body || res.data;
            set({ isLoading: false });
            return { success: true, participant: part };
        } catch (err: unknown) {
            const msg = getErrorMessage(err);
            set({ error: msg, isLoading: false });
            return { success: false, error: msg };
        }
    },

    deleteParticipant: async (id) => {
        if (!id) return { success: false, error: "Missing id" };
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/participants/${id}`);
            set((s) => ({
                participants: s.participants.filter((p) => p.id !== id),
                isLoading: false,
            }));
            return { success: true };
        } catch (err: unknown) {
            const msg = getErrorMessage(err);
            set({ error: msg, isLoading: false });
            return { success: false, error: msg };
        }
    },
}));
