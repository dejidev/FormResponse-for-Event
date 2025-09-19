import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/authService";
import { useParticipantStore } from "../store/participant-store";
import type { Event } from "../store/event-store";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select"


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

export default function ParticipantPage() {
    const { id: eventId } = useParams<{ id: string }>();
    const { createParticipant, isLoading: creating } = useParticipantStore();

    const [event, setEvent] = useState<Event | null>(null);
    const [formId, setFormId] = useState<string | null>(null);
    const [fields, setFields] = useState<FormField[]>([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [responses, setResponses] = useState<Record<string, string | string[]>>(
        {}
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!eventId) return;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const evRes = await api.get(`/events/${eventId}`);
                const bodyEvent: Event = evRes.data.body;
                setEvent(bodyEvent);
                setFormId(bodyEvent.formId || null);

                if (bodyEvent.formId) {
                    const fRes = await api.get(`/forms/${bodyEvent.formId}`);
                    const formBody = fRes.data.body;
                    setFields(formBody.fields || []);
                } else {
                    setFields([]);
                }
            } catch (err: any) {
                console.error("Failed to load event/form", err);
                setError(
                    err?.response?.data?.error ||
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to load event or form."
                );
            } finally {
                setLoading(false);
            }
        })();
    }, [eventId]);

    const setResponseValue = (label: string, value: string | string[]) => {
        setResponses((prev) => ({ ...prev, [label]: value }));
    };

    const validateRequired = () => {
        const missed: string[] = [];
        if (!name.trim()) missed.push("name");
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

        if (!eventId) {
            setError("Missing eventId");
            return;
        }

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

        const payload = { eventId, name: name.trim(), email: email.trim(), responses };

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

    const formTitle = event ? `Register for: ${event.name}` : "Register";

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <p>Loading registration form…</p>
            </div>
        );
    }

    if (error && !event) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (success) {
        return (
            <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow text-center">
                <h2 className="text-2xl font-semibold">Registration successful ✅</h2>
                <p className="mt-2 text-gray-600">
                    You have been registered for {event?.name}.
                </p>
                <Link
                    to="/"
                    className="mt-4 inline-block text-sm text-purple-600 hover:underline"
                >
                    Back to home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-purple-50 ">
            <div className="max-w-3xl mx-auto">
                {/* <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <Link
                        to="/"
                        className="text-sm text-purple-600 hover:underline mb-4 inline-block"
                    >
                        ← Back
                    </Link>

                    <h1 className="text-2xl font-bold mb-2">{formTitle}</h1>
                    {event && <p className="text-gray-600 mb-4">{event.description}</p>}
                </div> */}
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

                {!formId ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-800">
                            This event has no registration form attached. Contact the event
                            organizer.
                        </p>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        {/* Participant Info */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium">
                                    Full name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="mt-2 block w-full px-3 py-2 border-b-2 border-gray-200 focus:border-purple-500 outline-none bg-gray-50 rounded"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="mt-2 block w-full px-3 py-2 border-b-2 border-gray-200 focus:border-purple-500 outline-none bg-gray-50 rounded"
                                />
                            </div>
                        </div>

                        {/* Dynamic Fields */}
                        {fields.map((f) => (
                            <div
                                key={f.id}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-medium text-gray-800">
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
                                    />
                                )}

                                {f.type === "MCQ" && (
                                    <div className="mt-2 space-y-2">
                                        {f.options.map((opt, idx) => (
                                            <label
                                                key={idx}
                                                className="flex items-center gap-2 cursor-pointer"
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
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        value={opt}
                                                        checked={checked}
                                                        onChange={(e) => {
                                                            const prev =
                                                                (responses[f.label] as string[]) || [];
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
                                                <SelectValue placeholder="Select…" />
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

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        <div className=" ml-4 flex items-center gap-3">
                            <button
                                type="submit"
                                disabled={creating}
                                className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                            >
                                {creating ? "Submitting..." : "Register"}
                            </button>

                            {/* <Link
                                to="/"
                                className="text-sm text-gray-600 hover:text-gray-800 underline"
                            >
                                Cancel
                            </Link> */}
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
