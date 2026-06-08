import mongoose from "mongoose";

const singerSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  },
);

const Singer = mongoose.model("Singer", singerSchema, "Singers");

export default Singer;
