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







// If I want to authenticate before any other thing

// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import AuthLayout from "../components/AuthLayout";
// import ProtectedRoute from "../components/ProtectedRoute";
// import AuthenticatedSignIn from "../pages/AuthenticatedSignIn";
// import AuthenticatedSignUp from "../pages/AuthenticatedSignUp";
// import FormPage from "../pages/FormPage";

// export default function AppRoutes() {
//     return (
//         <BrowserRouter>
//             <Routes>
//                 {/* Protected form route - requires authentication */}
//                 <Route
//                     path="/:eventId"
//                     element={
//                         <ProtectedRoute>
//                             <FormPage />
//                         </ProtectedRoute>
//                     }
//                 />

//                 {/* Authentication routes */}
//                 <Route
//                     path="/auth/signin"
//                     element={
//                         <AuthLayout>
//                             <AuthenticatedSignIn />
//                         </AuthLayout>
//                     }
//                 />

//                 <Route
//                     path="/auth/signup"
//                     element={
//                         <AuthLayout>
//                             <AuthenticatedSignUp />
//                         </AuthLayout>
//                     }
//                 />
//             </Routes>
//         </BrowserRouter>
//     );
//}