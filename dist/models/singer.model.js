"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const singerSchema = new mongoose_1.default.Schema({
    fullName: String,
    avatar: String,
    description: String,
    status: {
        type: String,
        default: "active",
    },
    slug: String,
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
const Singer = mongoose_1.default.model("Singer", singerSchema, "Singers");
exports.default = Singer;
