import mongoose from "mongoose";

export type AdPosition =
  | "banner_top"
  | "banner_sidebar"
  | "banner_song_detail"
  | "popup"
  | "home_banner"
  | "footer_banner";

const adSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  },
);

const Ad = mongoose.model("Ad", adSchema, "Ads");

export default Ad;
