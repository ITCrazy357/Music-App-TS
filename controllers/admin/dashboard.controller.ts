import { Response, Request } from "express";

//[GET] /admin/dashboard
export const index = async (req: Request, res: Response) => {
  res.render("admin/pages/dashboard/index", {
    pageTitle: "Trang chủ",
  });
};
