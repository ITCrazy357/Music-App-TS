import mongoose from "mongoose";

const settingGeneralSchema = new mongoose.Schema(
  {
    websiteName: String,
    logo: String,
    favicon: String,
    phone: String,
    email: String,
    address: String,
    copyright: String,
    shortDescription: String,
    facebook: String,
    youtube: String,
    tiktok: String,
    instagram: String,
  },
  {
    timestamps: true,
  }
);

const SettingGeneral = mongoose.model("SettingGeneral", settingGeneralSchema, "settings-general");

export default SettingGeneral;
