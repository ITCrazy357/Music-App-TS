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
const topic_model_1 = __importDefault(require("../../models/topic.model"));
const song_model_1 = __importDefault(require("../../models/song.model"));
const singer_model_1 = __importDefault(require("../../models/singer.model"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const ad_model_1 = __importDefault(require("../../models/ad.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const statistic = {
        Topic: {
            total: 0,
            active: 0,
            inactive: 0,
        },
        Song: {
            total: 0,
            active: 0,
            inactive: 0,
        },
        Singer: {
            total: 0,
            active: 0,
            inactive: 0,
        },
        User: {
            total: 0,
            active: 0,
            inactive: 0,
        },
        Ad: {
            total: 0,
            active: 0,
            draft: 0,
            expired: 0,
            clicks: 0,
            views: 0,
            ctr: 0,
        },
    };
    statistic.Topic.total = yield topic_model_1.default.countDocuments({
        deleted: false,
    });
    statistic.Topic.active = yield topic_model_1.default.countDocuments({
        deleted: false,
        status: "active",
    });
    statistic.Topic.inactive = yield topic_model_1.default.countDocuments({
        deleted: false,
        status: "inactive",
    });
    statistic.Song.total = yield song_model_1.default.countDocuments({
        deleted: false,
    });
    statistic.Song.active = yield song_model_1.default.countDocuments({
        deleted: false,
        status: "active",
    });
    statistic.Song.inactive = yield song_model_1.default.countDocuments({
        deleted: false,
        status: "inactive",
    });
    statistic.Singer.total = yield singer_model_1.default.countDocuments({
        deleted: false,
    });
    statistic.Singer.active = yield singer_model_1.default.countDocuments({
        deleted: false,
        status: "active",
    });
    statistic.Singer.inactive = yield singer_model_1.default.countDocuments({
        deleted: false,
        status: "inactive",
    });
    statistic.User.total = yield user_model_1.default.countDocuments({
        deleted: false,
    });
    statistic.User.active = yield user_model_1.default.countDocuments({
        deleted: false,
        status: "active",
    });
    statistic.User.inactive = yield user_model_1.default.countDocuments({
        deleted: false,
        status: "inactive",
    });
    const currentDate = new Date();
    statistic.Ad.total = yield ad_model_1.default.countDocuments({ deleted: false });
    statistic.Ad.active = yield ad_model_1.default.countDocuments({
        deleted: false,
        status: "active",
        isDraft: false,
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
    });
    statistic.Ad.draft = yield ad_model_1.default.countDocuments({
        deleted: false,
        isDraft: true,
    });
    statistic.Ad.expired = yield ad_model_1.default.countDocuments({
        deleted: false,
        endDate: { $lt: currentDate },
    });
    const adStats = yield ad_model_1.default.aggregate([
        { $match: { deleted: false } },
        {
            $group: {
                _id: null,
                totalClicks: { $sum: "$clickCount" },
                totalViews: { $sum: "$viewCount" },
            },
        },
    ]);
    if (adStats.length > 0) {
        statistic.Ad.clicks = adStats[0].totalClicks;
        statistic.Ad.views = adStats[0].totalViews;
        if (statistic.Ad.views > 0) {
            statistic.Ad.ctr = Number(((statistic.Ad.clicks / statistic.Ad.views) * 100).toFixed(2));
        }
    }
    res.render("admin/pages/dashboard/index", {
        pageTitle: "Dashboard",
        statistic: statistic,
    });
});
exports.index = index;
