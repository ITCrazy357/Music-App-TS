import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import Song from "../../models/song.model";
import Singer from "../../models/singer.model";

export const list = async (req: Request, res: Response) => {
  const topic = await Topic.findOne({
    slug: req.params.slugTopic,
    status: "active",
    deleted: false,
  });

  if (!topic) {
    res.redirect("back"); // Nếu không tìm thấy topic, trả về trang trước đó
    return;
  }

  interface Song {
    avatar: string;
    title: string;
    slug: string;
    singerId: string;
    like: number;
    infoSinger: any;
  }

  const songs = await Song.find({
    topicId: topic.id,
    status: "active",
    deleted: false,
  })
    .select("avatar title slug singerId like")
    .lean();

  for (const song of songs as any[]) {
    const infoSinger = await Singer.findOne({
      _id: song.singerId,
      status: "active",
      deleted: false,
    });

    song.infoSinger = infoSinger;
  }

  res.render("client/pages/songs/list", {
    pageTitle: "Danh sách bài hát",
    songs: songs,
  });
};
