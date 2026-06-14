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
const singer_model_1 = __importDefault(require("../../models/singer.model"));
const system_1 = require("../../config/system");
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const convertToSlug_1 = require("../../helpers/convertToSlug");
const pagination_1 = require("../../helpers/pagination");
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const find = { deleted: false };
        let keyword = "";
        if (req.query.keyword) {
            keyword = req.query.keyword;
            const regex = new RegExp(keyword, "i");
            find.$or = [{ fullName: regex }, { slug: regex }];
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
        const countRecords = yield singer_model_1.default.countDocuments(find);
        const objectPagination = (0, pagination_1.pagination)({
            currentPage: 1,
            limitItems: 10,
        }, req.query, countRecords);
        const singers = yield singer_model_1.default.find(find)
            .limit(objectPagination.limitItems)
            .skip(objectPagination.skip);
        res.render("admin/pages/singers/index", {
            pageTitle: "Quản lý ca sĩ",
            singers,
            keyword,
            filterStatus,
            pagination: objectPagination,
        });
    }
    catch (error) {
        req.flash("error", "Không tải được danh sách ca sĩ.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/singers`);
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
                yield singer_model_1.default.updateMany({ _id: { $in: ids } }, { status: type, updatedBy });
                req.flash("success", `Cập nhật trạng thái thành công cho ${ids.length} ca sĩ!`);
                break;
            case "delete-all":
                yield singer_model_1.default.updateMany({ _id: { $in: ids } }, { deleted: true, deletedAt: new Date(), deletedBy: updatedBy });
                req.flash("success", `Đã xóa thành công ${ids.length} ca sĩ!`);
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
    res.render("admin/pages/singers/create", {
        pageTitle: "Thêm mới ca sĩ",
    });
});
exports.create = create;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullName, description, status } = req.body;
        if (!fullName) {
            req.flash("error", "Tên ca sĩ là bắt buộc.");
            return res.redirect(`/${system_1.systemConfig.prefixAdmin}/singers/create`);
        }
        let baseSlug = (0, convertToSlug_1.convertToSlug)(fullName);
        let slug = baseSlug;
        let count = 1;
        while (yield singer_model_1.default.exists({ slug: slug })) {
            slug = `${baseSlug}-${count}`;
            count++;
        }
        const payload = {
            fullName,
            description: description
                ? (0, sanitize_html_1.default)(description, {
                    allowedTags: sanitize_html_1.default.defaults.allowedTags.concat(["img"]),
                    allowedAttributes: Object.assign(Object.assign({}, sanitize_html_1.default.defaults.allowedAttributes), { img: ["src", "alt", "width", "height", "style", "class"] }),
                })
                : "",
            status: status || "inactive",
            slug: slug,
        };
        if (req.body.avatar) {
            payload.avatar = req.body.avatar;
        }
        const createdBy = {
            accountId: res.locals.user ? res.locals.user._id : "mockId",
            createdAt: new Date(),
        };
        const singer = new singer_model_1.default(Object.assign(Object.assign({}, payload), { createdBy }));
        yield singer.save();
        req.flash("success", "Thêm ca sĩ thành công.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/singers`);
    }
    catch (error) {
        console.error("Error creating singer:", error);
        req.flash("error", "Không thể thêm mới ca sĩ.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/singers`);
    }
});
exports.createPost = createPost;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const singer = yield singer_model_1.default.findOne({ _id: id, deleted: false });
        if (!singer) {
            req.flash("error", "Ca sĩ không tồn tại.");
            return res.redirect(`/${system_1.systemConfig.prefixAdmin}/singers`);
        }
        res.render("admin/pages/singers/edit", {
            pageTitle: "Chỉnh sửa ca sĩ",
            singer,
        });
    }
    catch (error) {
        req.flash("error", "Không thể mở trang chỉnh sửa.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/singers`);
    }
});
exports.edit = edit;
const editPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const { fullName, description, status } = req.body;
        const updatedBy = {
            accountId: res.locals.user ? res.locals.user._id : "mockId",
            updatedAt: new Date(),
        };
        if (!fullName) {
            req.flash("error", "Tên ca sĩ là bắt buộc.");
            return res.redirect(`/${system_1.systemConfig.prefixAdmin}/singers/edit/${id}`);
        }
        const payload = {
            fullName,
            description: description
                ? (0, sanitize_html_1.default)(description, {
                    allowedTags: sanitize_html_1.default.defaults.allowedTags.concat(["img"]),
                    allowedAttributes: Object.assign(Object.assign({}, sanitize_html_1.default.defaults.allowedAttributes), { img: ["src", "alt", "width", "height", "style", "class"] }),
                })
                : "",
            status: status || "inactive",
        };
        if (req.body.avatar) {
            payload.avatar = req.body.avatar;
        }
        yield singer_model_1.default.updateOne({ _id: id }, Object.assign(Object.assign({}, payload), { updatedBy }));
        req.flash("success", "Cập nhật ca sĩ thành công.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/singers`);
    }
    catch (error) {
        console.error(error);
        req.flash("error", "Không thể cập nhật ca sĩ.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/singers`);
    }
});
exports.editPatch = editPatch;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const singer = yield singer_model_1.default.findOne({ _id: id, deleted: false });
        if (!singer) {
            req.flash("error", "Ca sĩ không tồn tại.");
            return res.redirect(`/${system_1.systemConfig.prefixAdmin}/singers`);
        }
        res.render("admin/pages/singers/detail", {
            pageTitle: "Chi tiết ca sĩ",
            singer,
        });
    }
    catch (error) {
        req.flash("error", "Không thể tải chi tiết ca sĩ.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/singers`);
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
        yield singer_model_1.default.updateOne({ _id: id }, { status: status, updatedBy });
        req.flash("success", "Đã thay đổi trạng thái.");
        res.redirect("back");
    }
    catch (error) {
        req.flash("error", "Không thể thay đổi trạng thái.");
        res.redirect("back");
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
        yield singer_model_1.default.updateOne({ _id: id }, { deleted: true, deletedAt: new Date(), deletedBy });
        req.flash("success", "Ca sĩ đã được chuyển vào thùng rác.");
        res.redirect("back");
    }
    catch (error) {
        req.flash("error", "Không thể xóa ca sĩ.");
        res.redirect("back");
    }
});
exports.deleteItem = deleteItem;
const trash = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const find = { deleted: true };
        const countRecords = yield singer_model_1.default.countDocuments(find);
        const objectPagination = (0, pagination_1.pagination)({
            currentPage: 1,
            limitItems: 4,
        }, req.query, countRecords);
        const singers = yield singer_model_1.default.find(find)
            .limit(objectPagination.limitItems)
            .skip(objectPagination.skip);
        res.render("admin/pages/singers/trash", {
            pageTitle: "Thùng rác ca sĩ",
            singers,
            pagination: objectPagination,
        });
    }
    catch (error) {
        req.flash("error", "Không thể tải thùng rác ca sĩ.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/singers`);
    }
});
exports.trash = trash;
const restore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        yield singer_model_1.default.updateOne({ _id: id }, { deleted: false });
        req.flash("success", "Đã khôi phục ca sĩ.");
        res.redirect("back");
    }
    catch (error) {
        req.flash("error", "Không thể khôi phục ca sĩ.");
        res.redirect("back");
    }
});
exports.restore = restore;
const deletePermanent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        yield singer_model_1.default.deleteOne({ _id: id });
        req.flash("success", "Đã xóa vĩnh viễn ca sĩ.");
        res.redirect("back");
    }
    catch (error) {
        req.flash("error", "Không thể xóa vĩnh viễn ca sĩ.");
        res.redirect("back");
    }
});
exports.deletePermanent = deletePermanent;
