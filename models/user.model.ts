import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    password: String,
    role_id: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema, "Users");

export default User;
