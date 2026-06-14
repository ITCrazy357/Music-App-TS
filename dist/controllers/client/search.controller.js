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
exports.results = void 0;
const song_model_1 = __importDefault(require("../../models/song.model"));
const singer_model_1 = __importDefault(require("../../models/singer.model"));
const convertToSlug_1 = require("../../helpers/convertToSlug");
const results = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = req.params.type;
    const keyword = `${req.query.keyword}`;
    let newSongs = [];
    if (keyword) {
        const keywordRegex = new RegExp(keyword, "i");
        const stringSlug = (0, convertToSlug_1.convertToSlug)(keyword);
        const stringSlugRegex = new RegExp(stringSlug, "i");
        const songs = yield song_model_1.default.find({
            $or: [
                { title: { $regex: keywordRegex } },
                { slug: { $regex: stringSlugRegex } },
            ],
        }).lean();
        for (const song of songs) {
            const infoSinger = yield singer_model_1.default.findOne({
                _id: song.singerId,
            }).lean();
            newSongs.push({
                _id: song._id,
                title: song.title,
                avatar: song.avatar,
                likes: song.likes,
                listen: song.listen,
                slug: song.slug,
                infoSinger: {
                    fullName: infoSinger ? infoSinger.fullName : "",
                },
            });
        }
    }
    switch (type) {
        case "results":
            res.render("client/pages/search/results", {
                pageTitle: "Kết quả tìm kiếm",
                keyword: keyword,
                songs: newSongs,
            });
            break;
        case "suggest":
            res.json({
                code: 200,
                message: "Lấy dữ liệu thành công",
                songs: newSongs,
            });
    }
});
exports.results = results;
