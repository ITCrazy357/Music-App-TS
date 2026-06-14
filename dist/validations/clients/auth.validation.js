"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordValidation = exports.loginValidation = exports.registerValidation = void 0;
const user_model_1 = __importDefault(require("../../models/user.model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const registerValidation = (req, res, next) => {
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
    }
    else if (!/[A-Z]/.test(password)) {
        req.flash("error", "Mật khẩu phải có ít nhất 1 chữ cái in hoa");
        res.redirect("/auth/register");
        return;
    }
    else if (!/[a-z]/.test(password)) {
        req.flash("error", "Mật khẩu phải có ít nhất 1 chữ cái thường");
        res.redirect("/auth/register");
        return;
    }
    else if (!/\d/.test(password)) {
        req.flash("error", "Mật khẩu phải có ít nhất 1 số");
        res.redirect("/auth/register");
        return;
    }
    else if (!/[@$!%*#?&]/.test(password)) {
        req.flash("error", "Mật khẩu phải có ít nhất 1 ký tự đặc biệt");
        res.redirect("/auth/register");
        return;
    }
    next();
};
exports.registerValidation = registerValidation;
const loginValidation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        req.flash("error", "Vui lòng nhập đầy đủ thông tin");
        res.redirect("/auth/login");
        return;
    }
    const user = yield user_model_1.default.findOne({
        email: email,
        deleted: false,
    });
    if (!user) {
        req.flash("error", "Email không tồn tại !");
        res.redirect("/auth/login");
        return;
    }
    else if (user.status === "inactive") {
        req.flash("error", "Tài khoản của bạn đã bị khóa!");
        res.redirect("/auth/login");
        return;
    }
    const isMatch = yield bcrypt_1.default.compare(req.body.password, user.password);
    if (!isMatch) {
        req.flash("error", "Sai mật khẩu");
        res.redirect("/auth/login");
        return;
    }
    next();
});
exports.loginValidation = loginValidation;
const resetPasswordValidation = (req, res, next) => {
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
exports.resetPasswordValidation = resetPasswordValidation;
