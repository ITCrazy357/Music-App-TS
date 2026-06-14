"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const adSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    targetUrl: { type: String, default: "" },
    positions: { type: [String], default: ["banner_top"], index: true },
    status: { type: String, default: "inactive", index: true },
    priority: { type: Number, default: 1, index: true },
    sponsorLevel: { type: String, default: "" },
    clickCount: { type: Number, default: 0, index: true },
    viewCount: { type: Number, default: 0, index: true },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    isDraft: { type: Boolean, default: false, index: true },
    createdBy: {
        accountId: String,
        createdAt: { type: Date, default: Date.now },
    },
    updatedBy: {
        accountId: String,
        updatedAt: { type: Date },
    },
    deleted: { type: Boolean, default: false, index: true },
    deletedAt: Date,
}, {
    timestamps: true,
});
const Ad = mongoose_1.default.model("Ad", adSchema, "Ads");
exports.default = Ad;
