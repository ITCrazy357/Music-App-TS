import mongoose from "mongoose";

const adViewSchema = new mongoose.Schema(
  {
    adId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },

    ip: { type: String, default: "", index: true },

    // Dedup key to avoid counting view on every refresh within a window
    windowKey: { type: String, default: "", index: true },
  },
  {
    timestamps: true,
  },
);

adViewSchema.index(
  { adId: 1, userId: 1, ip: 1, windowKey: 1 },
  { unique: true, name: "uniq_ad_view_dedup" },
);

const AdView = mongoose.model("AdView", adViewSchema, "AdViews");

export default AdView;
