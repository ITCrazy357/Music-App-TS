"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const commentSchema = new mongoose_1.default.Schema({
    songId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Song",
        required: true,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    likeCount: {
        type: Number,
        default: 0,
    },
    dislikeCount: {
        type: Number,
        default: 0,
    },
    likes: {
        type: [String],
        default: [],
    },
    dislikes: {
        type: [String],
        default: [],
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: Date,
    edited: {
        type: Boolean,
        default: false,
    },
    editedAt: Date,
}, {
    timestamps: true,
});
const Comment = mongoose_1.default.model("Comment", commentSchema, "Comments");
exports.default = Comment;
