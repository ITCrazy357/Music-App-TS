import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    songId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
  },
);

const Comment = mongoose.model("Comment", commentSchema, "Comments");

export default Comment;
