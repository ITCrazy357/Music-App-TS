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
exports.injectAds = void 0;
const ad_model_1 = __importDefault(require("../../models/ad.model"));
const injectAds = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentDate = new Date();
        const activeAds = yield ad_model_1.default.find({
            deleted: false,
            status: "active",
            isDraft: false,
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate }
        }).sort({ priority: -1, sponsorLevel: -1, createdAt: -1 });
        const adsByPosition = {
            banner_top: [],
            banner_sidebar: [],
            banner_song_detail: [],
            popup: [],
            home_banner: [],
            footer_banner: []
        };
        activeAds.forEach((ad) => {
            let adPositions = [];
            if (ad.positions && Array.isArray(ad.positions) && ad.positions.length > 0) {
                adPositions = ad.positions;
            }
            else if (ad.get && ad.get("position")) {
                adPositions = [ad.get("position")];
            }
            adPositions.forEach((pos) => {
                if (adsByPosition[pos]) {
                    adsByPosition[pos].push(ad);
                }
                else {
                    adsByPosition[pos] = [ad];
                }
            });
        });
        res.locals.globalAds = adsByPosition;
        next();
    }
    catch (error) {
        res.locals.globalAds = {};
        next();
    }
});
exports.injectAds = injectAds;
