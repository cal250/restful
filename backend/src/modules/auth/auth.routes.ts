import { Router } from "express";
import { validate } from "../../common/middleware/validate.js";
import * as controller from "./auth.controller.js";
import { authenticate } from "./auth.middleware.js";
import { forgotPasswordSchema, loginSchema, registerSchema, resendRegistrationOtpSchema, resetPasswordSchema, verifyRegistrationOtpSchema } from "./auth.validation.js";

export const authRoutes = Router();

authRoutes.post("/register", validate(registerSchema), controller.register);
authRoutes.post("/verify-registration-otp", validate(verifyRegistrationOtpSchema), controller.verifyRegistrationOtp);
authRoutes.post("/resend-registration-otp", validate(resendRegistrationOtpSchema), controller.resendRegistrationOtp);
authRoutes.post("/login", validate(loginSchema), controller.login);
authRoutes.post("/logout", authenticate, controller.logout);
authRoutes.post("/forgot-password", validate(forgotPasswordSchema), controller.forgotPassword);
authRoutes.post("/reset-password", validate(resetPasswordSchema), controller.resetPassword);
