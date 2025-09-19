// src/pages/AuthenticatedSignUp.tsx
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";
import { signUpSchema, type SignUpFormData } from "../lib/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { EyeOff, Loader2, Eye } from "lucide-react";
import { toast } from "react-toastify";

export default function AuthenticatedSignUp() {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { signup } = useAuthStore();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
    });

    const onSubmit = async (data: SignUpFormData) => {
        try {
            const result = await signup(data);

            if (result?.success) {
                toast.success("Account created successfully!");

                // Get the return URL and redirect back to the form
                const returnUrl = searchParams.get('returnUrl');
                if (returnUrl) {
                    navigate(decodeURIComponent(returnUrl));
                } else {
                    navigate("/dashboard");
                }
            } else if (result?.error === "User already exists") {
                toast.error("An account with this email already exists. Please sign in.");
                // Redirect to signin with the same return URL
                const returnUrl = searchParams.get('returnUrl');
                navigate(`/auth/signin${returnUrl ? `?returnUrl=${returnUrl}` : ''}`);
            } else {
                toast.error(result?.error || "Sign up failed. Please try again.");
            }
        } catch (err) {
            toast.error("Unexpected error. Please try again later.");
        }
    };

    const handleShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <div className="w-full mx-auto px-4">
            <div>
                <div className="">
                    <h2 className="font-medium pb-2 text-center text-[var(--purple-primary)] text-2xl">
                        Create your account
                    </h2>
                    <p className="text-center text-[14px]">
                        <span className="mr-2">Already have an account?</span>
                        <span className="text-[var(--purple-primary)] underline">
                            <Link
                                to={`/auth/signin${searchParams.get('returnUrl') ? `?returnUrl=${searchParams.get('returnUrl')}` : ''}`}
                            >
                                Sign in
                            </Link>
                        </span>
                    </p>

                    <p className="text-center mt-5 text-[14px]">
                        Enter your details to create your account
                    </p>

                    <form className="mt-5" onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="firstname">First Name</Label>
                                <Input
                                    type="text"
                                    {...register("firstname")}
                                    placeholder="John"
                                    className="my-2 p-3"
                                />
                                {errors.firstname && (
                                    <p className="text-red-500 text-[13px]">
                                        {errors.firstname.message}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="lastname">Last Name</Label>
                                <Input
                                    type="text"
                                    {...register("lastname")}
                                    placeholder="Doe"
                                    className="my-2 p-3"
                                />
                                {errors.lastname && (
                                    <p className="text-red-500 text-[13px]">
                                        {errors.lastname.message}
                                    </p>
                                )}
                            </div>
                        </div>
                        <Label htmlFor="email">Email</Label>
                        <div>
                            <Input
                                type="email"
                                {...register("email")}
                                placeholder="name@email.com"
                                className="my-2 p-3"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-[13px]">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                {...register("password")}
                                placeholder="password"
                                className="my-2 p-3"
                            />
                            <div
                                onClick={handleShowPassword}
                                className="absolute top-1/2 -translate-y-1/2 right-4 cursor-pointer"
                            >
                                {showPassword ? <Eye color="gray" /> : <EyeOff color="gray" />}
                            </div>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-[13px] mb-5">
                                {errors.password.message}
                            </p>
                        )}

                        <p className="text-center text-[12px]">
                            By signing up, you agree to our
                            <span className="text-[var(--purple-primary)] mx-1 underline">
                                Terms of service
                            </span>
                            and
                            <span className="text-[var(--purple-primary)] ml-1 underline">
                                Privacy Policy
                            </span>
                        </p>

                        <Button type="submit" variant={"submit"} className="mt-5">
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating account...
                                </div>
                            ) : (
                                <div>Create account</div>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}