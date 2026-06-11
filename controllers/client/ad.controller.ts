import { Request, Response } from "express";
import Ad from "../../models/ad.model";
import AdClick from "../../models/adClick.model";
import AdView from "../../models/adView.model";

// [GET] /ads/click/:id
export const click = async (req: Request, res: Response) => {
  try {
    const adId = req.params.id as string;
    const ip = (req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "") as string;
    const userAgent = req.headers["user-agent"] || "";
    const userId = res.locals.user ? res.locals.user.id : null;

    const ad = await Ad.findOne({ _id: adId, deleted: false, status: "active" });
    if (!ad) {
      return res.redirect("/");
    }

    // Check spam click: 1 click per minute
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const existingClick = await AdClick.findOne({
      adId,
      $or: [{ userId }, { ip }],
      createdAt: { $gte: oneMinuteAgo }
    });

    if (!existingClick) {
      await AdClick.create({
        adId,
        userId,
        ip,
        userAgent
      });

      await Ad.updateOne({ _id: adId }, { $inc: { clickCount: 1 } });
    }

    res.redirect(ad.targetUrl);
  } catch (error) {
    res.redirect("/");
  }
};

// [POST] /ads/view/:id
export const view = async (req: Request, res: Response) => {
  try {
    const adId = req.params.id as string;
    const ip = (req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "") as string;
    const userId = res.locals.user ? res.locals.user.id : null;
    
    // Dedup window: e.g. 1 minute windows
    const windowKey = String(Math.floor(Date.now() / 60000));

    try {
      await AdView.create({
        adId,
        userId,
        ip,
        windowKey
      });

      await Ad.updateOne({ _id: adId }, { $inc: { viewCount: 1 } });
      res.status(200).json({ code: 200, message: "Success" });
    } catch (error: any) {
      // If duplicate key error (11000), ignore (prevent spam)
      if (error.code === 11000) {
        return res.status(200).json({ code: 200, message: "Ignored duplicate view" });
      }
      res.status(400).json({ code: 400, message: "Error" });
    }
  } catch (error) {
    res.status(400).json({ code: 400, message: "Error" });
  }
};
