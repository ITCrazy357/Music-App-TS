import { Request, Response } from "express";
import Song from "../../models/song.model";
import Singer from "../../models/singer.model";

// [GET] /rankings
export const index = async (req: Request, res: Response) => {
  try {
    const rankingSongs = await Song.find({
      status: "active",
      deleted: false,
    })
      .sort({ listen: -1 })
      .limit(20);

    for (const song of rankingSongs) {
      const singerInfo = await Singer.findOne({
        _id: song.singerId,
        deleted: false,
      }).select("fullName");
      (song as any).singerInfo = singerInfo;
    }

    res.render("client/pages/ranking/index", {
      pageTitle: "Bảng xếp hạng",
      rankingSongs: rankingSongs,
    });
  } catch (error) {
    console.error(error);
    res.redirect("back");
  }
};
