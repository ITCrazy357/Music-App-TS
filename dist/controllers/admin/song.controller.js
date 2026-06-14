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
const song_model_1 = __importDefault(require("../../models/song.model"));
const topic_model_1 = __importDefault(require("../../models/topic.model"));
const singer_model_1 = __importDefault(require("../../models/singer.model"));
const convertToSlug_1 = require("../../helpers/convertToSlug");
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
        const countRecords = yield song_model_1.default.countDocuments(find);
        const objectPagination = (0, pagination_1.pagination)({
            currentPage: 1,
            limitItems: 10,
        }, req.query, countRecords);
        const songs = yield song_model_1.default.find(find)
            .limit(objectPagination.limitItems)
            .skip(objectPagination.skip);
        res.render("admin/pages/songs/index", {
            pageTitle: "Quản lý bài hát",
            songs,
            keyword,
            filterStatus,
            pagination: objectPagination,
        });
    }
    catch (error) {
        req.flash("error", "Không tải được danh sách bài hát.");
        res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
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
                yield song_model_1.default.updateMany({ _id: { $in: ids } }, { status: type, updatedBy });
                req.flash("success", `Cập nhật trạng thái thành công cho ${ids.length} bài hát!`);
                break;
            case "delete-all":
                yield song_model_1.default.updateMany({ _id: { $in: ids } }, { deleted: true, deletedAt: new Date(), deletedBy: updatedBy });
                req.flash("success", `Đã xóa thành công ${ids.length} bài hát!`);
                break;
            default:
                break;
        }
        res.redirect(req.get("referer") || `/${req.app.locals.prefixAdmin}/songs`);
    }
    catch (error) {
        req.flash("error", "Thao tác thất bại!");
        res.redirect(req.get("referer") || `/${req.app.locals.prefixAdmin}/songs`);
    }
});
exports.changeMulti = changeMulti;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const topics = yield topic_model_1.default.find({ deleted: false });
        const singers = yield singer_model_1.default.find({ deleted: false });
        res.render("admin/pages/songs/create", {
            pageTitle: "Thêm mới bài hát",
            topics,
            singers,
        });
    }
    catch (error) {
        req.flash("error", "Không thể mở trang thêm mới bài hát.");
        res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
    }
});
exports.create = create;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, topicId, singerId, description, lyrics, status } = req.body;
        if (!title || !topicId || !singerId) {
            req.flash("error", "Tiêu đề, chủ đề và ca sĩ là bắt buộc.");
            return res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
        }
        if (!req.body.audio) {
            req.flash("error", "File audio là bắt buộc.");
            return res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
        }
        let baseSlug = req.body.slug
            ? (0, convertToSlug_1.convertToSlug)(req.body.slug.trim())
            : (0, convertToSlug_1.convertToSlug)(title);
        let slug = baseSlug;
        let count = 1;
        while (yield song_model_1.default.exists({ slug: slug })) {
            slug = `${baseSlug}-${count}`;
            count++;
        }
        const payload = {
            title,
            slug: slug,
            topicId,
            singerId,
            description,
            lyrics,
            status: status || "inactive",
        };
        if (req.body.avatar) {
            payload.avatar = req.body.avatar;
        }
        if (req.body.audio) {
            payload.audio = req.body.audio;
        }
        const createdBy = {
            accountId: res.locals.user ? res.locals.user._id : "mockId",
            createdAt: new Date(),
        };
        const song = new song_model_1.default(Object.assign(Object.assign({}, payload), { createdBy }));
        yield song.save();
        req.flash("success", "Thêm mới bài hát thành công.");
        res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
    }
    catch (error) {
        console.error(error);
        req.flash("error", "Không thể thêm mới bài hát.");
        res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
    }
});
exports.createPost = createPost;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const song = yield song_model_1.default.findOne({ _id: id, deleted: false });
        if (!song) {
            req.flash("error", "Bài hát không tồn tại.");
            return res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
        }
        const topics = yield topic_model_1.default.find({ deleted: false });
        const singers = yield singer_model_1.default.find({ deleted: false });
        res.render("admin/pages/songs/edit", {
            pageTitle: "Chỉnh sửa bài hát",
            song,
            topics,
            singers,
        });
    }
    catch (error) {
        console.error(error);
        req.flash("error", "Không thể mở trang chỉnh sửa bài hát.");
        res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
    }
});
exports.edit = edit;
const editPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const { title, topicId, singerId, description, lyrics, status } = req.body;
        if (!title || !topicId || !singerId) {
            req.flash("error", "Tiêu đề, chủ đề và ca sĩ là bắt buộc.");
            return res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
        }
        let baseSlug = req.body.slug
            ? (0, convertToSlug_1.convertToSlug)(req.body.slug.trim())
            : (0, convertToSlug_1.convertToSlug)(title);
        let slug = baseSlug;
        let count = 1;
        while (yield song_model_1.default.exists({ slug: slug, _id: { $ne: id } })) {
            slug = `${baseSlug}-${count}`;
            count++;
        }
        const payload = {
            title,
            slug: slug,
            topicId,
            singerId,
            description: description
                ? (0, sanitize_html_1.default)(description, {
                    allowedTags: sanitize_html_1.default.defaults.allowedTags.concat(["img"]),
                    allowedAttributes: Object.assign(Object.assign({}, sanitize_html_1.default.defaults.allowedAttributes), { img: ["src", "alt", "width", "height", "style", "class"] }),
                })
                : "",
            lyrics: lyrics
                ? (0, sanitize_html_1.default)(lyrics, { allowedTags: [], allowedAttributes: {} })
                : "",
            status: status || "inactive",
        };
        const updatedSong = {
            accountId: res.locals.user ? res.locals.user._id : "mockId",
            updatedAt: new Date(),
        };
        if (!updatedSong) {
            req.flash("error", "Bài hát không tồn tại.");
            return res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
        }
        if (req.body.avatar) {
            payload.avatar = req.body.avatar;
        }
        if (req.body.audio) {
            payload.audio = req.body.audio;
        }
        yield song_model_1.default.updateOne({ _id: id }, Object.assign(Object.assign({}, payload), { updatedBy: updatedSong }));
        req.flash("success", "Cập nhật bài hát thành công.");
        res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
    }
    catch (error) {
        console.error(error);
        req.flash("error", "Không thể cập nhật bài hát.");
        res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
    }
});
exports.editPatch = editPatch;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const song = yield song_model_1.default.findOne({ _id: id, deleted: false });
        if (!song) {
            req.flash("error", "Bài hát không tồn tại.");
            return res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
        }
        const topic = yield topic_model_1.default.findOne({ _id: song.topicId, deleted: false });
        const singer = yield singer_model_1.default.findOne({ _id: song.singerId, deleted: false });
        res.render("admin/pages/songs/detail", {
            pageTitle: "Chi tiết bài hát",
            song,
            topic,
            singer,
        });
    }
    catch (error) {
        console.error(error);
        req.flash("error", "Không thể tải chi tiết bài hát.");
        res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
    }
});
exports.detail = detail;
const changeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, id } = req.params;
        const updatedSong = {
            accountId: res.locals.user ? res.locals.user._id : "mockId",
            updatedAt: new Date(),
        };
        yield song_model_1.default.updateOne({ _id: id }, { status, updatedBy: updatedSong });
        req.flash("success", "Cập nhật trạng thái thành công.");
        res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
    }
    catch (error) {
        req.flash("error", "Không thể cập nhật trạng thái.");
        res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
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
        yield song_model_1.default.updateOne({ _id: id }, { deleted: true, deletedBy: deletedBy });
        req.flash("success", "Bài hát đã được chuyển vào thùng rác.");
        res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
    }
    catch (error) {
        req.flash("error", "Không thể xóa bài hát.");
        res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
    }
});
exports.deleteItem = deleteItem;
const trash = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const find = { deleted: true };
        const countRecords = yield song_model_1.default.countDocuments(find);
        const objectPagination = (0, pagination_1.pagination)({
            currentPage: 1,
            limitItems: 4,
        }, req.query, countRecords);
        const songs = yield song_model_1.default.find(find)
            .limit(objectPagination.limitItems)
            .skip(objectPagination.skip);
        const items = yield Promise.all(songs.map((song) => __awaiter(void 0, void 0, void 0, function* () {
            const topic = yield topic_model_1.default.findOne({
                _id: song.topicId,
                deleted: false,
            }).select("title");
            const singer = yield singer_model_1.default.findOne({
                _id: song.singerId,
                deleted: false,
            }).select("fullName");
            return Object.assign(Object.assign({}, song.toObject()), { id: song.id, topicName: topic ? topic.title : "-", singerName: singer ? singer.fullName : "-" });
        })));
        res.render("admin/pages/songs/trash", {
            pageTitle: "Thùng rác bài hát",
            songs: items,
            pagination: objectPagination,
        });
    }
    catch (error) {
        req.flash("error", "Không thể tải thùng rác bài hát.");
        res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
    }
});
exports.trash = trash;
const restore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        yield song_model_1.default.updateOne({ _id: id }, { deleted: false });
        req.flash("success", "Đã khôi phục bài hát.");
        res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
    }
    catch (error) {
        req.flash("error", "Không thể khôi phục bài hát.");
        res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
    }
});
exports.restore = restore;
const deletePermanent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        yield song_model_1.default.deleteOne({ _id: id });
        req.flash("success", "Đã xóa vĩnh viễn bài hát.");
        res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
    }
    catch (error) {
        req.flash("error", "Không thể xóa bài hát vĩnh viễn.");
        res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
    }
});
exports.deletePermanent = deletePermanent;
