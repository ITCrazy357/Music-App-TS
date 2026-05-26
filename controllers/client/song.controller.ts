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

//[GET] /songs/detail/:slugSong
export const detail = async (req: Request, res: Response) => {
  const song = await Song.findOne({
    slug: req.params.slugSong,
    status: "active",
    deleted: false,
  }).select("-status -deleted");

  if (!song) {
    res.redirect("/songs");
    return;
  }

  const singer = await Singer.findOne({
    _id: song.singerId,
    status: "active",
    deleted: false,
  }).select("-status -deleted");

  const topic = await Topic.findOne({
    _id: song.topicId,
    status: "active",
    deleted: false,
  }).select("-status -deleted");

  res.render("client/pages/songs/detail", {
    pageTitle: "Bài hát đang phát",
    song: song,
    singer: singer,
    topic: topic,
  });
};

//[PATCH] /songs/like/:typeLike/:idSong
export const like = async (req: Request, res: Response) => {
  const idSong: string | string[] = req.params.idSong;
  const typeLike: string | string[] = req.params.typeLike;

  const song: any = await Song.findOne({
    _id: idSong,
    status: "active",
    deleted: false,
  });

  if (!song) {
    res.redirect("/songs");
    return;
  }

  const newLike: number = typeLike === "like" ? song.like + 1 : song.like - 1;

  await Song.updateOne(
    {
      _id: idSong,
    },
    {
      like: newLike,
    },
  );

  res.json({
    code: 200,
    like: newLike,
    message: "suscess",
  });
};
