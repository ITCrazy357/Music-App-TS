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
exports.permissionsPatch = exports.permissions = exports.deletePermanent = exports.restore = exports.trash = exports.deleteItem = exports.changeStatus = exports.detail = exports.editPatch = exports.edit = exports.createPost = exports.create = exports.changeMulti = exports.index = void 0;
const role_model_1 = __importDefault(require("../../models/role.model"));
const system_1 = require("../../config/system");
const pagination_1 = require("../../helpers/pagination");
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const find = { deleted: false };
        let keyword = "";
        if (req.query.keyword) {
            keyword = req.query.keyword;
            const regex = new RegExp(keyword, "i");
            find.$or = [{ title: regex }, { description: regex }];
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
        const countRecords = yield role_model_1.default.countDocuments(find);
        const objectPagination = (0, pagination_1.pagination)({
            currentPage: 1,
            limitItems: 4,
        }, req.query, countRecords);
        const roles = yield role_model_1.default.find(find)
            .limit(objectPagination.limitItems)
            .skip(objectPagination.skip);
        res.render("admin/pages/roles/index", {
            pageTitle: "Nhóm quyền",
            roles,
            keyword,
            filterStatus,
            pagination: objectPagination,
        });
    }
    catch (error) {
        req.flash("error", "Không tải được danh sách nhóm quyền.");
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
                yield role_model_1.default.updateMany({ _id: { $in: ids } }, { status: type, updatedBy });
                req.flash("success", `Cập nhật trạng thái thành công cho ${ids.length} nhóm quyền!`);
                break;
            case "delete-all":
                yield role_model_1.default.updateMany({ _id: { $in: ids } }, { deleted: true, deletedAt: new Date(), deletedBy: updatedBy });
                req.flash("success", `Đã xóa thành công ${ids.length} nhóm quyền!`);
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
    res.render("admin/pages/roles/create", {
        pageTitle: "Thêm mới nhóm quyền",
    });
});
exports.create = create;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const createdBy = {
            accountId: res.locals.user ? res.locals.user._id : "mockId",
            createdAt: new Date(),
        };
        const role = new role_model_1.default(Object.assign(Object.assign({}, req.body), { createdBy }));
        yield role.save();
        req.flash("success", "Thêm mới nhóm quyền thành công.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/roles`);
    }
    catch (error) {
        req.flash("error", "Lỗi tạo nhóm quyền.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/roles`);
    }
});
exports.createPost = createPost;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const role = yield role_model_1.default.findOne({ _id: id, deleted: false });
        if (!role) {
            req.flash("error", "Nhóm quyền không tồn tại.");
            return res.redirect(`/${system_1.systemConfig.prefixAdmin}/roles`);
        }
        res.render("admin/pages/roles/edit", {
            pageTitle: "Chỉnh sửa nhóm quyền",
            role,
        });
    }
    catch (error) {
        req.flash("error", "Lỗi tải trang chỉnh sửa.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/roles`);
    }
});
exports.edit = edit;
const editPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const updatedBy = {
            accountId: res.locals.user ? res.locals.user._id : "mockId",
            updatedAt: new Date(),
        };
        yield role_model_1.default.updateOne({ _id: id }, Object.assign(Object.assign({}, req.body), { updatedBy }));
        req.flash("success", "Cập nhật nhóm quyền thành công.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/roles`);
    }
    catch (error) {
        req.flash("error", "Lỗi cập nhật.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/roles`);
    }
});
exports.editPatch = editPatch;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const role = yield role_model_1.default.findOne({ _id: id, deleted: false });
        if (!role) {
            req.flash("error", "Nhóm quyền không tồn tại.");
            return res.redirect(`/${system_1.systemConfig.prefixAdmin}/roles`);
        }
        res.render("admin/pages/roles/detail", {
            pageTitle: "Chi tiết nhóm quyền",
            role,
        });
    }
    catch (error) {
        req.flash("error", "Lỗi tải chi tiết.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/roles`);
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
        yield role_model_1.default.updateOne({ _id: id }, { status: status, updatedBy });
        req.flash("success", "Đã thay đổi trạng thái.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/roles`);
    }
    catch (error) {
        req.flash("error", "Lỗi thay đổi trạng thái.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/roles`);
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
        yield role_model_1.default.updateOne({ _id: id }, { deleted: true, deletedAt: new Date(), deletedBy });
        req.flash("success", "Nhóm quyền đã được chuyển vào thùng rác.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/roles`);
    }
    catch (error) {
        req.flash("error", "Lỗi xóa nhóm quyền.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/roles`);
    }
});
exports.deleteItem = deleteItem;
const trash = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const find = { deleted: true };
        const countRecords = yield role_model_1.default.countDocuments(find);
        const objectPagination = (0, pagination_1.pagination)({
            currentPage: 1,
            limitItems: 4,
        }, req.query, countRecords);
        const roles = yield role_model_1.default.find(find)
            .limit(objectPagination.limitItems)
            .skip(objectPagination.skip);
        res.render("admin/pages/roles/trash", {
            pageTitle: "Thùng rác nhóm quyền",
            roles,
            pagination: objectPagination,
        });
    }
    catch (error) {
        req.flash("error", "Lỗi tải thùng rác.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/roles`);
    }
});
exports.trash = trash;
const restore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        yield role_model_1.default.updateOne({ _id: id }, { deleted: false });
        req.flash("success", "Đã khôi phục nhóm quyền.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/roles`);
    }
    catch (error) {
        req.flash("error", "Lỗi khôi phục.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/roles`);
    }
});
exports.restore = restore;
const deletePermanent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        yield role_model_1.default.deleteOne({ _id: id });
        req.flash("success", "Đã xóa vĩnh viễn nhóm quyền.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/roles`);
    }
    catch (error) {
        req.flash("error", "Lỗi xóa vĩnh viễn.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/roles`);
    }
});
exports.deletePermanent = deletePermanent;
const permissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield role_model_1.default.find({ deleted: false });
        res.render("admin/pages/roles/permissions", {
            pageTitle: "Phân quyền",
            roles,
        });
    }
    catch (error) {
        req.flash("error", "Lỗi tải trang phân quyền.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/roles`);
    }
});
exports.permissions = permissions;
const permissionsPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const permissions = JSON.parse(req.body.permissions);
        const updatedBy = {
            accountId: res.locals.user ? res.locals.user._id : "mockId",
            updatedAt: new Date(),
        };
        for (const item of permissions) {
            yield role_model_1.default.updateOne({ _id: item.id }, { permissions: item.permissions, updatedBy });
        }
        req.flash("success", "Cập nhật phân quyền thành công.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/roles/permissions`);
    }
    catch (error) {
        req.flash("error", "Lỗi cập nhật phân quyền.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/roles/permissions`);
    }
});
exports.permissionsPatch = permissionsPatch;
