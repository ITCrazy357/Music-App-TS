import { Request, Response } from "express";
import Comment from "../../models/comment.model";

// [POST] /comments/post/:idSong
export const postComment = async (req: Request, res: Response) => {
  try {
    const idSong = req.params.idSong;
    const content = req.body.content;
    const user = res.locals.user;

    if (!content) {
      return res.status(400).json({ code: 400, message: "Nội dung không được để trống" });
    }

    const comment = new Comment({
      songId: idSong,
      userId: user.id,
      content: content,
    });

    await comment.save();

    res.status(200).json({
      code: 200,
      message: "Đăng bình luận thành công!",
      comment: comment
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: "Lỗi server" });
  }
};

// [PATCH] /comments/like/:idComment
export const likeComment = async (req: Request, res: Response) => {
  try {
    const idComment = req.params.idComment;
    const userId = res.locals.user.id;

    const comment = await Comment.findOne({ _id: idComment, deleted: false });

    if (!comment) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy bình luận" });
    }

    const isLiked = comment.likes.includes(userId);
    const isDisliked = comment.dislikes.includes(userId);

    if (isLiked) {
      // Bỏ Like
      await Comment.updateOne(
        { _id: idComment },
        {
          $pull: { likes: userId },
          $inc: { likeCount: -1 }
        }
      );
    } else {
      // Thêm Like
      const updateData: any = {
        $push: { likes: userId },
        $inc: { likeCount: 1 }
      };

      // Nếu đang Dislike thì bỏ Dislike
      if (isDisliked) {
        updateData.$pull = { dislikes: userId };
        updateData.$inc.dislikeCount = -1;
      }

      await Comment.updateOne({ _id: idComment }, updateData);
    }

    const updatedComment = await Comment.findOne({ _id: idComment });

    res.json({
      code: 200,
      likeCount: updatedComment?.likeCount,
      dislikeCount: updatedComment?.dislikeCount,
      isLiked: !isLiked,
      isDisliked: false // Vì nếu vừa like thì chắc chắn không dislike
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: "Lỗi server" });
  }
};

// [PATCH] /comments/dislike/:idComment
export const dislikeComment = async (req: Request, res: Response) => {
  try {
    const idComment = req.params.idComment;
    const userId = res.locals.user.id;

    const comment = await Comment.findOne({ _id: idComment, deleted: false });

    if (!comment) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy bình luận" });
    }

    const isLiked = comment.likes.includes(userId);
    const isDisliked = comment.dislikes.includes(userId);

    if (isDisliked) {
      // Bỏ Dislike
      await Comment.updateOne(
        { _id: idComment },
        {
          $pull: { dislikes: userId },
          $inc: { dislikeCount: -1 }
        }
      );
    } else {
      // Thêm Dislike
      const updateData: any = {
        $push: { dislikes: userId },
        $inc: { dislikeCount: 1 }
      };

      // Nếu đang Like thì bỏ Like
      if (isLiked) {
        updateData.$pull = { likes: userId };
        updateData.$inc.likeCount = -1;
      }

      await Comment.updateOne({ _id: idComment }, updateData);
    }

    const updatedComment = await Comment.findOne({ _id: idComment });

    res.json({
      code: 200,
      likeCount: updatedComment?.likeCount,
      dislikeCount: updatedComment?.dislikeCount,
      isLiked: false, // Vì nếu vừa dislike thì chắc chắn không like
      isDisliked: !isDisliked
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: "Lỗi server" });
  }
};