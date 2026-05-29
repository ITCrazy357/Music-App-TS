import { Request, Response, NextFunction } from "express";
import User from "../../models/user.model";
import jwt from "jsonwebtoken";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.token;

  if (!token) {
    req.flash("error", "Vui lòng đăng nhập để trải nghiệm bài hát!");
    res.redirect("/auth/login");
    return;
  }

  const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET as string);
  const user = await User.findById(decodedToken.id);

  if (!user) {
    res.redirect("/auth/login");
    return;
  }

  res.locals.user = user;

  next();
};
