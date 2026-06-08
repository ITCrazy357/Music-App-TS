import { Router } from "express";
import * as controller from "../../controllers/client/auth.controller";
import {
  registerValidation,
  loginValidation,
  resetPasswordValidation,
} from "../../validations/clients/auth.validation";
import { requireAuth } from "../../middlewares/clients/auth.middleware";

const router: Router = Router();

router.get("/login", controller.login);

router.post("/login", loginValidation, controller.postLogin);

router.get("/register", controller.register);

router.post("/register", registerValidation, controller.postRegister);

router.get("/forgot-password", controller.forgotPassword);

router.post("/forgot-password", controller.postForgotPassword);

router.get("/otp", controller.otpPassword);

router.post("/otp", controller.postOtpPassword);

router.get("/reset-password", requireAuth, controller.resetPassword);

router.post(
  "/reset-password",
  requireAuth,
  resetPasswordValidation,
  controller.postResetPassword,
);

router.get("/logout", controller.logout);

export const authRoutes: Router = router;
