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
exports.deletePermanent = exports.restore = exports.trash = exports.deleteItem = exports.changeStatus = exports.detail = exports.editPatch = exports.edit = exports.createPost = exports.create = exports.index = void 0;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const ad_model_1 = __importDefault(require("../../models/ad.model"));
const pagination_1 = require("../../helpers/pagination");
const buildSlugUnique = (baseSlug, id) => __awaiter(void 0, void 0, void 0, function* () {
    let slug = baseSlug;
    let count = 1;
    while (true) {
        const query = { slug };
        if (id)
            query._id = { $ne: id };
        const exists = yield ad_model_1.default.exists(query);
        if (!exists)
            break;
        slug = `${baseSlug}-${count}`;
        count++;
    }
    return slug;
});
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const find = { deleted: false };
        let keyword = "";
        if (req.query.keyword) {
            keyword = req.query.keyword;
            const regex = new RegExp(keyword, "i");
            find.$or = [{ title: regex }, { slug: regex }, { description: regex }];
        }
        const filterStatus = [
            { name: "Tất cả", status: "", class: "" },
            { name: "Đang hoạt động", status: "active", class: "" },
            { name: "Dừng", status: "inactive", class: "" },
            { name: "Draft", status: "draft", class: "" },
        ];
        if (req.query.status) {
            const q = req.query.status;
            if (q === "draft") {
                find.isDraft = true;
            }
            else if (q) {
                find.status = q;
            }
            const idx = filterStatus.findIndex((i) => i.status === q);
            if (idx !== -1)
                filterStatus[idx].class = "active";
        }
        else {
            filterStatus[0].class = "active";
        }
        const countRecords = yield ad_model_1.default.countDocuments(find);
        const objectPagination = (0, pagination_1.pagination)({ currentPage: 1, limitItems: 10 }, req.query, countRecords);
        const ads = yield ad_model_1.default.find(find)
            .sort({ priority: -1, createdAt: -1 })
            .limit(objectPagination.limitItems)
            .skip(objectPagination.skip);
        res.render("admin/pages/ads/index", {
            pageTitle: "Quản lý quảng cáo",
            ads,
            keyword,
            filterStatus,
            pagination: objectPagination,
        });
    }
    catch (error) {
        req.flash("error", "Không tải được danh sách quảng cáo.");
        res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
    }
});
exports.index = index;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("admin/pages/ads/create", {
        pageTitle: "Thêm quảng cáo",
    });
});
exports.create = create;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, slug, description, targetUrl, image, positions, status, priority, sponsorLevel, startDate, endDate, isDraft, } = req.body;
        if (!title || !targetUrl || !positions) {
            req.flash("error", "Thiếu dữ liệu bắt buộc (title/targetUrl/positions). ");
            return res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
        }
        const positionsArray = Array.isArray(positions) ? positions : [positions];
        const baseSlug = typeof slug === "string" && slug ? slug.trim() : String(title);
        const finalSlug = yield buildSlugUnique(finalSlugSafe(baseSlug));
        const payload = {
            title: String(title).trim(),
            slug: finalSlug,
            description: description
                ? (0, sanitize_html_1.default)(description, {
                    allowedTags: sanitize_html_1.default.defaults.allowedTags.concat(["img"]),
                    allowedAttributes: Object.assign(Object.assign({}, sanitize_html_1.default.defaults.allowedAttributes), { img: ["src", "alt", "width", "height", "style", "class"] }),
                })
                : "",
            targetUrl: String(targetUrl).trim(),
            image: image || "",
            positions: positionsArray,
            status: status || "inactive",
            priority: priority ? Number(priority) : 1,
            sponsorLevel: sponsorLevel || "",
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : new Date(),
            isDraft: isDraft === "true" || isDraft === true,
            createdBy: {
                accountId: res.locals.user ? res.locals.user._id : "mockId",
                createdAt: new Date(),
            },
        };
        const ad = new ad_model_1.default(payload);
        yield ad.save();
        req.flash("success", "Thêm quảng cáo thành công.");
        res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
    }
    catch (error) {
        req.flash("error", "Không thể thêm quảng cáo.");
        res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
    }
});
exports.createPost = createPost;
function finalSlugSafe(input) {
    return input
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "")
        .replace(/\-+/g, "-");
}
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const ad = yield ad_model_1.default.findOne({ _id: id, deleted: false });
        if (!ad) {
            req.flash("error", "Quảng cáo không tồn tại.");
            return res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
        }
        res.render("admin/pages/ads/edit", {
            pageTitle: "Chỉnh sửa quảng cáo",
            ad,
        });
    }
    catch (error) {
        req.flash("error", "Không thể mở trang chỉnh sửa.");
        res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
    }
});
exports.edit = edit;
const editPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const adCurrent = yield ad_model_1.default.findOne({ _id: id, deleted: false });
        if (!adCurrent) {
            req.flash("error", "Quảng cáo không tồn tại.");
            return res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
        }
        const { title, slug, description, targetUrl, image, positions, status, priority, sponsorLevel, startDate, endDate, isDraft, } = req.body;
        if (!title || !targetUrl || !positions) {
            req.flash("error", "Thiếu dữ liệu bắt buộc (title/targetUrl/positions). ");
            return res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
        }
        const positionsArray = Array.isArray(positions) ? positions : [positions];
        const baseSlug = slug ? String(slug).trim() : String(title);
        const finalSlug = yield buildSlugUnique(finalSlugSafe(baseSlug), id);
        const updatedBy = {
            accountId: res.locals.user ? res.locals.user._id : "mockId",
            updatedAt: new Date(),
        };
        const payload = {
            title: String(title).trim(),
            slug: finalSlug,
            description: description
                ? (0, sanitize_html_1.default)(description, {
                    allowedTags: sanitize_html_1.default.defaults.allowedTags.concat(["img"]),
                    allowedAttributes: Object.assign(Object.assign({}, sanitize_html_1.default.defaults.allowedAttributes), { img: ["src", "alt", "width", "height", "style", "class"] }),
                })
                : "",
            targetUrl: String(targetUrl).trim(),
            image: image || "",
            positions: positionsArray,
            status: status || "inactive",
            priority: priority ? Number(priority) : 1,
            sponsorLevel: sponsorLevel || "",
            startDate: startDate ? new Date(startDate) : adCurrent.startDate,
            endDate: endDate ? new Date(endDate) : adCurrent.endDate,
            isDraft: isDraft === "true" || isDraft === true,
            updatedBy,
        };
        yield ad_model_1.default.updateOne({ _id: id }, payload);
        req.flash("success", "Cập nhật quảng cáo thành công.");
        res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
    }
    catch (error) {
        req.flash("error", "Không thể cập nhật quảng cáo.");
        res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
    }
});
exports.editPatch = editPatch;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const ad = yield ad_model_1.default.findOne({ _id: id, deleted: false });
        if (!ad) {
            req.flash("error", "Quảng cáo không tồn tại.");
            return res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
        }
        res.render("admin/pages/ads/detail", {
            pageTitle: "Chi tiết quảng cáo",
            ad,
        });
    }
    catch (error) {
        req.flash("error", "Không thể tải chi tiết quảng cáo.");
        res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
    }
});
exports.detail = detail;
const changeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.params;
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const updatedBy = {
            accountId: res.locals.user ? res.locals.user._id : "mockId",
            updatedAt: new Date(),
        };
        yield ad_model_1.default.updateOne({ _id: id }, { status, updatedBy });
        req.flash("success", "Cập nhật trạng thái thành công.");
        res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
    }
    catch (error) {
        req.flash("error", "Không thể cập nhật trạng thái.");
        res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
    }
});
exports.changeStatus = changeStatus;
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const deletedAt = new Date();
        const deletedBy = {
            accountId: res.locals.user ? res.locals.user._id : "mockId",
            deletedAt,
        };
        yield ad_model_1.default.updateOne({ _id: id }, { deleted: true, deletedAt, deletedBy });
        req.flash("success", "Quảng cáo đã được chuyển vào thùng rác.");
        res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
    }
    catch (error) {
        req.flash("error", "Không thể xóa quảng cáo.");
        res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
    }
});
exports.deleteItem = deleteItem;
const trash = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const find = { deleted: true };
        const countRecords = yield ad_model_1.default.countDocuments(find);
        const objectPagination = (0, pagination_1.pagination)({ currentPage: 1, limitItems: 4 }, req.query, countRecords);
        const ads = yield ad_model_1.default.find(find)
            .sort({ createdAt: -1 })
            .limit(objectPagination.limitItems)
            .skip(objectPagination.skip);
        res.render("admin/pages/ads/trash", {
            pageTitle: "Thùng rác quảng cáo",
            ads,
            pagination: objectPagination,
        });
    }
    catch (error) {
        req.flash("error", "Không thể tải thùng rác quảng cáo.");
        res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
    }
});
exports.trash = trash;
const restore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        yield ad_model_1.default.updateOne({ _id: id }, { deleted: false });
        req.flash("success", "Đã khôi phục quảng cáo.");
        res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
    }
    catch (error) {
        req.flash("error", "Không thể khôi phục quảng cáo.");
        res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
    }
});
exports.restore = restore;
const deletePermanent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        yield ad_model_1.default.deleteOne({ _id: id });
        req.flash("success", "Đã xóa vĩnh viễn quảng cáo.");
        res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
    }
    catch (error) {
        req.flash("error", "Không thể xóa vĩnh viễn quảng cáo.");
        res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
    }
});
exports.deletePermanent = deletePermanent;
