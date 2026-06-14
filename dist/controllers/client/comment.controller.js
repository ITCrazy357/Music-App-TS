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
exports.getCommentsBySongId = exports.deleteComment = exports.editComment = exports.dislikeComment = exports.likeComment = exports.postComment = void 0;
const comment_model_1 = __importDefault(require("../../models/comment.model"));
const postComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idSong = req.params.idSong;
        const content = req.body.content;
        const user = res.locals.user;
        if (!content) {
            return res
                .status(400)
                .json({ code: 400, message: "Nội dung không được để trống" });
        }
        const comment = new comment_model_1.default({
            songId: idSong,
            userId: user.id,
            content: content,
        });
        yield comment.save();
        const populatedComment = yield comment_model_1.default.findById(comment._id)
            .populate("userId", "fullName avatar")
            .lean();
        res.status(200).json({
            code: 200,
            message: "Đăng bình luận thành công!",
            comment: populatedComment,
        });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: "Lỗi server" });
    }
});
exports.postComment = postComment;
const likeComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idComment = req.params.idComment;
        const userId = res.locals.user.id;
        const comment = yield comment_model_1.default.findOne({ _id: idComment, deleted: false });
        if (!comment) {
            return res
                .status(404)
                .json({ code: 404, message: "Không tìm thấy bình luận" });
        }
        const isLiked = comment.likes.includes(userId);
        const isDisliked = comment.dislikes.includes(userId);
        if (isLiked) {
            yield comment_model_1.default.updateOne({ _id: idComment }, {
                $pull: { likes: userId },
                $inc: { likeCount: -1 },
            });
        }
        else {
            const updateData = {
                $push: { likes: userId },
                $inc: { likeCount: 1 },
            };
            if (isDisliked) {
                updateData.$pull = { dislikes: userId };
                updateData.$inc.dislikeCount = -1;
            }
            yield comment_model_1.default.updateOne({ _id: idComment }, updateData);
        }
        const updatedComment = yield comment_model_1.default.findOne({ _id: idComment });
        res.json({
            code: 200,
            likeCount: updatedComment === null || updatedComment === void 0 ? void 0 : updatedComment.likeCount,
            dislikeCount: updatedComment === null || updatedComment === void 0 ? void 0 : updatedComment.dislikeCount,
            isLiked: !isLiked,
            isDisliked: false,
        });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: "Lỗi server" });
    }
});
exports.likeComment = likeComment;
const dislikeComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idComment = req.params.idComment;
        const userId = res.locals.user.id;
        const comment = yield comment_model_1.default.findOne({ _id: idComment, deleted: false });
        if (!comment) {
            return res
                .status(404)
                .json({ code: 404, message: "Không tìm thấy bình luận" });
        }
        const isLiked = comment.likes.includes(userId);
        const isDisliked = comment.dislikes.includes(userId);
        if (isDisliked) {
            yield comment_model_1.default.updateOne({ _id: idComment }, {
                $pull: { dislikes: userId },
                $inc: { dislikeCount: -1 },
            });
        }
        else {
            const updateData = {
                $push: { dislikes: userId },
                $inc: { dislikeCount: 1 },
            };
            if (isLiked) {
                updateData.$pull = { likes: userId };
                updateData.$inc.likeCount = -1;
            }
            yield comment_model_1.default.updateOne({ _id: idComment }, updateData);
        }
        const updatedComment = yield comment_model_1.default.findOne({ _id: idComment });
        res.json({
            code: 200,
            likeCount: updatedComment === null || updatedComment === void 0 ? void 0 : updatedComment.likeCount,
            dislikeCount: updatedComment === null || updatedComment === void 0 ? void 0 : updatedComment.dislikeCount,
            isLiked: false,
            isDisliked: !isDisliked,
        });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: "Lỗi server" });
    }
});
exports.dislikeComment = dislikeComment;
const editComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idComment = req.params.idComment;
        const content = req.body.content;
        const userId = res.locals.user.id;
        if (!content || !content.trim()) {
            return res
                .status(400)
                .json({ code: 400, message: "Nội dung không được để trống" });
        }
        const comment = yield comment_model_1.default.findOne({ _id: idComment, deleted: false });
        if (!comment) {
            return res
                .status(404)
                .json({ code: 404, message: "Không tìm thấy bình luận" });
        }
        if (String(comment.userId) !== String(userId)) {
            return res.status(403).json({
                code: 403,
                message: "Bạn không có quyền chỉnh sửa bình luận này",
            });
        }
        comment.content = content.trim();
        comment.edited = true;
        comment.editedAt = new Date();
        yield comment.save();
        const updated = yield comment_model_1.default.findById(comment._id)
            .populate("userId", "fullName avatar")
            .lean();
        res.status(200).json({ code: 200, comment: updated });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: "Lỗi server" });
    }
});
exports.editComment = editComment;
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idComment = req.params.idComment;
        const userId = res.locals.user.id;
        const comment = yield comment_model_1.default.findOne({ _id: idComment, deleted: false });
        if (!comment) {
            return res
                .status(404)
                .json({ code: 404, message: "Không tìm thấy bình luận" });
        }
        if (String(comment.userId) !== String(userId)) {
            return res
                .status(403)
                .json({ code: 403, message: "Bạn không có quyền xóa bình luận này" });
        }
        comment.deleted = true;
        comment.deletedAt = new Date();
        yield comment.save();
        res.status(200).json({ code: 200, message: "Xóa bình luận thành công" });
    }
    catch (error) {
        res.status(500).json({ code: 500, message: "Lỗi server" });
    }
});
exports.deleteComment = deleteComment;
const getCommentsBySongId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idSong = req.query.songId;
        const sortQuery = req.query.sort || "newest";
        if (!idSong) {
            return res
                .status(400)
                .json({ code: 400, message: "songId không hợp lệ" });
        }
        const sortOption = {};
        if (sortQuery === "oldest") {
            sortOption.createdAt = 1;
        }
        else if (sortQuery === "popular") {
            sortOption.likeCount = -1;
        }
        else {
            sortOption.createdAt = -1;
        }
        const user = res.locals.user;
        const comments = yield comment_model_1.default.find({ songId: idSong, deleted: false })
            .populate("userId", "fullName avatar")
            .sort(sortOption)
            .lean();
        const commentsWithInteraction = comments.map((comment) => {
            var _a, _b;
            return Object.assign(Object.assign({}, comment), { isLikedByUser: user ? (_a = comment.likes) === null || _a === void 0 ? void 0 : _a.includes(user.id) : false, isDislikedByUser: user ? (_b = comment.dislikes) === null || _b === void 0 ? void 0 : _b.includes(user.id) : false });
        });
        return res.status(200).json({
            code: 200,
            comments: commentsWithInteraction,
        });
    }
    catch (error) {
        return res.status(500).json({ code: 500, message: "Lỗi server" });
    }
});
exports.getCommentsBySongId = getCommentsBySongId;
