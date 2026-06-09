import { Request, Response } from "express";
import Song from "../../models/song.model";
import Topic from "../../models/topic.model";
import Singer from "../../models/singer.model";
import { convertToSlug } from "../../helpers/convertToSlug";
import sanitizeHtml from "sanitize-html";

import { pagination } from "../../helpers/pagination";

//[GET] /admin/songs
export const index = async (req: Request, res: Response) => {
  try {
    const find: any = { deleted: false };

    // Search
    let keyword = "";
    if (req.query.keyword) {
      keyword = req.query.keyword as string;
      const regex = new RegExp(keyword, "i");
      find.$or = [{ title: regex }, { slug: regex }];
    }

    // Filter
    const filterStatus = [
      { name: "Tất cả", status: "", class: "" },
      { name: "Hoạt động", status: "active", class: "" },
      { name: "Dừng hoạt động", status: "inactive", class: "" },
    ];
    if (req.query.status) {
      find.status = req.query.status;
      const index = filterStatus.findIndex(
        (item) => item.status === find.status,
      );
      if (index !== -1) {
        filterStatus[index].class = "active";
      }
    } else {
      filterStatus[0].class = "active";
    }

    // Pagination
    const countRecords = await Song.countDocuments(find);
    const objectPagination = pagination(
      {
        currentPage: 1,
        limitItems: 10,
      },
      req.query,
      countRecords,
    );

    const songs = await Song.find(find)
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip);

    res.render("admin/pages/songs/index", {
      pageTitle: "Quản lý bài hát",
      songs,
      keyword,
      filterStatus,
      pagination: objectPagination,
    });
  } catch (error) {
    req.flash("error", "Không tải được danh sách bài hát.");
    res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
  }
};

