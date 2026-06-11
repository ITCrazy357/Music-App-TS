import mongoose from "mongoose";

const adClickSchema = new mongoose.Schema(
  {
    adId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },

    ip: { type: String, default: "", index: true },
    userAgent: { type: String, default: "" },

    // App-level de-dup control for spam clicks
    // Example: 30s/60s window handled by application logic
    // (We still keep log rows for analytics)
  },
  {
    timestamps: true,
  },
);

adClickSchema.index(
  { adId: 1, userId: 1, ip: 1 },
  { name: "idx_ad_click_identity" },
);

const AdClick = mongoose.model("AdClick", adClickSchema, "AdClicks");

export default AdClick;
