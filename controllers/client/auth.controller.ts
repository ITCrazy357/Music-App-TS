import { Request, Response } from "express";
import User from "../../models/user.model";
import Role from "../../models/role.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { systemConfig } from "../../config/system";
import { generateRandomNumber } from "../../helpers/generate";
import ForgotPassword from "../../models/forgot-password.model";
import * as sendMailHelper from "../../helpers/sendMail";

//[GET] /auth/login
export const login = (req: Request, res: Response) => {
  if (res.locals.user) {
    if (res.locals.role && res.locals.role.title === "superAdmin") {
      res.redirect(`/${systemConfig.prefixAdmin}/dashboard`);
    } else {
      res.redirect("/topics");
    }
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
    deleted: false,
  });

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

  let redirectUrl = "/topics";
  if (user.role_id) {
    const role = await Role.findById(user.role_id);
    if (
      (role && role.title === "Admin") ||
      (role && role.title === "Account") ||
      (role && role.title === "Content")
    ) {
      redirectUrl = `/${systemConfig.prefixAdmin}/dashboard`;
    }
  }

  res.redirect(redirectUrl);
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

  // Find a default User role or create one if it doesn't exist
  let userRole = await Role.findOne({ title: "User" });
  if (!userRole) {
    userRole = new Role({ title: "User" });
    await userRole.save();
  }

  req.body.password = await bcrypt.hash(req.body.password, 10);
  const user = new User({
    fullName: req.body.fullName,
    email: req.body.email,
    password: req.body.password,
    role_id: userRole._id,
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

//[GET] /auth/forgot-password
export const forgotPassword = (req: Request, res: Response) => {
  res.render("client/pages/auth/forgot-password", {
    pageTitle: "Quên mật khẩu",
  });
};

//[POST] /auth/forgot-password
export const postForgotPassword = async (req: Request, res: Response) => {
  const email = req.body.email;

  const user = await User.findOne({
    email: email,
    deleted: false,
  });

  if (!user) {
    req.flash("error", "Email không tồn tại trong hệ thống!");
    res.redirect("/auth/forgot-password");
    return;
  }

  if (user.status !== "active") {
    req.flash("error", "Tài khoản của bạn đã bị khóa!");
    res.redirect("/auth/forgot-password");
    return;
  }

  // Xóa các OTP cũ của email này để tránh bảng phình to
  await ForgotPassword.deleteMany({ email: email });

  const otp = generateRandomNumber(6);
  const objectForgotPassword = {
    email: email,
    otp: otp,
    expiresAt: new Date(Date.now() + 60 * 1000), // 60 giây = TTL index
  };

  const forgotPassword = new ForgotPassword(objectForgotPassword);
  await forgotPassword.save();

  const subject = "Mã OTP xác thực đặt lại mật khẩu";
  const html = `
    Mã OTP để lấy lại mật khẩu là: <b>${otp}</b>. Thời hạn OTP là 1 phút.
  `;

  sendMailHelper.sendMail(email, subject, html);

  res.redirect("/auth/otp?email=" + email);
};

// [GET] auth/otp
export const otpPassword = (req: Request, res: Response) => {
  const email = req.query.email as string;
  res.render("client/pages/auth/otp-password", {
    pageTitle: "Mã OTP",
    email: email,
  });
};

//[POST] auth/otp
export const postOtpPassword = async (req: Request, res: Response) => {
  const email = req.body.email;
  const otp = req.body.otp;

  const result = await ForgotPassword.findOne({
    email: email,
    otp: otp,
    expiresAt: { $gt: new Date() },
  });

  if (!result) {
    req.flash("error", "Mã OTP không đúng hoặc đã hết hạn!");
    res.redirect("/auth/otp?email=" + email);
    return;
  }

  const user: any = await User.findOne({
    email: email,
    deleted: false,
  });

  if (!user) {
    req.flash("error", "Tài khoản không tồn tại!");
    res.redirect("/auth/forgot-password");
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

  res.redirect("/auth/reset-password?email=" + email);
};

//[GET] /auth/resetPassword
export const resetPassword = (req: Request, res: Response) => {
  const email = req.query.email as string;
  res.render("client/pages/auth/reset-password", {
    pageTitle: "Đặt lại mật khẩu",
    email: email,
  });
};

//[POST] /auth/resetPassword
export const postResetPassword = async (req: Request, res: Response) => {
  const password = req.body.password;
  const userId = res.locals.user.id;

  await User.updateOne(
    {
      _id: userId,
    },
    {
      password: await bcrypt.hash(password, 10),
    },
  );

  res.clearCookie("token");
  req.flash("success", "Đặt lại mật khẩu thành công, vui lòng đăng nhập lại");
  res.redirect("/auth/login");
};
