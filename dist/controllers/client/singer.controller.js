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
exports.detail = exports.index = void 0;
const singer_model_1 = __importDefault(require("../../models/singer.model"));
const song_model_1 = __importDefault(require("../../models/song.model"));
const pagination_1 = require("../../helpers/pagination");
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const find = {
        status: "active",
        deleted: false,
    };
    if (req.query.keyword) {
        const keyword = String(req.query.keyword);
        const regex = new RegExp(keyword, "i");
        find.$or = [{ fullName: regex }, { slug: regex }];
    }
    const countSingers = yield singer_model_1.default.countDocuments(find);
    const objectPagination = (0, pagination_1.pagination)({
        currentPage: 1,
        limitItems: 12,
    }, req.query, countSingers);
    const singers = yield singer_model_1.default.find(find)
        .sort({ position: "asc", createdAt: -1 })
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip)
        .select("avatar fullName slug")
        .lean();
    for (const singer of singers) {
        const countSongs = yield song_model_1.default.countDocuments({
            singerId: String(singer._id),
            status: "active",
            deleted: false,
        });
        singer.totalSongs = countSongs;
    }
    res.render("client/pages/singers/index", {
        pageTitle: "Danh sách ca sĩ",
        singers: singers,
        keyword: req.query.keyword ? String(req.query.keyword) : "",
        pagination: objectPagination,
        originalUrl: req.originalUrl,
    });
});
exports.index = index;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const slugSinger = req.params.slugSinger;
    const singer = yield singer_model_1.default.findOne({
        slug: slugSinger,
        status: "active",
        deleted: false,
    }).lean();
    if (!singer) {
        res.redirect("/singers");
        return;
    }
    const songs = yield song_model_1.default.find({
        singerId: String(singer._id),
        status: "active",
        deleted: false,
    })
        .sort({ createdAt: -1 })
        .select("avatar title slug listen likes createdAt")
        .lean();
    const user = res.locals.user;
    for (const song of songs) {
        song.isLiked = user ? (_a = song.likes) === null || _a === void 0 ? void 0 : _a.includes(user.id) : false;
    }
    singer.totalSongs = songs.length;
    res.render("client/pages/singers/detail", {
        pageTitle: singer.fullName,
        singer: singer,
        songs: songs,
    });
});
exports.detail = detail;
