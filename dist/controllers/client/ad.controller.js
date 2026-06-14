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
exports.view = exports.click = void 0;
const ad_model_1 = __importDefault(require("../../models/ad.model"));
const adClick_model_1 = __importDefault(require("../../models/adClick.model"));
const adView_model_1 = __importDefault(require("../../models/adView.model"));
const click = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adId = req.params.id;
        const ip = (req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "");
        const userAgent = req.headers["user-agent"] || "";
        const userId = res.locals.user ? res.locals.user.id : null;
        const ad = yield ad_model_1.default.findOne({ _id: adId, deleted: false, status: "active" });
        if (!ad) {
            return res.redirect("/");
        }
        const oneMinuteAgo = new Date(Date.now() - 60000);
        const existingClick = yield adClick_model_1.default.findOne({
            adId,
            $or: [{ userId }, { ip }],
            createdAt: { $gte: oneMinuteAgo }
        });
        if (!existingClick) {
            yield adClick_model_1.default.create({
                adId,
                userId,
                ip,
                userAgent
            });
            yield ad_model_1.default.updateOne({ _id: adId }, { $inc: { clickCount: 1 } });
        }
        res.redirect(ad.targetUrl);
    }
    catch (error) {
        res.redirect("/");
    }
});
exports.click = click;
const view = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adId = req.params.id;
        const ip = (req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "");
        const userId = res.locals.user ? res.locals.user.id : null;
        const windowKey = String(Math.floor(Date.now() / 60000));
        try {
            yield adView_model_1.default.create({
                adId,
                userId,
                ip,
                windowKey
            });
            yield ad_model_1.default.updateOne({ _id: adId }, { $inc: { viewCount: 1 } });
            res.status(200).json({ code: 200, message: "Success" });
        }
        catch (error) {
            if (error.code === 11000) {
                return res.status(200).json({ code: 200, message: "Ignored duplicate view" });
            }
            res.status(400).json({ code: 400, message: "Error" });
        }
    }
    catch (error) {
        res.status(400).json({ code: 400, message: "Error" });
    }
});
exports.view = view;
