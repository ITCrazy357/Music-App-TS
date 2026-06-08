import { Response, Request } from "express";
import Topic from "../../models/topic.model";
import Song from "../../models/song.model";
import Singer from "../../models/singer.model";
import User from "../../models/user.model";

//[GET] /admin/dashboard
export const index = async (req: Request, res: Response) => {
  const statistic = {
    Topic: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    Song: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    Singer: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    User: {
      total: 0,
      active: 0,
      inactive: 0,
    },
  };

  //=================== Topic ======================
  statistic.Topic.total = await Topic.countDocuments({
    deleted: false,
  });

  statistic.Topic.active = await Topic.countDocuments({
    deleted: false,
    status: "active",
  });

  statistic.Topic.inactive = await Topic.countDocuments({
    deleted: false,
    status: "inactive",
  });

  //================ Song ====================
  statistic.Song.total = await Song.countDocuments({
    deleted: false,
  });

  statistic.Song.active = await Song.countDocuments({
    deleted: false,
    status: "active",
  });

  statistic.Song.inactive = await Song.countDocuments({
    deleted: false,
    status: "inactive",
  });

  //================ Singer ===================
  statistic.Singer.total = await Singer.countDocuments({
    deleted: false,
  });

  statistic.Singer.active = await Singer.countDocuments({
    deleted: false,
    status: "active",
  });

  statistic.Singer.inactive = await Singer.countDocuments({
    deleted: false,
    status: "inactive",
  });

  //=================User========================//
  statistic.User.total = await User.countDocuments({
    deleted: false,
  });

  statistic.User.active = await User.countDocuments({
    deleted: false,
    status: "active",
  });

  statistic.User.inactive = await User.countDocuments({
    deleted: false,
    status: "inactive",
  });

  res.render("admin/pages/dashboard/index", {
    pageTitle: "Trang chủ",
    statistic: statistic,
  });
};
