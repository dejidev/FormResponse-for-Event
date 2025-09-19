import { create } from "zustand";
import type { AxiosResponse } from "axios";
import api from "@/services/authService";
import { getErrorMessage } from "@/utils/error";

// ---------- Types ---------- //
export type EventType = "PHYSICAL" | "VIRTUAL" | "HYBRID";

export type EventStatus = "LIVE" | "DRAFT" | "ENDED" | "CANCELLED";

export interface Creator {
    id: string;
    firstname: string;
    lastname: string;
}

export interface Event {
    id: string;
    name: string;
    description: string;
    type: EventType;
    isMultiDay: boolean;
    date: string | null; // single-day
    startDate: string | null; // multi-day start
    endDate: string | null; // multi-day end
    dailyStartTime: string | null;
    dailyEndTime: string | null;
    enableQrCodes: boolean;
    sendConfEmail?: boolean;
    bannerImageUrl: string | null;
    status: EventStatus;
    formId?: string | null;
    creatorId: string;
    capacity?: number;
    location?: string | null; // required if PHYSICAL or HYBRID
    virtualLink?: string | null; // required if VIRTUAL or HYBRID
    createdAt: string;
    creator?: Creator;
}

// ---------- DTOs ---------- //
interface BaseEventDto {
    name: string;
    description: string;
    type: EventType;
    enableQrCodes: boolean;
    bannerImageUrl: string;
    status: "LIVE" | "DRAFT";
    startDate?: string | null;
    endDate: string | null;
    location?: string;     // required if PHYSICAL or HYBRID
    virtualLink?: string;  // required if VIRTUAL or HYBRID
}

export interface CreateSingleDayEventDto extends BaseEventDto {
    isMultiDay: false;
    date: string; // ISO datetime
}

export interface CreateMultiDayEventDto extends BaseEventDto {
    isMultiDay: true;
    // startDate: string;
    // endDate: string;
    dailyStartTime: string; // "HH:mm"
    dailyEndTime: string;   // "HH:mm"
}

export type CreateEventDto = CreateSingleDayEventDto | CreateMultiDayEventDto;

// ---------- API Response Types ---------- //
export interface EventResponse {
    message: string;
    body: Event;
}

export interface EventsListResponse {
    body: {
        events: Event[];
        count: number;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface Pagination {
    count: number;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

// ---------- Store Interface ---------- //
interface EventStore {
    events: Event[];
    pagination: Pagination | null;
    isLoading: boolean;
    error: string | null;

    getEvents: (
        page?: number,
        limit?: number
    ) => Promise<{ success: boolean; events?: Event[]; error?: string }>;

    getEventById: (
        id: string
    ) => Promise<{ success: boolean; event?: Event; error?: string }>;

    createEvent: (
        data: CreateEventDto
    ) => Promise<{ success: boolean; event?: Event; error?: string }>;

    updateEvent: (
        id: string,
        data: Partial<CreateEventDto>
    ) => Promise<{ success: boolean; event?: Event; error?: string }>;

    deleteEvent: (
        id: string
    ) => Promise<{ success: boolean; error?: string }>;
}

// ---------- Store Implementation ---------- //
export const useEventStore = create<EventStore>((set) => ({  //I removed the get in here (set, get)
    events: [],
    pagination: null,
    isLoading: false,
    error: null,

    getEvents: async (page = 1, limit = 20) => {
        set({ isLoading: true, error: null });
        try {
            const response: AxiosResponse<EventsListResponse> = await api.get(
                `/events/?page=${page}&limit=${limit}`
            );

            set({
                events: response.data.body.events,
                pagination: {
                    count: response.data.body.count,
                    total: response.data.body.total,
                    page: response.data.body.page,
                    limit: response.data.body.limit,
                    totalPages: response.data.body.totalPages,
                    hasNext: response.data.body.hasNext,
                    hasPrev: response.data.body.hasPrev,
                },
                isLoading: false,
            });

            return { success: true, events: response.data.body.events };
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error);
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }

        // catch (error: any) {
        //   const errorMessage =
        //     error.response?.data?.message ||
        //     error.message ||
        //     "Failed to fetch events.";
        //   set({ error: errorMessage, isLoading: false });
        //   return { success: false, error: errorMessage };
        // }
    },

    getEventById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const response: AxiosResponse<EventResponse> = await api.get(
                `/events/${id}`,
                { withCredentials: true }
            );
            return { success: true, event: response.data.body };
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error);
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }

        // catch (error: any) {
        //   const errMsg =
        //     error?.response?.data?.error ||
        //     error?.response?.data?.message ||
        //     error?.message ||
        //     "Failed to fetch event.";
        //   console.error("getEventById error:", error?.response || error);
        //   set({ error: errMsg, isLoading: false });
        //   return { success: false, error: errMsg };
        // } 
        finally {
            set({ isLoading: false });
        }
    },

    createEvent: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response: AxiosResponse<EventResponse> = await api.post(
                "/events",
                data
            );

            set((state) => ({
                events: [response.data.body, ...state.events],
                isLoading: false,
            }));

            return { success: true, event: response.data.body };
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error);
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }

        // catch (error: any) {
        //   const errorMessage =
        //     error.response?.data?.message ||
        //     error.message ||
        //     "Failed to create event.";
        //   set({ error: errorMessage, isLoading: false });
        //   return { success: false, error: errorMessage };
        // }
    },

    updateEvent: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const response: AxiosResponse<EventResponse> = await api.patch(
                `/events/${id}`,
                data
            );

            set((state) => ({
                events: state.events.map((event) =>
                    event.id === id ? response.data.body : event
                ),
                isLoading: false,
            }));

            return { success: true, event: response.data.body };
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error);
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }

        // catch (error: any) {
        //   const errorMessage =
        //     error.response?.data?.message ||
        //     error.message ||
        //     "Failed to update event.";
        //   set({ error: errorMessage, isLoading: false });
        //   return { success: false, error: errorMessage };
        // }
    },

    deleteEvent: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/events/${id}`);

            set((state) => ({
                events: state.events.filter((event) => event.id !== id),
                isLoading: false,
            }));

            return { success: true };
        }
        catch (error: unknown) {
            const errorMessage = getErrorMessage(error);
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }

        //  catch (error: any) {
        //   const errorMessage =
        //     error.response?.data?.message ||
        //     error.message ||
        //     "Failed to delete event.";
        //   set({ error: errorMessage, isLoading: false });
        //   return { success: false, error: errorMessage };
        // }

    },
}));
