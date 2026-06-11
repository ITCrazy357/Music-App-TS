import { Request, Response } from "express";
import Song from "../../models/song.model";
import Topic from "../../models/topic.model";
import Singer from "../../models/singer.model";

// [GET] /
export const index = async (req: Request, res: Response) => {
  try {
    // 1. Lấy bài hát mới nhất
    const latestSongs = await Song.find({
      status: "active",
      deleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(6);

    for (const song of latestSongs) {
      const singerInfo = await Singer.findOne({
        _id: song.singerId,
        deleted: false,
      }).select("fullName");
      (song as any).singerInfo = singerInfo;
    }

    // 2. Lấy bài hát nổi bật (lượt nghe cao)
    const featuredSongs = await Song.find({
      status: "active",
      deleted: false,
    })
      .sort({ listen: -1 })
      .limit(6);

    for (const song of featuredSongs) {
      const singerInfo = await Singer.findOne({
        _id: song.singerId,
        deleted: false,
      }).select("fullName");
      (song as any).singerInfo = singerInfo;
    }

    // 3. Lấy chủ đề nổi bật
    const featuredTopics = await Topic.find({
      status: "active",
      deleted: false,
    })
      .sort({ position: "asc" })
      .limit(6);

    // 4. Lấy ca sĩ nổi bật
    const featuredSingers = await Singer.find({
      status: "active",
      deleted: false,
    })
      .limit(6);

    res.render("client/pages/home/index", {
      pageTitle: "Trang chủ",
      latestSongs: latestSongs,
      featuredSongs: featuredSongs,
      featuredTopics: featuredTopics,
      featuredSingers: featuredSingers,
    });
  } catch (error) {
    console.error(error);
    res.redirect("back");
  }
};
