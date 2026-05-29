import mongoose from "mongoose";


const favoriteSongSchema = new mongoose.Schema(
  {
    userId: String,
    songId: String,
    deleted: {
      type: Boolean,
      default: false,
    },
    deleteAt: Date,
  }
  {
    timestamps: true
  }
)

export const FavoriteSong = mongoose.model("FavoriteSong", favoriteSongSchema, "Favorite-songs");

export default FavoriteSong;