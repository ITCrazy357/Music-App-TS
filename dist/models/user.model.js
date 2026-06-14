"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    fullName: String,
    email: String,
    password: String,
    role_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Role",
    },
    avatar: String,
    description: String,
    status: {
        type: String,
        default: "active",
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: Date,
    createdBy: {
        accountId: String,
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    updatedBy: {
        accountId: String,
        updatedAt: Date,
    },
    deletedBy: {
        accountId: String,
        deletedAt: Date,
    },
}, {
    timestamps: true,
});
const User = mongoose_1.default.model("User", userSchema, "Users");
exports.default = User;
