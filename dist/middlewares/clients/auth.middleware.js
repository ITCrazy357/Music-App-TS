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
exports.requirePermission = exports.requireAdmin = exports.requireAuth = exports.injectUser = void 0;
const user_model_1 = __importDefault(require("../../models/user.model"));
const role_model_1 = __importDefault(require("../../models/role.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const system_1 = require("../../config/system");
const injectUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.token;
    if (token) {
        try {
            const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = yield user_model_1.default.findById(decodedToken.id);
            if (user && user.status === "active") {
                let role = null;
                if (user.role_id) {
                    role = yield role_model_1.default.findById(user.role_id);
                }
                res.locals.user = user;
                res.locals.role = role;
            }
        }
        catch (error) {
        }
    }
    next();
});
exports.injectUser = injectUser;
const requireAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.token;
    if (!token) {
        req.flash("error", "Vui lòng đăng nhập");
        res.redirect("/auth/login");
        return;
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = yield user_model_1.default.findById(decodedToken.id);
        if (user.status === "inactive") {
            req.flash("error", "Tài khoản của bạn đã bị khóa!");
            res.redirect("/auth/login");
            return;
        }
        if (!user) {
            res.clearCookie("token");
            res.redirect("/auth/login");
            return;
        }
        let role = null;
        if (user.role_id) {
            role = yield role_model_1.default.findById(user.role_id);
        }
        res.locals.user = user;
        res.locals.role = role;
        next();
    }
    catch (error) {
        res.clearCookie("token");
        res.redirect("/auth/login");
    }
});
exports.requireAuth = requireAuth;
const requireAdmin = (req, res, next) => {
    const role = res.locals.role;
    if (role) {
        next();
    }
    else {
        req.flash("error", "Bạn không có quyền truy cập trang này!");
        res.redirect("/topics");
    }
};
exports.requireAdmin = requireAdmin;
const requirePermission = (permission) => {
    return (req, res, next) => {
        const role = res.locals.role;
        if ((role && role.permissions.includes(permission)) ||
            role.title === "Admin" ||
            role.title === "Account" ||
            role.title === "Content") {
            next();
        }
        else {
            req.flash("error", "Bạn không có quyền thực hiện hành động này!");
            res.redirect(`/${system_1.systemConfig.prefixAdmin}/dashboard`);
        }
    };
};
exports.requirePermission = requirePermission;
