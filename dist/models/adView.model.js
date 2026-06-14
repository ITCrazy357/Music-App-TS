"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const adViewSchema = new mongoose_1.default.Schema({
    adId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true, index: true },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        default: null,
        index: true,
    },
    ip: { type: String, default: "", index: true },
    windowKey: { type: String, default: "", index: true },
}, {
    timestamps: true,
});
adViewSchema.index({ adId: 1, userId: 1, ip: 1, windowKey: 1 }, { unique: true, name: "uniq_ad_view_dedup" });
const AdView = mongoose_1.default.model("AdView", adViewSchema, "AdViews");
exports.default = AdView;
