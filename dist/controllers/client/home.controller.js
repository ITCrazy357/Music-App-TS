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
exports.index = void 0;
const song_model_1 = __importDefault(require("../../models/song.model"));
const topic_model_1 = __importDefault(require("../../models/topic.model"));
const singer_model_1 = __importDefault(require("../../models/singer.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const latestSongs = yield song_model_1.default.find({
            status: "active",
            deleted: false,
        })
            .sort({ createdAt: -1 })
            .limit(6);
        for (const song of latestSongs) {
            const singerInfo = yield singer_model_1.default.findOne({
                _id: song.singerId,
                deleted: false,
            }).select("fullName");
            song.singerInfo = singerInfo;
        }
        const featuredSongs = yield song_model_1.default.find({
            status: "active",
            deleted: false,
        })
            .sort({ listen: -1 })
            .limit(6);
        for (const song of featuredSongs) {
            const singerInfo = yield singer_model_1.default.findOne({
                _id: song.singerId,
                deleted: false,
            }).select("fullName");
            song.singerInfo = singerInfo;
        }
        const featuredTopics = yield topic_model_1.default.find({
            status: "active",
            deleted: false,
        })
            .sort({ position: "asc" })
            .limit(6);
        const featuredSingers = yield singer_model_1.default.find({
            status: "active",
            deleted: false,
        })
            .limit(6);
        res.render("client/pages/home/index", {
            pageTitle: "Trang chủ",
            latestSongs: latestSongs,
            featuredSongs: featuredSongs,
            featuredTopics: featuredTopics,
            featuredSingers: featuredSingers,
        });
    }
    catch (error) {
        console.error(error);
        res.redirect("back");
    }
});
exports.index = index;