// [PATCH] /admin/songs/change-multi
export const changeMulti = async (req: Request, res: Response) => {
  try {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    const updatedBy = {
      accountId: res.locals.user ? res.locals.user._id : "mockId",
      updatedAt: new Date(),
    };

    switch (type) {
      case "active":
      case "inactive":
        await Song.updateMany(
          { _id: { $in: ids } },
          { status: type, updatedBy },
        );
        req.flash(
          "success",
          `Cập nhật trạng thái thành công cho ${ids.length} bài hát!`,
        );
        break;
      case "delete-all":
        await Song.updateMany(
          { _id: { $in: ids } },
          { deleted: true, deletedAt: new Date(), deletedBy: updatedBy },
        );
        req.flash("success", `Đã xóa thành công ${ids.length} bài hát!`);
        break;
      default:
        break;
    }

    res.redirect(req.get("referer") || `/${req.app.locals.prefixAdmin}/songs`);
  } catch (error) {
    req.flash("error", "Thao tác thất bại!");
    res.redirect(req.get("referer") || `/${req.app.locals.prefixAdmin}/songs`);
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
      return res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
    }

    if (!req.body.audio) {
      req.flash("error", "File audio là bắt buộc.");
      return res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
    }

    let baseSlug = req.body.slug
      ? convertToSlug(req.body.slug.trim())
      : convertToSlug(title);
    let slug = baseSlug;
    let count = 1;
    while (await Song.exists({ slug: slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    const payload: any = {
      title,
      slug: slug,
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

    const createdBy = {
      accountId: res.locals.user ? res.locals.user._id : "mockId",
      createdAt: new Date(),
    };
    const song = new Song({ ...payload, createdBy });
    await song.save();

    req.flash("success", "Thêm mới bài hát thành công.");
    res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
  } catch (error) {
    console.error(error);
    req.flash("error", "Không thể thêm mới bài hát.");
    res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
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
      return res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
    }

    let baseSlug = req.body.slug
      ? convertToSlug(req.body.slug.trim())
      : convertToSlug(title);
    let slug = baseSlug;
    let count = 1;
    while (await Song.exists({ slug: slug, _id: { $ne: id } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    const payload: any = {
      title,
      slug: slug,
      topicId,
      singerId,
      description: description
        ? sanitizeHtml(description, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
            allowedAttributes: {
              ...sanitizeHtml.defaults.allowedAttributes,
              img: ["src", "alt", "width", "height", "style", "class"],
            },
          })
        : "",
      lyrics: lyrics
        ? sanitizeHtml(lyrics, { allowedTags: [], allowedAttributes: {} })
        : "",
      status: status || "inactive",
    };

    const updatedSong = {
      accountId: res.locals.user ? res.locals.user._id : "mockId",
      updatedAt: new Date(),
    };

    if (!updatedSong) {
      req.flash("error", "Bài hát không tồn tại.");
      return res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
    }
    if (req.body.avatar) {
      payload.avatar = req.body.avatar;
    }

    if (req.body.audio) {
      payload.audio = req.body.audio;
    }

    await Song.updateOne(
      { _id: id },
      {
        ...payload,
        updatedBy: updatedSong,
      },
    );
    req.flash("success", "Cập nhật bài hát thành công.");
    res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
  } catch (error) {
    console.error(error);
    req.flash("error", "Không thể cập nhật bài hát.");
    res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
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

    const updatedSong = {
      accountId: res.locals.user ? res.locals.user._id : "mockId",
      updatedAt: new Date(),
    };

    await Song.updateOne({ _id: id }, { status, updatedBy: updatedSong });
    req.flash("success", "Cập nhật trạng thái thành công.");
    res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
  } catch (error) {
    req.flash("error", "Không thể cập nhật trạng thái.");
    res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
  }
};

// [DELETE] /admin/songs/delete/:id
export const deleteItem = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const deletedBy = {
      accountId: res.locals.user ? res.locals.user._id : "mockId",
      deletedAt: new Date(),
    };
    await Song.updateOne({ _id: id }, { deleted: true, deletedBy: deletedBy });
    req.flash("success", "Bài hát đã được chuyển vào thùng rác.");
    res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
  } catch (error) {
    req.flash("error", "Không thể xóa bài hát.");
    res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
  }
};

// [GET] /admin/songs/trash
export const trash = async (req: Request, res: Response) => {
  try {
    const find: any = { deleted: true };
    const countRecords = await Song.countDocuments(find);
    const objectPagination = pagination(
      {
        currentPage: 1,
        limitItems: 4,
      },
      req.query,
      countRecords,
    );

    const songs = await Song.find(find)
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip);

    const items = await Promise.all(
      songs.map(async (song) => {
        const topic = await Topic.findOne({
          _id: song.topicId,
          deleted: false,
        }).select("title");
        const singer = await Singer.findOne({
          _id: song.singerId,
          deleted: false,
        }).select("fullName");
        return {
          ...song.toObject(),
          id: song.id,
          topicName: topic ? topic.title : "-",
          singerName: singer ? singer.fullName : "-",
        } as any;
      }),
    );

    res.render("admin/pages/songs/trash", {
      pageTitle: "Thùng rác bài hát",
      songs: items,
      pagination: objectPagination,
    });
  } catch (error) {
    req.flash("error", "Không thể tải thùng rác bài hát.");
    res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
  }
};

// [PATCH] /admin/songs/restore/:id
export const restore = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await Song.updateOne({ _id: id }, { deleted: false });
    req.flash("success", "Đã khôi phục bài hát.");
    res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
  } catch (error) {
    req.flash("error", "Không thể khôi phục bài hát.");
    res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
  }
};

// [DELETE] /admin/songs/delete-permanent/:id
export const deletePermanent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await Song.deleteOne({ _id: id });
    req.flash("success", "Đã xóa vĩnh viễn bài hát.");
    res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
  } catch (error) {
    req.flash("error", "Không thể xóa bài hát vĩnh viễn.");
    res.redirect(`/${req.app.locals.prefixAdmin}/songs`);
  }
};
