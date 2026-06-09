import { Request, Response, NextFunction } from "express";
import User from "../../models/user.model";
import bcrypt from "bcrypt";

export const registerValidation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { fullName, email, password, confirmPassword } = req.body;

  if (!fullName || !email || !password || !confirmPassword) {
    req.flash("error", "Vui lòng nhập đầy đủ thông tin");
    res.redirect("/auth/register");
    return;
  }

  if (password !== confirmPassword) {
    req.flash("error", "Mật khẩu xác nhận không khớp");
    res.redirect("/auth/register");
    return;
  }

  if (password.length < 6) {
    req.flash("error", "Mật khẩu phải có ít nhất 6 ký tự");
    res.redirect("/auth/register");
    return;
  } else if (!/[A-Z]/.test(password)) {
    req.flash("error", "Mật khẩu phải có ít nhất 1 chữ cái in hoa");
    res.redirect("/auth/register");
    return;
  } else if (!/[a-z]/.test(password)) {
    req.flash("error", "Mật khẩu phải có ít nhất 1 chữ cái thường");
    res.redirect("/auth/register");
    return;
  } else if (!/\d/.test(password)) {
    req.flash("error", "Mật khẩu phải có ít nhất 1 số");
    res.redirect("/auth/register");
    return;
  } else if (!/[@$!%*#?&]/.test(password)) {
    req.flash("error", "Mật khẩu phải có ít nhất 1 ký tự đặc biệt");
    res.redirect("/auth/register");
    return;
  }
  next();
};

export const loginValidation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;
  if (!email || !password) {
    req.flash("error", "Vui lòng nhập đầy đủ thông tin");
    res.redirect("/auth/login");
    return;
  }
  const user: any = await User.findOne({
    email: email,
    deleted: false,
  });

  if (!user) {
    req.flash("error", "Email không tồn tại !");
    res.redirect("/auth/login");
    return;
  } else if (user.status === "inactive") {
    req.flash("error", "Tài khoản của bạn đã bị khóa!");
    res.redirect("/auth/login");
    return;
  }

  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isMatch) {
    req.flash("error", "Sai mật khẩu");
    res.redirect("/auth/login");
    return;
  }

  next();
};

export const resetPasswordValidation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.body.password !== req.body.confirmPassword) {
    req.flash("error", "Mật khẩu xác nhận không khớp");
    res.redirect("/auth/reset-password");
    return;
  }

  if (!req.body.password || !req.body.confirmPassword) {
    req.flash("error", "Vui lòng nhập đầy đủ thông tin");
    res.redirect("/auth/reset-password");
    return;
  }
  next();
};
