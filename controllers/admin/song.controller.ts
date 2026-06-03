import { Request, Response } from "express";
import Song from "../../models/song.model";
import Topic from "../../models/topic.model";
import Singer from "../../models/singer.model";
import { convertToSlug } from "../../helpers/convertToSlug";

//[GET] /admin/songs
export const index = async (req: Request, res: Response) => {
  try {
    const songs = await Song.find({ deleted: false });
    res.render("admin/pages/songs/index", {
      pageTitle: "Quản lý bài hát",
      songs,
    });
  } catch (error) {
    req.flash("error", "Không tải được danh sách bài hát.");
    res.redirect("back");
  }
};

// [GET] /admin/songs/create
export const create = async (req: Request, res: Response) => {
  try {
    const topics = await Topic.find({ deleted: false });
    const singers = await Singer.find({ deleted: false });
    res.render("admin/pages/songs/create", {
      pageTitle: "Thêm mới bài hát",
      topics,
      singers,
    });
  } catch (error) {
    req.flash("error", "Không thể mở trang thêm mới bài hát.");
    res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
  }
};

// [POST] /admin/songs/create
export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, topicId, singerId, description, lyrics, status } = req.body;

    if (!title || !topicId || !singerId) {
      req.flash("error", "Tiêu đề, chủ đề và ca sĩ là bắt buộc.");
      return res.redirect("back");
    }

    if (!req.body.audio) {
      req.flash("error", "File audio là bắt buộc.");
      return res.redirect("back");
    }

    const payload: any = {
      title,
      slug: convertToSlug(title),
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

    const song = new Song(payload);
    await song.save();

    req.flash("success", "Thêm mới bài hát thành công.");
    res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
  } catch (error) {
    console.error(error);
    req.flash("error", "Không thể thêm mới bài hát.");
    res.redirect("back");
  }
};

// [GET] /admin/songs/edit/:id
export const edit = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const song = await Song.findOne({ _id: id, deleted: false });

    if (!song) {
      req.flash("error", "Bài hát không tồn tại.");
      return res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
    }

    const topics = await Topic.find({ deleted: false });
    const singers = await Singer.find({ deleted: false });

    res.render("admin/pages/songs/edit", {
      pageTitle: "Chỉnh sửa bài hát",
      song,
      topics,
      singers,
    });
  } catch (error) {
    console.error(error);
    req.flash("error", "Không thể mở trang chỉnh sửa bài hát.");
    res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
  }
};

// [PATCH] /admin/songs/edit/:id
export const editPatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { title, topicId, singerId, description, lyrics, status } = req.body;

    if (!title || !topicId || !singerId) {
      req.flash("error", "Tiêu đề, chủ đề và ca sĩ là bắt buộc.");
      return res.redirect("back");
    }

    const payload: any = {
      title,
      slug: convertToSlug(title),
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

    await Song.updateOne({ _id: id }, payload);
    req.flash("success", "Cập nhật bài hát thành công.");
    res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
  } catch (error) {
    console.error(error);
    req.flash("error", "Không thể cập nhật bài hát.");
    res.redirect("back");
  }
};

// [GET] /admin/songs/detail/:id
export const detail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const song = await Song.findOne({ _id: id, deleted: false });

    if (!song) {
      req.flash("error", "Bài hát không tồn tại.");
      return res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
    }

    const topic = await Topic.findOne({ _id: song.topicId, deleted: false });
    const singer = await Singer.findOne({ _id: song.singerId, deleted: false });

    res.render("admin/pages/songs/detail", {
      pageTitle: "Chi tiết bài hát",
      song,
      topic,
      singer,
    });
  } catch (error) {
    console.error(error);
    req.flash("error", "Không thể tải chi tiết bài hát.");
    res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
  }
};

// [PATCH] /admin/songs/change-status/:status/:id
export const changeStatus = async (req: Request, res: Response) => {
  try {
    const { status, id } = req.params;
    await Song.updateOne({ _id: id }, { status });
    req.flash("success", "Cập nhật trạng thái thành công.");
    res.redirect("back");
  } catch (error) {
    req.flash("error", "Không thể cập nhật trạng thái.");
    res.redirect("back");
  }
};

// [DELETE] /admin/songs/delete/:id
export const deleteItem = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await Song.updateOne({ _id: id }, { deleted: true, deleteAt: new Date() });
    req.flash("success", "Bài hát đã được chuyển vào thùng rác.");
    res.redirect("back");
  } catch (error) {
    req.flash("error", "Không thể xóa bài hát.");
    res.redirect("back");
  }
};

// [GET] /admin/songs/trash
export const trash = async (req: Request, res: Response) => {
  try {
    const songs = await Song.find({ deleted: true });

    const items = await Promise.all(
      songs.map(async (song) => {
        const topic = await Topic.findOne({ _id: song.topicId, deleted: false }).select("title");
        const singer = await Singer.findOne({ _id: song.singerId, deleted: false }).select("fullName");
        return {
          ...song.toObject(),
          topicName: topic ? topic.title : "-",
          singerName: singer ? singer.fullName : "-",
        } as any;
      }),
    );

    res.render("admin/pages/songs/trash", {
      pageTitle: "Thùng rác bài hát",
      songs: items,
    });
  } catch (error) {
    req.flash("error", "Không thể tải thùng rác bài hát.");
    res.redirect("back");
  }
};

// [PATCH] /admin/songs/restore/:id
export const restore = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await Song.updateOne({ _id: id }, { deleted: false });
    req.flash("success", "Đã khôi phục bài hát.");
    res.redirect("back");
  } catch (error) {
    req.flash("error", "Không thể khôi phục bài hát.");
    res.redirect("back");
  }
};

// [DELETE] /admin/songs/delete-permanent/:id
export const deletePermanent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await Song.deleteOne({ _id: id });
    req.flash("success", "Đã xóa vĩnh viễn bài hát.");
    res.redirect("back");
  } catch (error) {
    req.flash("error", "Không thể xóa bài hát vĩnh viễn.");
    res.redirect("back");
  }
};
