import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import Song from "../../models/song.model";
import Singer from "../../models/singer.model";
import FavoriteSong from "../../models/favorite-song.model";
import Comment from "../../models/comment.model";

//[GET] /songs/list
export const list = async (req: Request, res: Response) => {
  const topic = await Topic.findOne({
    slug: req.params.slugTopic,
    status: "active",
    deleted: false,
  });

  if (!topic) {
    res.redirect("topics"); // Nếu không tìm thấy topic, trả về trang trước đó
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
    .select("avatar title slug singerId likes")
    .lean();

  const user = res.locals.user;

  for (const song of songs as any[]) {
    const infoSinger = await Singer.findOne({
      _id: song.singerId,
      status: "active",
      deleted: false,
    });

    song.infoSinger = infoSinger;
    song.isLiked = user ? song.likes.includes(user.id) : false;
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

  const user = res.locals.user;
  const isLiked = user ? song.likes.includes(user.id) : false;
  let isFavorite = false;
  
  if (user) {
    const favorite = await FavoriteSong.exists({
      songId: song.id,
      userId: user.id,
    });
    isFavorite = !!favorite;
  }

  (song as any).isFavorite = isFavorite;

  // Lấy danh sách comments
  const sortOption: any = {};
  const sortQuery = req.query.sort || "newest"; // newest, oldest, popular
  
  if (sortQuery === "oldest") {
    sortOption.createdAt = 1;
  } else if (sortQuery === "popular") {
    sortOption.likeCount = -1;
  } else {
    sortOption.createdAt = -1; // newest
  }

  const comments = await Comment.find({ songId: song.id, deleted: false })
    .populate("userId", "fullName avatar")
    .sort(sortOption)
    .lean();

  // Đánh dấu các comment mà user đã like/dislike
  const commentsWithInteraction = comments.map((comment: any) => {
    return {
      ...comment,
      isLikedByUser: user ? comment.likes?.includes(user.id) : false,
      isDislikedByUser: user ? comment.dislikes?.includes(user.id) : false,
    };
  });

  res.render("client/pages/songs/detail", {
    pageTitle: "Bài hát đang phát",
    song: song,
    singer: singer,
    topic: topic,
    isLiked: isLiked,
    isFavorite: isFavorite,
    comments: commentsWithInteraction,
    sortQuery: sortQuery
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

  const user = res.locals.user;
  const isLiked = song.likes.includes(user.id);

  if (typeLike === "like" && !isLiked) {
    await Song.updateOne(
      {
        _id: idSong,
      },
      {
        $push: {
          likes: user.id,
        },
      },
    );
  }

  if (typeLike === "dislike" && isLiked) {
    await Song.updateOne(
      {
        _id: idSong,
      },
      {
        $pull: {
          likes: user.id,
        },
      },
    );
  }

  const updateSong: any = await Song.findOne({
    _id: idSong,
  });

  res.json({
    code: 200,
    like: updateSong.likes.length,
    message: "success",
  });
};

//[PATCH] /songs/favorite/:typeFavorite/:idSong
export const favorite = async (req: Request, res: Response) => {
  const idSong: string | string[] = req.params.idSong;
  const typeFavorite: string | string[] = req.params.typeFavorite;
  const user = res.locals.user;

  switch (typeFavorite) {
    case "favorite":
      const existFavoriteSong = await FavoriteSong.findOne({
        songId: idSong,
        userId: user.id,
      });

      if (!existFavoriteSong) {
        const record = new FavoriteSong({
          userId: user.id,
          songId: idSong,
        });
        await record.save();
      }
      break;
    case "unfavorite":
      await FavoriteSong.deleteOne({
        songId: idSong,
        userId: user.id,
      });
      break;
  }

  res.json({
    code: 200,
    message: "success",
  });
};

//[PATCH] /songs/listen/:idSong
export const listen = async (req: Request, res: Response) => {
  const idSong: string | string[] = req.params.idSong;
  const song: any = await Song.findOne({
    _id: idSong,
  });

  if (!song) {
    res.redirect("/songs");
    return;
  }

  const listenCount = song.listen + 1;

  await Song.updateOne(
    {
      _id: idSong,
    },
    {
      listen: listenCount,
    },
  );

  const songNew: any = await Song.findOne({
    _id: idSong,
  });

  res.json({
    code: 200,
    message: "success",
    listen: songNew.listen,
  });
};
