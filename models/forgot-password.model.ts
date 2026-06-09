import mongoose from "mongoose";

export const forgotPasswordSchema = new mongoose.Schema(
  {
    email: String,
    otp: String,
    expiresAt: {
      type: Date,
      expires: 60,
    },
  },
  {
    timestamps: true,
  },
);

const ForgotPassword = mongoose.model(
  "ForgotPassword",
  forgotPasswordSchema,
  "Forgot-password",
);

export default ForgotPassword;
