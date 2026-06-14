"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const adClickSchema = new mongoose_1.default.Schema({
    adId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true, index: true },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        default: null,
        index: true,
    },
    ip: { type: String, default: "", index: true },
    userAgent: { type: String, default: "" },
}, {
    timestamps: true,
});
adClickSchema.index({ adId: 1, userId: 1, ip: 1 }, { name: "idx_ad_click_identity" });
const AdClick = mongoose_1.default.model("AdClick", adClickSchema, "AdClicks");
exports.default = AdClick;
