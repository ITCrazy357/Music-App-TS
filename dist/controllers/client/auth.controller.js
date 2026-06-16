"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.postResetPassword = exports.resetPassword = exports.postOtpPassword = exports.otpPassword = exports.postForgotPassword = exports.forgotPassword = exports.logout = exports.postRegister = exports.register = exports.postLogin = exports.login = void 0;
const user_model_1 = __importDefault(require("../../models/user.model"));
const role_model_1 = __importDefault(require("../../models/role.model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const system_1 = require("../../config/system");
const generate_1 = require("../../helpers/generate");
const forgot_password_model_1 = __importDefault(require("../../models/forgot-password.model"));
const sendMailHelper = __importStar(require("../../helpers/sendMail"));
const login = (req, res) => {
    if (res.locals.user) {
        if (res.locals.role && res.locals.role.title === "superAdmin") {
            res.redirect(`/${system_1.systemConfig.prefixAdmin}/dashboard`);
        }
        else {
            res.redirect("/topics");
        }
        return;
    }
    else {
        res.clearCookie("token");
    }
    res.render("client/pages/auth/login", {
        pageTitle: "Đăng nhập",
    });
};
exports.login = login;
const postLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const user = yield user_model_1.default.findOne({
        email: email,
        deleted: false,
    });
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
    }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
    res.cookie("token", token);
    req.flash("success", "Đăng nhập thành công");
    let redirectUrl = "/topics";
    if (user.role_id) {
        const role = yield role_model_1.default.findById(user.role_id);
        if ((role && role.title === "Admin") ||
            (role && role.title === "Account") ||
            (role && role.title === "Content")) {
            redirectUrl = `/${system_1.systemConfig.prefixAdmin}/dashboard`;
        }
    }
    res.redirect(redirectUrl);
});
exports.postLogin = postLogin;
const register = (req, res) => {
    res.render("client/pages/auth/register", {
        pageTitle: "Đăng ký",
    });
};
exports.register = register;
const postRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const existEmail = yield user_model_1.default.findOne({
        email: req.body.email,
        deleted: false,
    });
    if (existEmail) {
        req.flash("error", "Email đã tồn tại trong hệ thống!");
        res.redirect("/auth/register");
        return;
    }
    let userRole = yield role_model_1.default.findOne({ title: "User" });
    if (!userRole) {
        userRole = new role_model_1.default({ title: "User" });
        yield userRole.save();
    }
    req.body.password = yield bcrypt_1.default.hash(req.body.password, 10);
    const user = new user_model_1.default({
        fullName: req.body.fullName,
        email: req.body.email,
        password: req.body.password,
        role_id: userRole._id,
        status: "active",
    });
    yield user.save();
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
    }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
    res.cookie("token", token);
    req.flash("success", "Đăng ký thành công");
    res.redirect("/topics");
});
exports.postRegister = postRegister;
const logout = (req, res) => {
    res.clearCookie("token");
    req.flash("success", "Đăng xuất thành công");
    res.redirect("/");
};
exports.logout = logout;
const forgotPassword = (req, res) => {
    res.render("client/pages/auth/forgot-password", {
        pageTitle: "Quên mật khẩu",
    });
};
exports.forgotPassword = forgotPassword;
const postForgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const user = yield user_model_1.default.findOne({
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
    yield forgot_password_model_1.default.deleteMany({ email: email });
    const otp = (0, generate_1.generateRandomNumber)(6);
    const objectForgotPassword = {
        email: email,
        otp: otp,
        expiresAt: new Date(Date.now() + 60 * 1000),
    };
    const forgotPassword = new forgot_password_model_1.default(objectForgotPassword);
    yield forgotPassword.save();
    const subject = "Mã OTP xác thực đặt lại mật khẩu";
    const html = `
    Mã OTP để lấy lại mật khẩu là: <b>${otp}</b>. Thời hạn OTP là 1 phút.
  `;
    sendMailHelper.sendMail(email, subject, html);
    res.redirect("/auth/otp?email=" + email);
});
exports.postForgotPassword = postForgotPassword;
const otpPassword = (req, res) => {
    const email = req.query.email;
    res.render("client/pages/auth/otp-password", {
        pageTitle: "Mã OTP",
        email: email,
    });
};
exports.otpPassword = otpPassword;
const postOtpPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const otp = req.body.otp;
    const result = yield forgot_password_model_1.default.findOne({
        email: email,
        otp: otp,
        expiresAt: { $gt: new Date() },
    });
    if (!result) {
        req.flash("error", "Mã OTP không đúng hoặc đã hết hạn!");
        res.redirect("/auth/otp?email=" + email);
        return;
    }
    const user = yield user_model_1.default.findOne({
        email: email,
        deleted: false,
    });
    if (!user) {
        req.flash("error", "Tài khoản không tồn tại!");
        res.redirect("/auth/forgot-password");
        return;
    }
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
    }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
    res.cookie("token", token);
    res.redirect("/auth/reset-password?email=" + email);
});
exports.postOtpPassword = postOtpPassword;
const resetPassword = (req, res) => {
    const email = req.query.email;
    res.render("client/pages/auth/reset-password", {
        pageTitle: "Đặt lại mật khẩu",
        email: email,
    });
};
exports.resetPassword = resetPassword;
const postResetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const password = req.body.password;
    const userId = res.locals.user.id;
    yield user_model_1.default.updateOne({
        _id: userId,
    }, {
        password: yield bcrypt_1.default.hash(password, 10),
    });
    res.clearCookie("token");
    req.flash("success", "Đặt lại mật khẩu thành công, vui lòng đăng nhập lại");
    res.redirect("/auth/login");
});
exports.postResetPassword = postResetPassword;
