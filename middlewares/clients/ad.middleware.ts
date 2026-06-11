import { Request, Response, NextFunction } from "express";
import Ad from "../../models/ad.model";

export const injectAds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentDate = new Date();
    const activeAds = await Ad.find({
      deleted: false,
      status: "active",
      isDraft: false,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    }).sort({ priority: -1, sponsorLevel: -1, createdAt: -1 });

    const adsByPosition: Record<string, any[]> = {
      banner_top: [],
      banner_sidebar: [],
      banner_song_detail: [],
      popup: [],
      home_banner: [],
      footer_banner: []
    };

    activeAds.forEach((ad) => {
      let adPositions: string[] = [];
      if (ad.positions && Array.isArray(ad.positions) && ad.positions.length > 0) {
        adPositions = ad.positions;
      } else if (ad.get && ad.get("position")) {
        adPositions = [ad.get("position")];
      }

      adPositions.forEach((pos: string) => {
        if (adsByPosition[pos]) {
          adsByPosition[pos].push(ad);
        } else {
          adsByPosition[pos] = [ad];
        }
      });
    });

    res.locals.globalAds = adsByPosition;
    next();
  } catch (error) {
    res.locals.globalAds = {};
    next();
  }
};
