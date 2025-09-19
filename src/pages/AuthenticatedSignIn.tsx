// src/pages/AuthenticatedSignIn.tsx
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { EyeOff, Eye } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuthStore } from "../store/auth-store";
import { toast } from "react-toastify";

interface SignInCredentials {
    email: string;
    password: string;
}

export default function AuthenticatedSignIn() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login, isLoading, error, clearError } = useAuthStore();

    const [credentials, setCredentials] = useState<SignInCredentials>({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearError();

        const result = await login(credentials);

        if (result?.success) {
            toast.success("Signed in successfully!");

            // Get the return URL and redirect back to the form
            const returnUrl = searchParams.get('returnUrl');
            if (returnUrl) {
                navigate(decodeURIComponent(returnUrl));
            } else {
                navigate("/dashboard");
            }
        } else {
            toast.error("Sign in failed");
        }
    };

    return (
        <div className="w-full mx-auto px-4">
            <div>
                <div className="pb-5">
                    <h2 className="font-medium pb-2 text-center text-[var(--purple-primary)] text-2xl">
                        Welcome Back!
                    </h2>
                    <p className="text-center text-[14px]">
                        <span className="mr-2">Don't have an account?</span>
                        <span className="text-[var(--purple-primary)] underline">
                            <Link
                                to={`/auth/signup${searchParams.get('returnUrl') ? `?returnUrl=${searchParams.get('returnUrl')}` : ''}`}
                            >
                                Create one
                            </Link>
                        </span>
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            value={credentials.email}
                            onChange={handleChange}
                            placeholder="name@email.com"
                            className="mt-2 p-3"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={credentials.password}
                                onChange={handleChange}
                                placeholder="password"
                                className="mt-2 p-3"
                                required
                            />

                            <div
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute top-1/2 -translate-y-1/2 right-4 cursor-pointer"
                            >
                                {showPassword ? <Eye color="gray" /> : <EyeOff color="gray" />}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        variant="submit"
                        className="mt-5 w-full"
                    >
                        {isLoading ? "Signing in..." : "Sign in"}
                    </Button>
                </form>

                <div className="text-center mt-5 underline text-[14px]">
                    <Link to="">Forgot Password?</Link>
                </div>
            </div>
        </div>
    );
}