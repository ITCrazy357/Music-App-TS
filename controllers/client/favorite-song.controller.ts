import { Response, Request } from "express";
import FavoriteSong from "../../models/favorite-song.model";
import Song from "../../models/song.model";
import Singer from "../../models/singer.model";

//[GET] /favorite-songs
export const index = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;
  const favoriteSongs = await FavoriteSong.find({
    userId: userId,
  });

  if (!favoriteSongs) {
    res.redirect("/topics");
    return;
  }

  const songIds = favoriteSongs.map((favoriteSong) => favoriteSong.songId);

  const songs = await Song.find({
    _id: { $in: songIds },
  })
    .select("title avatar singerId slug")
    .lean();

  for (const song of songs as any[]) {
    const infoSinger = await Singer.findOne({
      _id: song.singerId,
    }).select("fullName");

    song.infoSinger = infoSinger;
  }

  res.render("client/pages/favorite-songs/index", {
    pageTitle: "Bài hát yêu thích",
    favoriteSongs: favoriteSongs,
    songs: songs,
  });
};
