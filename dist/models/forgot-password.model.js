"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPasswordSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.forgotPasswordSchema = new mongoose_1.default.Schema({
    email: String,
    otp: String,
    expiresAt: {
        type: Date,
        expires: 60,
    },
}, {
    timestamps: true,
});
const ForgotPassword = mongoose_1.default.model("ForgotPassword", exports.forgotPasswordSchema, "Forgot-password");
exports.default = ForgotPassword;
