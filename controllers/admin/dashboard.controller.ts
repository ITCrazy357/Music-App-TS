import { Response, Request } from "express";
import Topic from "../../models/topic.model";
import Song from "../../models/song.model";
import Singer from "../../models/singer.model";
import User from "../../models/user.model";
import Ad from "../../models/ad.model";

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
    Ad: {
      total: 0,
      active: 0,
      draft: 0,
      expired: 0,
      clicks: 0,
      views: 0,
      ctr: 0,
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

  //=================Ad========================//
  const currentDate = new Date();
  statistic.Ad.total = await Ad.countDocuments({ deleted: false });
  statistic.Ad.active = await Ad.countDocuments({
    deleted: false,
    status: "active",
    isDraft: false,
    startDate: { $lte: currentDate },
    endDate: { $gte: currentDate },
  });
  statistic.Ad.draft = await Ad.countDocuments({
    deleted: false,
    isDraft: true,
  });
  statistic.Ad.expired = await Ad.countDocuments({
    deleted: false,
    endDate: { $lt: currentDate },
  });

  const adStats = await Ad.aggregate([
    { $match: { deleted: false } },
    {
      $group: {
        _id: null,
        totalClicks: { $sum: "$clickCount" },
        totalViews: { $sum: "$viewCount" },
      },
    },
  ]);

  if (adStats.length > 0) {
    statistic.Ad.clicks = adStats[0].totalClicks;
    statistic.Ad.views = adStats[0].totalViews;
    if (statistic.Ad.views > 0) {
      statistic.Ad.ctr = Number(
        ((statistic.Ad.clicks / statistic.Ad.views) * 100).toFixed(2),
      );
    }
  }

  res.render("admin/pages/dashboard/index", {
    pageTitle: "Dashboard",
    statistic: statistic,
  });
};
