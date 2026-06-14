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
exports.listen = exports.favorite = exports.like = exports.detail = exports.list = exports.index = void 0;
const topic_model_1 = __importDefault(require("../../models/topic.model"));
const song_model_1 = __importDefault(require("../../models/song.model"));
const singer_model_1 = __importDefault(require("../../models/singer.model"));
const favorite_song_model_1 = __importDefault(require("../../models/favorite-song.model"));
const comment_model_1 = __importDefault(require("../../models/comment.model"));
const pagination_1 = require("../../helpers/pagination");
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const find = {
        status: "active",
        deleted: false,
    };
    if (req.query.keyword) {
        const keyword = String(req.query.keyword);
        const regex = new RegExp(keyword, "i");
        find.title = regex;
    }
    const sort = {};
    if (req.query.sort) {
        switch (req.query.sort) {
            case "newest":
                sort.createdAt = -1;
                break;
            case "oldest":
                sort.createdAt = 1;
                break;
            case "popular":
                sort.listen = -1;
                break;
            case "az":
                sort.title = 1;
                break;
            default:
                sort.createdAt = -1;
        }
    }
    else {
        sort.createdAt = -1;
    }
    const countSongs = yield song_model_1.default.countDocuments(find);
    const objectPagination = (0, pagination_1.pagination)({
        currentPage: 1,
        limitItems: 12,
    }, req.query, countSongs);
    const songs = yield song_model_1.default.find(find)
        .sort(sort)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip)
        .select("avatar title slug singerId likes listen createdAt")
        .lean();
    const user = res.locals.user;
    for (const song of songs) {
        const infoSinger = yield singer_model_1.default.findOne({
            _id: song.singerId,
            status: "active",
            deleted: false,
        });
        song.infoSinger = infoSinger;
        song.isLiked = user ? (_a = song.likes) === null || _a === void 0 ? void 0 : _a.includes(user.id) : false;
    }
    res.render("client/pages/songs/index", {
        pageTitle: "Tất cả bài hát",
        songs: songs,
        keyword: req.query.keyword ? String(req.query.keyword) : "",
        sort: req.query.sort ? String(req.query.sort) : "newest",
        pagination: objectPagination,
        originalUrl: req.originalUrl,
    });
});
exports.index = index;
const list = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const topic = yield topic_model_1.default.findOne({
        slug: req.params.slugTopic,
        status: "active",
        deleted: false,
    });
    if (!topic) {
        res.redirect("topics");
        return;
    }
    const songs = yield song_model_1.default.find({
        topicId: topic.id,
        status: "active",
        deleted: false,
    })
        .select("avatar title slug singerId likes")
        .lean();
    const user = res.locals.user;
    for (const song of songs) {
        const infoSinger = yield singer_model_1.default.findOne({
            _id: song.singerId,
            status: "active",
            deleted: false,
        });
        song.infoSinger = infoSinger;
        song.isLiked = user ? song.likes.includes(user.id) : false;
    }
    res.render("client/pages/songs/list", {
        pageTitle: "Danh sách bài hát",
        songs: songs,
    });
});
exports.list = list;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const song = yield song_model_1.default.findOne({
        slug: req.params.slugSong,
        status: "active",
        deleted: false,
    }).select("-status -deleted");
    if (!song) {
        res.redirect("/songs");
        return;
    }
    const singer = yield singer_model_1.default.findOne({
        _id: song.singerId,
        status: "active",
        deleted: false,
    }).select("-status -deleted");
    const topic = yield topic_model_1.default.findOne({
        _id: song.topicId,
        status: "active",
        deleted: false,
    }).select("-status -deleted");
    const user = res.locals.user;
    const isLiked = user ? song.likes.includes(user.id) : false;
    let isFavorite = false;
    if (user) {
        const favorite = yield favorite_song_model_1.default.exists({
            songId: song.id,
            userId: user.id,
        });
        isFavorite = !!favorite;
    }
    song.isFavorite = isFavorite;
    const sortOption = {};
    const sortQuery = req.query.sort || "newest";
    if (sortQuery === "oldest") {
        sortOption.createdAt = 1;
    }
    else if (sortQuery === "popular") {
        sortOption.likeCount = -1;
    }
    else {
        sortOption.createdAt = -1;
    }
    const comments = yield comment_model_1.default.find({ songId: song.id, deleted: false })
        .populate("userId", "fullName avatar")
        .sort(sortOption)
        .lean();
    const commentsWithInteraction = comments.map((comment) => {
        var _a, _b;
        return Object.assign(Object.assign({}, comment), { isLikedByUser: user ? (_a = comment.likes) === null || _a === void 0 ? void 0 : _a.includes(user.id) : false, isDislikedByUser: user ? (_b = comment.dislikes) === null || _b === void 0 ? void 0 : _b.includes(user.id) : false });
    });
    res.render("client/pages/songs/detail", {
        pageTitle: "Bài hát đang phát",
        song: song,
        singer: singer,
        topic: topic,
        isLiked: isLiked,
        isFavorite: isFavorite,
        comments: commentsWithInteraction,
        sortQuery: sortQuery
    });
});
exports.detail = detail;
const like = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idSong = req.params.idSong;
    const typeLike = req.params.typeLike;
    const song = yield song_model_1.default.findOne({
        _id: idSong,
        status: "active",
        deleted: false,
    });
    if (!song) {
        res.redirect("/songs");
        return;
    }
    const user = res.locals.user;
    const isLiked = song.likes.includes(user.id);
    if (typeLike === "like" && !isLiked) {
        yield song_model_1.default.updateOne({
            _id: idSong,
        }, {
            $push: {
                likes: user.id,
            },
        });
    }
    if (typeLike === "dislike" && isLiked) {
        yield song_model_1.default.updateOne({
            _id: idSong,
        }, {
            $pull: {
                likes: user.id,
            },
        });
    }
    const updateSong = yield song_model_1.default.findOne({
        _id: idSong,
    });
    res.json({
        code: 200,
        like: updateSong.likes.length,
        message: "success",
    });
});
exports.like = like;
const favorite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idSong = req.params.idSong;
    const typeFavorite = req.params.typeFavorite;
    const user = res.locals.user;
    switch (typeFavorite) {
        case "favorite":
            const existFavoriteSong = yield favorite_song_model_1.default.findOne({
                songId: idSong,
                userId: user.id,
            });
            if (!existFavoriteSong) {
                const record = new favorite_song_model_1.default({
                    userId: user.id,
                    songId: idSong,
                });
                yield record.save();
            }
            break;
        case "unfavorite":
            yield favorite_song_model_1.default.deleteOne({
                songId: idSong,
                userId: user.id,
            });
            break;
    }
    res.json({
        code: 200,
        message: "success",
    });
});
exports.favorite = favorite;
const listen = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idSong = req.params.idSong;
    const song = yield song_model_1.default.findOne({
        _id: idSong,
    });
    if (!song) {
        res.redirect("/songs");
        return;
    }
    const listenCount = song.listen + 1;
    yield song_model_1.default.updateOne({
        _id: idSong,
    }, {
        listen: listenCount,
    });
    const songNew = yield song_model_1.default.findOne({
        _id: idSong,
    });
    res.json({
        code: 200,
        message: "success",
        listen: songNew.listen,
    });
});
exports.listen = listen;
