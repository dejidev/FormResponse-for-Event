import * as z from "zod";

const isEmail = (val: string) => {
  const emailRegex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;
  return emailRegex.test(val);
};

export const signUpSchema = z.object({
  email: z.string().min(1, "Email is required").refine(isEmail, {
    message: "Enter a valid email",
  }),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase and one number"
    ),
  firstname: z.string().min(3, "First name must be at least 3 characters"),
  lastname: z.string().min(3, "Last name must be at least 3 characters"),
});

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").refine(isEmail, {
    message: "Enter a valid email",
  }),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
