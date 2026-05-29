import { Request, Response } from "express";
import User from "../../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//[GET] /auth/login
export const login = (req: Request, res: Response) => {
  if (res.locals.user) {
    res.redirect("/topics");
    return;
  } else {
    res.clearCookie("token");
  }
  res.render("client/pages/auth/login", {
    pageTitle: "Đăng nhập",
  });
};

//[POST] /auth/postLogin
export const postLogin = async (req: Request, res: Response) => {
  const email: string = req.body.email;

  const user: any = await User.findOne({
    email: email,
    status: "active",
    deleted: false,
  });

  if (!user) {
    req.flash("error", "Email không tồn tại hoặc tài khoản đã bị khóa!");
    res.redirect("/auth/login");
    return;
  }

  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isMatch) {
    req.flash("error", "Sai mật khẩu");
    res.redirect("/auth/login");
    return;
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1d",
    },
  );

  res.cookie("token", token);
  req.flash("success", "Đăng nhập thành công");
  res.redirect("/topics");
};

//[GET] /auth/register
export const register = (req: Request, res: Response) => {
  res.render("client/pages/auth/register", {
    pageTitle: "Đăng ký",
  });
};

//[POST] /auth/postRegister
export const postRegister = async (req: Request, res: Response) => {
  // Kiểm tra email đã tồn tại
  const existEmail = await User.findOne({
    email: req.body.email,
    deleted: false,
  });
  if (existEmail) {
    req.flash("error", "Email đã tồn tại trong hệ thống!");
    res.redirect("/auth/register");
    return;
  }

  req.body.password = await bcrypt.hash(req.body.password, 10);
  const user = new User({
    fullName: req.body.fullName,
    email: req.body.email,
    password: req.body.password,
    role_id: "1",
    status: "active",
  });
  await user.save();

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1d",
    },
  );

  res.cookie("token", token);
  req.flash("success", "Đăng ký thành công");
  res.redirect("/topics");
};

//[GET] /auth/logout
export const logout = (req: Request, res: Response) => {
  res.clearCookie("token");
  req.flash("success", "Đăng xuất thành công");
  res.redirect("/auth/login");
};
