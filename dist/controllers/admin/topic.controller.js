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
exports.deletePermanent = exports.restore = exports.trash = exports.deleteItem = exports.changeMulti = exports.changeStatus = exports.detail = exports.editPatch = exports.edit = exports.createPost = exports.create = exports.index = void 0;
const topic_model_1 = __importDefault(require("../../models/topic.model"));
const convertToSlug_1 = require("../../helpers/convertToSlug");
const system_1 = require("../../config/system");
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const pagination_1 = require("../../helpers/pagination");
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const find = { deleted: false };
        let keyword = "";
        if (req.query.keyword) {
            keyword = req.query.keyword;
            const regex = new RegExp(keyword, "i");
            find.$or = [{ title: regex }, { slug: regex }];
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
        const countRecords = yield topic_model_1.default.countDocuments(find);
        const objectPagination = (0, pagination_1.pagination)({
            currentPage: 1,
            limitItems: 10,
        }, req.query, countRecords);
        const topics = yield topic_model_1.default.find(find)
            .limit(objectPagination.limitItems)
            .skip(objectPagination.skip);
        res.render("admin/pages/topics/index", {
            pageTitle: "Quản lý chủ đề",
            topics,
            keyword,
            filterStatus,
            pagination: objectPagination,
        });
    }
    catch (error) {
        req.flash("error", "Không tải được danh sách chủ đề.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/topics`);
    }
});
exports.index = index;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("admin/pages/topics/create", {
        pageTitle: "Thêm mới chủ đề",
    });
});
exports.create = create;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, status } = req.body;
        if (!title) {
            req.flash("error", "Tiêu đề là bắt buộc.");
            return res.redirect(`/${system_1.systemConfig.prefixAdmin}/topics`);
        }
        let baseSlug = req.body.slug
            ? (0, convertToSlug_1.convertToSlug)(req.body.slug.trim())
            : (0, convertToSlug_1.convertToSlug)(title);
        let slug = baseSlug;
        let count = 1;
        while (yield topic_model_1.default.exists({ slug: slug })) {
            slug = `${baseSlug}-${count}`;
            count++;
        }
        const payload = {
            title,
            description: description ? (0, sanitize_html_1.default)(description, {
                allowedTags: sanitize_html_1.default.defaults.allowedTags.concat(['img']),
                allowedAttributes: Object.assign(Object.assign({}, sanitize_html_1.default.defaults.allowedAttributes), { img: ['src', 'alt', 'width', 'height', 'style', 'class'] })
            }) : "",
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
        const topic = new topic_model_1.default(Object.assign(Object.assign({}, payload), { createdBy }));
        yield topic.save();
        req.flash("success", "Thêm chủ đề thành công.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/topics`);
    }
    catch (error) {
        console.error("Error creating topic:", error);
        req.flash("error", "Không thể thêm mới chủ đề.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/topics`);
    }
});
exports.createPost = createPost;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const topic = yield topic_model_1.default.findOne({ _id: id, deleted: false });
        if (!topic) {
            req.flash("error", "Chủ đề không tồn tại.");
            return res.redirect(`/${system_1.systemConfig.prefixAdmin}/topics`);
        }
        res.render("admin/pages/topics/edit", {
            pageTitle: "Chỉnh sửa chủ đề",
            topic,
        });
    }
    catch (error) {
        req.flash("error", "Không thể mở trang chỉnh sửa.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/topics`);
    }
});
exports.edit = edit;
const editPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const { title, description, status } = req.body;
        const updatedBy = {
            account_id: res.locals.user ? res.locals.user._id : "mockId",
            updatedAt: new Date(),
        };
        if (!title) {
            req.flash("error", "Tiêu đề là bắt buộc.");
            return res.redirect(`/${system_1.systemConfig.prefixAdmin}/topics`);
        }
        let baseSlug = req.body.slug
            ? (0, convertToSlug_1.convertToSlug)(req.body.slug.trim())
            : (0, convertToSlug_1.convertToSlug)(title);
        let slug = baseSlug;
        let count = 1;
        while (yield topic_model_1.default.exists({ slug: slug, _id: { $ne: id } })) {
            slug = `${baseSlug}-${count}`;
            count++;
        }
        const payload = {
            title,
            description: description ? (0, sanitize_html_1.default)(description, {
                allowedTags: sanitize_html_1.default.defaults.allowedTags.concat(['img']),
                allowedAttributes: Object.assign(Object.assign({}, sanitize_html_1.default.defaults.allowedAttributes), { img: ['src', 'alt', 'width', 'height', 'style', 'class'] })
            }) : "",
            status: status || "inactive",
            slug: slug,
        };
        if (req.body.avatar) {
            payload.avatar = req.body.avatar;
        }
        yield topic_model_1.default.updateOne({ _id: id }, Object.assign(Object.assign({}, payload), { updatedBy: updatedBy }));
        req.flash("success", "Cập nhật chủ đề thành công.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/topics`);
    }
    catch (error) {
        console.error(error);
        req.flash("error", "Không thể cập nhật chủ đề.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/topics`);
    }
});
exports.editPatch = editPatch;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const topic = yield topic_model_1.default.findOne({
            _id: id,
            deleted: false,
        });
        if (!topic) {
            req.flash("error", "Chủ đề không tồn tại.");
            return res.redirect(`/${system_1.systemConfig.prefixAdmin}/topics`);
        }
        res.render("admin/pages/topics/detail", {
            pageTitle: "Chi tiết chủ đề",
            topic,
        });
    }
    catch (error) {
        req.flash("error", "Không thể tải chi tiết chủ đề.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/topics`);
    }
});
exports.detail = detail;
const changeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, id } = req.params;
        const updateBy = {
            account_id: res.locals.user ? res.locals.user._id : "mockId",
            updatedAt: new Date(),
        };
        yield topic_model_1.default.updateOne({ _id: id }, { status: status, updatedBy: updateBy });
        req.flash("success", "Đã thay đổi trạng thái.");
        res.redirect(req.get("referer") || `/${system_1.systemConfig.prefixAdmin}/topics`);
    }
    catch (error) {
        req.flash("error", "Không thể thay đổi trạng thái.");
        res.redirect(req.get("referer") || `/${system_1.systemConfig.prefixAdmin}/topics`);
    }
});
exports.changeStatus = changeStatus;
const changeMulti = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const type = req.body.type;
        const ids = req.body.ids.split(", ");
        const updatedBy = {
            account_id: res.locals.user ? res.locals.user._id : "mockId",
            updatedAt: new Date(),
        };
        switch (type) {
            case "active":
            case "inactive":
                yield topic_model_1.default.updateMany({ _id: { $in: ids } }, { status: type, updatedBy });
                req.flash("success", `Cập nhật trạng thái thành công cho ${ids.length} chủ đề!`);
                break;
            case "delete-all":
                yield topic_model_1.default.updateMany({ _id: { $in: ids } }, { deleted: true, deleteAt: new Date(), deletedBy: updatedBy });
                req.flash("success", `Đã xóa thành công ${ids.length} chủ đề!`);
                break;
            default:
                break;
        }
        res.redirect(req.get("referer") || `/${system_1.systemConfig.prefixAdmin}/topics`);
    }
    catch (error) {
        req.flash("error", "Thao tác thất bại!");
        res.redirect(req.get("referer") || `/${system_1.systemConfig.prefixAdmin}/topics`);
    }
});
exports.changeMulti = changeMulti;
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const deletedBy = {
            account_id: res.locals.user ? res.locals.user._id : "mockId",
            deletedAt: new Date(),
        };
        yield topic_model_1.default.updateOne({ _id: id }, { deleted: true, deleteAt: new Date(), deletedBy: deletedBy });
        req.flash("success", "Chủ đề đã được chuyển vào thùng rác.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/topics`);
    }
    catch (error) {
        req.flash("error", "Không thể xóa chủ đề.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/topics`);
    }
});
exports.deleteItem = deleteItem;
const trash = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const find = { deleted: true };
        const countRecords = yield topic_model_1.default.countDocuments(find);
        const objectPagination = (0, pagination_1.pagination)({
            currentPage: 1,
            limitItems: 4,
        }, req.query, countRecords);
        const topics = yield topic_model_1.default.find(find)
            .limit(objectPagination.limitItems)
            .skip(objectPagination.skip);
        res.render("admin/pages/topics/trash", {
            pageTitle: "Thùng rác chủ đề",
            topics,
            pagination: objectPagination,
        });
    }
    catch (error) {
        req.flash("error", "Không thể tải thùng rác chủ đề.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/topics`);
    }
});
exports.trash = trash;
const restore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        yield topic_model_1.default.updateOne({ _id: id }, { deleted: false });
        req.flash("success", "Đã khôi phục chủ đề.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/topics`);
    }
    catch (error) {
        req.flash("error", "Không thể khôi phục chủ đề.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/topics`);
    }
});
exports.restore = restore;
const deletePermanent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        yield topic_model_1.default.deleteOne({ _id: id });
        req.flash("success", "Đã xóa vĩnh viễn chủ đề.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/topics`);
    }
    catch (error) {
        req.flash("error", "Không thể xóa vĩnh viễn chủ đề.");
        res.redirect(`/${system_1.systemConfig.prefixAdmin}/topics`);
    }
});
exports.deletePermanent = deletePermanent;
