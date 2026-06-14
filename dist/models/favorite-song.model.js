"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoriteSong = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const favoriteSongSchema = new mongoose_1.default.Schema({
    userId: String,
    songId: String,
    deleted: {
        type: Boolean,
        default: false,
    },
    deleteAt: Date,
}, {
    timestamps: true,
});
exports.FavoriteSong = mongoose_1.default.model("FavoriteSong", favoriteSongSchema, "Favorite-songs");
exports.default = exports.FavoriteSong;
