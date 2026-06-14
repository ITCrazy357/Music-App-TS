"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const roleSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: String,
    status: {
        type: String,
        default: "active",
    },
    permissions: {
        type: [String],
        default: ["user_view"],
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
const Role = mongoose_1.default.model("Role", roleSchema, "Roles");
exports.default = Role;
