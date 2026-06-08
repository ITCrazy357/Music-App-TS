import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  },
);

const Role = mongoose.model("Role", roleSchema, "Roles");

export default Role;
