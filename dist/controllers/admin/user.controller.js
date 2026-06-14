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
exports.deletePermanent = exports.restore = exports.trash = exports.deleteItem = exports.changeStatus = exports.detail = exports.editPatch = exports.edit = exports.createPost = exports.create = exports.changeMulti = exports.index = void 0;
const user_model_1 = __importDefault(require("../../models/user.model"));
const role_model_1 = __importDefault(require("../../models/role.model"));
const system_1 = require("../../config/system");
const bcrypt_1 = __importDefault(require("bcrypt"));
const pagination_1 = require("../../helpers/pagination");
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const find = { deleted: false };
        let keyword = "";
        if (req.query.keyword) {
            keyword = req.query.keyword;
            const regex = new RegExp(keyword, "i");
            find.$or = [{ fullName: regex }, { email: regex }];
        }
        const filterStatus = [
            { name: "Tất cả", status: "", class: "" },
            { name: "Hoạt động", status: "active", class: "" },
            { name: "Dừng hoạt động", status: "inactive", class: "" },
        ];
        if (req.query.status) {
            find.status = req.query.status;
            const index = filterStatus.findIndex((item) => item.status === find.status);
            if (index !== -1) {
                filterStatus[index].class = "active";
            }
        }
        else {
            filterStatus[0].class = "active";
        }
        let roleId = "";
        if (req.query.role_id) {
            roleId = req.query.role_id;
            find.role_id = roleId;
        }
        const roles = yield role_model_1.default.find({ deleted: false });
        const countRecords = yield user_model_1.default.countDocuments(find);
        const objectPagination = (0, pagination_1.pagination)({
            currentPage: 1,
            limitItems: 4,
        }, req.query, countRecords);
        const users = yield user_model_1.default.find(find)
            .populate("role_id", "title")
            .limit(objectPagination.limitItems)
            .skip(objectPagination.skip);
        res.render("admin/pages/users/index", {
            pageTitle: "Quản lý tài khoản",
            users,
            keyword,
            filterStatus,
            roleId,
            roles,
            pagination: objectPagination,
        });
    }
    catch (error) {
        req.flash("error", "Không tải được danh sách tài khoản.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/dashboard`);
    }
});
exports.index = index;
const changeMulti = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const type = req.body.type;
        const ids = req.body.ids.split(", ");
        const updatedBy = {
            accountId: res.locals.user ? res.locals.user._id : "mockId",
            updatedAt: new Date(),
        };
        switch (type) {
            case "active":
            case "inactive":
                yield user_model_1.default.updateMany({ _id: { $in: ids } }, { status: type, updatedBy });
                req.flash("success", `Cập nhật trạng thái thành công cho ${ids.length} tài khoản!`);
                break;
            case "delete-all":
                yield user_model_1.default.updateMany({ _id: { $in: ids } }, { deleted: true, deletedAt: new Date(), deletedBy: updatedBy });
                req.flash("success", `Đã xóa thành công ${ids.length} tài khoản!`);
                break;
            default:
                break;
        }
        res.redirect("back");
    }
    catch (error) {
        req.flash("error", "Thao tác thất bại!");
        res.redirect("back");
    }
});
exports.changeMulti = changeMulti;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield role_model_1.default.find({ deleted: false });
        res.render("admin/pages/users/create", {
            pageTitle: "Thêm mới tài khoản",
            roles,
        });
    }
    catch (error) {
        req.flash("error", "Lỗi tải trang thêm mới.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/users`);
    }
});
exports.create = create;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const emailExist = yield user_model_1.default.findOne({
            email: req.body.email,
            deleted: false,
        });
        if (emailExist) {
            req.flash("error", "Email đã tồn tại.");
            return res.redirect(`/${system_1.systemConfig.prefixAdmin}/users`);
        }
        if (req.body.password) {
            req.body.password = yield bcrypt_1.default.hash(req.body.password, 10);
        }
        const createdBy = {
            accountId: res.locals.user ? res.locals.user._id : "mockId",
            createdAt: new Date(),
        };
        const user = new user_model_1.default(Object.assign(Object.assign({}, req.body), { createdBy }));
        yield user.save();
        req.flash("success", "Thêm mới tài khoản thành công.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/users`);
    }
    catch (error) {
        req.flash("error", "Lỗi tạo tài khoản.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/users`);
    }
});
exports.createPost = createPost;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = yield user_model_1.default.findOne({ _id: id, deleted: false });
        if (!user) {
            req.flash("error", "Tài khoản không tồn tại.");
            return res.redirect(`/${system_1.systemConfig.prefixAdmin}/users`);
        }
        const roles = yield role_model_1.default.find({ deleted: false });
        res.render("admin/pages/users/edit", {
            pageTitle: "Chỉnh sửa tài khoản",
            user,
            roles,
        });
    }
    catch (error) {
        req.flash("error", "Lỗi trang chỉnh sửa.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/users`);
    }
});
exports.edit = edit;
const editPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const emailExist = yield user_model_1.default.findOne({
            _id: { $ne: id },
            email: req.body.email,
            deleted: false,
        });
        if (emailExist) {
            req.flash("error", "Email đã tồn tại.");
            return res.redirect(`/${system_1.systemConfig.prefixAdmin}/users`);
        }
        if (req.body.password) {
            req.body.password = yield bcrypt_1.default.hash(req.body.password, 10);
        }
        else {
            delete req.body.password;
        }
        const updatedBy = {
            accountId: res.locals.user ? res.locals.user._id : "mockId",
            updatedAt: new Date(),
        };
        yield user_model_1.default.updateOne({ _id: id }, Object.assign(Object.assign({}, req.body), { updatedBy }));
        req.flash("success", "Cập nhật tài khoản thành công.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/users`);
    }
    catch (error) {
        req.flash("error", "Lỗi cập nhật.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/users`);
    }
});
exports.editPatch = editPatch;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = yield user_model_1.default.findOne({ _id: id, deleted: false }).populate("role_id", "title");
        if (!user) {
            req.flash("error", "Tài khoản không tồn tại.");
            return res.redirect(`/${system_1.systemConfig.prefixAdmin}/users`);
        }
        res.render("admin/pages/users/detail", {
            pageTitle: "Chi tiết tài khoản",
            user,
        });
    }
    catch (error) {
        req.flash("error", "Lỗi tải chi tiết.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/users`);
    }
});
exports.detail = detail;
const changeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, id } = req.params;
        const updatedBy = {
            accountId: res.locals.user ? res.locals.user._id : "mockId",
            updatedAt: new Date(),
        };
        yield user_model_1.default.updateOne({ _id: id }, { status: status, updatedBy });
        req.flash("success", "Đã thay đổi trạng thái.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/users`);
    }
    catch (error) {
        req.flash("error", "Lỗi thay đổi trạng thái.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/users`);
    }
});
exports.changeStatus = changeStatus;
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const deletedBy = {
            accountId: res.locals.user ? res.locals.user._id : "mockId",
            deletedAt: new Date(),
        };
        yield user_model_1.default.updateOne({ _id: id }, { deleted: true, deletedAt: new Date(), deletedBy });
        req.flash("success", "Tài khoản đã được chuyển vào thùng rác.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/users`);
    }
    catch (error) {
        req.flash("error", "Lỗi xóa tài khoản.");
        res.redirect(`${system_1.systemConfig.prefixAdmin}/users`);
    }
});
exports.deleteItem = deleteItem;
const trash = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const find = { deleted: true };
        const countRecords = yield user_model_1.default.countDocuments(find);
        const objectPagination = (0, pagination_1.pagination)({
            currentPage: 1,
            limitItems: 4,
        }, req.query, countRecords);
        const users = yield user_model_1.default.find(find)
            .populate("role_id", "title")
            .limit(objectPagination.limitItems)
            .skip(objectPagination.skip);
        res.render("admin/pages/users/trash", {
            pageTitle: "Thùng rác tài khoản",
            users,
            pagination: objectPagination,
        });
    }
    catch (error) {
        req.flash("error", "Lỗi tải thùng rác.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/users`);
    }
});
exports.trash = trash;
const restore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        yield user_model_1.default.updateOne({ _id: id }, { deleted: false });
        req.flash("success", "Đã khôi phục tài khoản.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/users`);
    }
    catch (error) {
        req.flash("error", "Lỗi khôi phục.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/users`);
    }
});
exports.restore = restore;
const deletePermanent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        yield user_model_1.default.deleteOne({ _id: id });
        req.flash("success", "Đã xóa vĩnh viễn tài khoản.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/users`);
    }
    catch (error) {
        req.flash("error", "Lỗi xóa vĩnh viễn.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/users`);
    }
});
exports.deletePermanent = deletePermanent;
