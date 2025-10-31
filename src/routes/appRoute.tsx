import SignUp from "../pages/SignUp";
import FormPage from "../pages/FormPage";
import SignIn from "../pages/Signin";

import { Routes, Route, BrowserRouter } from "react-router-dom";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* <Route path="/" element={<div className="flex items-center justify-center h-screen">Invalid Link. Please use a valid event link.</div>} /> */}
                <Route path="/:eventId" element={<FormPage />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="*" element={<div>Invalid Link / 404</div>} />
            </Routes>
        </BrowserRouter>
    );
}

