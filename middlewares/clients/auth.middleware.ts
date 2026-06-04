import { Request, Response, NextFunction } from "express";
import User from "../../models/user.model";
import Role from "../../models/role.model";
import jwt from "jsonwebtoken";
import { systemConfig } from "../../config/system";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.token;

  if (!token) {
    req.flash("error", "Vui lòng đăng nhập");
    res.redirect("/auth/login");
    return;
  }

  try {
    const decodedToken: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    );
    const user = await User.findById(decodedToken.id);

    if (!user) {
      res.clearCookie("token");
      res.redirect("/auth/login");
      return;
    }

    let role = null;
    if (user.role_id) {
      role = await Role.findById(user.role_id);
    }

    res.locals.user = user;
    res.locals.role = role;

    next();
  } catch (error) {
    res.clearCookie("token");
    res.redirect("/auth/login");
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const role = res.locals.role;

  if (role && role.title === "superAdmin") {
    next();
  } else {
    req.flash("error", "Bạn không có quyền truy cập trang này!");
    res.redirect("/topics");
  }
};
