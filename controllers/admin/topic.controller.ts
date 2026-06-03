import { Response, Request } from "express";
import Topic from "../../models/topic.model";

//[GET] /admin/topics
export const index = async (req: Request, res: Response) => {
  try {
    const topics = await Topic.find({
      deleted: false,
    });

    res.render("admin/pages/topics/index", {
      pageTitle: "Quản lý chủ đề",
      topics: topics,
    });
  } catch (error) {
    res.redirect("back");
  }
};
