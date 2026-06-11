import { Request, Response } from "express";
import Singer from "../../models/singer.model";
import Song from "../../models/song.model";
import { pagination } from "../../helpers/pagination";

// [GET] /singers
export const index = async (req: Request, res: Response) => {
  const find: any = {
    status: "active",
    deleted: false,
  };

  if (req.query.keyword) {
    const keyword = String(req.query.keyword);
    const regex = new RegExp(keyword, "i");
    find.$or = [{ fullName: regex }, { slug: regex }];
  }

  // Pagination
  const countSingers = await Singer.countDocuments(find);
  const objectPagination = pagination(
    {
      currentPage: 1,
      limitItems: 12,
    },
    req.query,
    countSingers,
  );

  const singers = await Singer.find(find)
    .sort({ position: "asc", createdAt: -1 })
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip)
    .select("avatar fullName slug")
    .lean();

  // Get total songs for each singer
  for (const singer of singers as any[]) {
    const countSongs = await Song.countDocuments({
      singerId: String(singer._id),
      status: "active",
      deleted: false,
    });
    singer.totalSongs = countSongs;
  }

  res.render("client/pages/singers/index", {
    pageTitle: "Danh sách ca sĩ",
    singers: singers,
    keyword: req.query.keyword ? String(req.query.keyword) : "",
    pagination: objectPagination,
    originalUrl: req.originalUrl,
  });
};

// [GET] /singers/detail/:slugSinger
export const detail = async (req: Request, res: Response) => {
  const slugSinger = req.params.slugSinger;

  const singer = await Singer.findOne({
    slug: slugSinger,
    status: "active",
    deleted: false,
  }).lean();

  if (!singer) {
    res.redirect("/singers");
    return;
  }

  // Get all songs of the singer
  const songs = await Song.find({
    singerId: String(singer._id),
    status: "active",
    deleted: false,
  })
    .sort({ createdAt: -1 })
    .select("avatar title slug listen likes createdAt")
    .lean();

  const user = res.locals.user;

  for (const song of songs as any[]) {
    song.isLiked = user ? song.likes?.includes(user.id) : false;
  }

  (singer as any).totalSongs = songs.length;

  res.render("client/pages/singers/detail", {
    pageTitle: singer.fullName,
    singer: singer,
    songs: songs,
  });
};
