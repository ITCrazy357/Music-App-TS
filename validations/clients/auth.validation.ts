import { Request, Response, NextFunction } from "express";

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

export const loginValidation = (
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
  next();
};

