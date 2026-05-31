import { Request, Response } from "express";
import Song from "../../models/song.model";
import Singer from "../../models/singer.model";
import { convertToSlug } from "../../helpers/convertToSlug";

//[GET] /search/results
export const results = async (req: Request, res: Response): Promise<void> => {
  const keyword: string = `${req.query.keyword}` as string;

  let newSongs: any[] = [];
  if (keyword) {
    const keywordRegex = new RegExp(keyword, "i"); // Tạo regex để tìm kiếm không phân biệt hoa thường

    //Tạo slug từ keyword để tìm kiếm chính xác hơn
    const stringSlug = convertToSlug(keyword);
    const stringSlugRegex = new RegExp(stringSlug, "i"); // Tạo regex cho slug

    const songs: any[] = await Song.find({
      $or: [
        { title: { $regex: keywordRegex } },
        { slug: { $regex: stringSlugRegex } },
      ],
    }).lean();

    for (const song of songs) {
      const infoSinger = await Singer.findOne({
        _id: song.singerId,
      }).lean();

      song.infoSinger = infoSinger;
      newSongs.push(song);
    }
  }

  res.render("client/pages/search/results", {
    pageTitle: "Kết quả tìm kiếm",
    keyword: keyword,
    songs: newSongs,
  });
};
