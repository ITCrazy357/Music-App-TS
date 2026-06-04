import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    id: String,
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    permissions: {
      type: [String],
      default: ["user_view"],
    },
  },
  {
    timestamps: true,
  },
);

const Role = mongoose.model("Role", roleSchema, "Roles");

export default Role;
