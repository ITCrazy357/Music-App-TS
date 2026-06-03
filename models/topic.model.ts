import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    title: String,
    avatar: String,
    description: String,
    status: String,
    slug: String,
    deleted: {
      type: Boolean,
      default: false,
    },
    deleteAt: Date,
    createdBy: {
      account_id: String,
      createdAt: {
        type: Date,
        default: new Date(),
      },
    },
    updatedBy: {
      account_id: String,
      updatedAt: {
        type: Date,
        default: new Date(),
      },
    },
    deletedBy: {
      account_id: String,
      deletedAt: {
        type: Date,
        default: new Date(),
      },
    },
  },
  {
    timestamps: true,
  },
);

const Topic = mongoose.model("Topic", topicSchema, "Topics");

export default Topic;
