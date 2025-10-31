// src/components/ParticipantForm.tsx
import { useEffect, useState } from "react";
import api from "../services/authService";
import { useParticipantStore } from "../store/participant-store";
import type { Event } from "../store/event-store";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";

type FieldType = "TEXT" | "MCQ" | "CHECKBOX" | "DROPDOWN";

interface FormField {
    id: string;
    label: string;
    type: FieldType;
    required: boolean;
    options: string[];
    formId: string;
    createdAt: string;
}

interface ParticipantFormProps {
    eventId: string;
}

export default function ParticipantForm({ eventId }: ParticipantFormProps) {
    const { createParticipant, isLoading: creating } = useParticipantStore();

    const [event, setEvent] = useState<Event | null>(null);
    const [formId, setFormId] = useState<string | null>(null);
    const [fields, setFields] = useState<FormField[]>([]);
    // const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [responses, setResponses] = useState<Record<string, string | string[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchEventAndForm = async () => {
            setLoading(true);
            setError(null);

            try {
                // Fetch event details
                const eventResponse = await api.get(`/events/${eventId}`);
                const eventData: Event = eventResponse.data.body;
                setEvent(eventData);
                setFormId(eventData.formId || null);

                // Fetch form fields if form exists
                if (eventData.formId) {
                    const formResponse = await api.get(`/forms/${eventData.formId}`);
                    const formBody = formResponse.data.body;
                    setFields(formBody.fields || []);
                } else {
                    setFields([]);
                }
            } catch (err: any) {
                console.error("Failed to load event/form", err);
                const errorMessage =
                    err?.response?.data?.error ||
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to load registration form.";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchEventAndForm();
    }, [eventId]);

    const setResponseValue = (label: string, value: string | string[]) => {
        setResponses((prev) => ({ ...prev, [label]: value }));
    };

    const validateRequired = () => {
        const missed: string[] = [];
        // if (!name.trim()) missed.push("name");
        if (!email.trim()) missed.push("email");

        fields.forEach((f) => {
            if (!f.required) return;
            const val = responses[f.label];
            if (val === undefined || val === null) {
                missed.push(f.label);
                return;
            }
            if (typeof val === "string" && val.trim() === "") {
                missed.push(f.label);
                return;
            }
            if (Array.isArray(val) && val.length === 0) {
                missed.push(f.label);
                return;
            }
        });

        return missed;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const missed = validateRequired();
        if (missed.length > 0) {
            setError(
                `Please fill required fields: ${missed
                    .map((m) =>
                        m === "name" ? "Name" : m === "email" ? "Email" : m
                    )
                    .join(", ")}`
            );
            return;
        }

        const payload = {
            eventId,
            // name: name.trim(),
            email: email.trim(),
            responses
        };

        try {
            const res = await createParticipant(payload);
            if (res.success) {
                setSuccess(true);
            } else {
                setError(res.error || "Failed to submit registration.");
            }
        } catch (err: any) {
            setError(
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                err?.message ||
                "Submission failed"
            );
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-purple-50 flex items-center justify-center">
                <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading registration form...</p>
                </div>
            </div>
        );
    }

    // Error state (when event/form fails to load)
    if (error && !event) {
        return (
            <div className="min-h-screen bg-purple-50 flex items-center justify-center">
                <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Unable to Load Form</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Success state
    if (success) {
        return (
            <div className="min-h-screen bg-purple-50 flex items-center justify-center">
                <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow text-center">
                    <div className="text-6xl mb-4"></div>
                    <h2 className="text-2xl font-semibold text-green-600 mb-2">
                        Registration Successful!
                    </h2>
                    <p className="text-gray-600 mb-4">
                        You have been successfully registered for {event?.name}.
                    </p>
                    <p className="text-sm text-gray-500">
                        You should receive a confirmation email shortly.
                    </p>
                </div>
            </div>
        );
    }

    const formTitle = event ? `Register for: ${event.name}` : "Event Registration";

    return (
        <div className="min-h-screen bg-purple-50 pb-8">
            <div className="max-w-3xl mx-auto px-4">
                {/* Event Header */}
                <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
                    {event?.bannerImageUrl && (
                        <div className="h-32 w-full overflow-hidden">
                            <img
                                src={event.bannerImageUrl}
                                alt={event.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <div className="p-6 border-b-4 border-purple-600">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{formTitle}</h1>
                        {event && <p className="text-gray-600 text-sm">{event.description}</p>}
                    </div>
                </div>

                {/* Form Content */}
                {!formId ? (
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-center">
                            <div className="text-4xl mb-4">⚠️</div>
                            <h2 className="text-xl font-semibold text-yellow-600 mb-2">
                                No Registration Form Available
                            </h2>
                            <p className="text-gray-600">
                                This event does not have a registration form attached.
                                Please contact the event organizer for more information.
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Participant Info */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                            <h3 className="text-lg font-medium text-gray-800 mb-4">
                                Your Information
                            </h3>

                            {/* <div >
                                <label className="text-sm font-medium text-gray-700">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="mt-2 block w-full px-3 py-2 border-b-2 border-gray-200 focus:border-purple-500 outline-none bg-gray-50 rounded"
                                    placeholder="Enter your full name"
                                />
                            </div> */}

                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="mt-2 block w-full px-3 py-2 border-b-2 border-gray-200 focus:border-purple-500 outline-none bg-gray-50 rounded"
                                    placeholder="Enter your email address"
                                />
                            </div>
                        </div>

                        {/* Dynamic Fields */}
                        {fields.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-medium text-gray-800 mb-4">
                                    Additional Information
                                </h3>

                                <div className="space-y-6">
                                    {fields.map((f) => (
                                        <div key={f.id}>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="font-medium text-gray-700">
                                                    {f.label}
                                                </label>
                                                {f.required && (
                                                    <span className="text-red-500 text-sm">*</span>
                                                )}
                                            </div>

                                            {f.type === "TEXT" && (
                                                <input
                                                    type="text"
                                                    className="mt-2 block w-full px-3 py-2 border-b-2 border-gray-200 focus:border-purple-500 outline-none bg-gray-50 rounded"
                                                    value={(responses[f.label] as string) ?? ""}
                                                    onChange={(e) => setResponseValue(f.label, e.target.value)}
                                                    required={f.required}
                                                    placeholder={`Enter ${f.label.toLowerCase()}`}
                                                />
                                            )}

                                            {f.type === "MCQ" && (
                                                <div className="mt-2 space-y-2">
                                                    {f.options.map((opt, idx) => (
                                                        <label
                                                            key={idx}
                                                            className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={f.label}
                                                                value={opt}
                                                                onChange={() => setResponseValue(f.label, opt)}
                                                                checked={responses[f.label] === opt}
                                                                required={f.required}
                                                                className="accent-purple-600"
                                                            />
                                                            <span className="text-gray-700">{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}

                                            {f.type === "CHECKBOX" && (
                                                <div className="mt-2 space-y-2">
                                                    {f.options.map((opt) => {
                                                        const current = (responses[f.label] as string[]) || [];
                                                        const checked = current.includes(opt);
                                                        return (
                                                            <label
                                                                key={opt}
                                                                className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    value={opt}
                                                                    checked={checked}
                                                                    onChange={(e) => {
                                                                        const prev = (responses[f.label] as string[]) || [];
                                                                        if (e.target.checked) {
                                                                            setResponseValue(f.label, [...prev, opt]);
                                                                        } else {
                                                                            setResponseValue(
                                                                                f.label,
                                                                                prev.filter((v) => v !== opt)
                                                                            );
                                                                        }
                                                                    }}
                                                                    className="accent-purple-600"
                                                                />
                                                                <span className="text-gray-700">{opt}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {f.type === "DROPDOWN" && (
                                                <div className="mt-2">
                                                    <Select
                                                        value={(responses[f.label] as string) ?? ""}
                                                        onValueChange={(val) => setResponseValue(f.label, val)}
                                                    >
                                                        <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-purple-500">
                                                            <SelectValue placeholder={`Select ${f.label.toLowerCase()}`} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {f.options.map((opt) => (
                                                                <SelectItem key={opt} value={opt}>
                                                                    {opt}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Error Display */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <button
                                type="submit"
                                disabled={creating}
                                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {creating ? "Submitting Registration..." : "Complete Registration"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
