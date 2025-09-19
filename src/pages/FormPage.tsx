// src/pages/FormPage.tsx
import { useParams } from "react-router-dom";
import ParticipantForm from "../components/ParticipantForm";
import { useEffect } from "react";

export default function FormPage() {
    const { eventId } = useParams<{ eventId: string }>();
    useEffect(() => {
        console.log("Current path:", window.location.pathname);
    }, []);

    // Basic validation
    if (!eventId) {
        return (
            <div className="min-h-screen bg-purple-50 flex items-center justify-center">
                <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Invalid Link</h2>
                    <p className="text-gray-600">
                        The registration link appears to be invalid. Please check the URL and try again.
                    </p>
                </div>
            </div>
        );
    }

    return <ParticipantForm eventId={eventId} />;
}