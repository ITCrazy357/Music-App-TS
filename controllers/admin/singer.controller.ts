import { Request, Response } from "express";
import Singer from "../../models/singer.model";
import { systemConfig } from "../../config/system";
import sanitizeHtml from "sanitize-html";
import { convertToSlug } from "../../helpers/convertToSlug";

// [GET] /admin/singers
export const index = async (req: Request, res: Response) => {
  try {
    const singers = await Singer.find({ deleted: false });

    res.render("admin/pages/singers/index", {
      pageTitle: "Quản lý ca sĩ",
      singers,
    });
  } catch (error) {
    req.flash("error", "Không tải được danh sách ca sĩ.");
    res.redirect(`/${systemConfig.prefixAdmin}/singers`);
  }
};

// [GET] /admin/singers/create
export const create = async (req: Request, res: Response) => {
  res.render("admin/pages/singers/create", {
    pageTitle: "Thêm mới ca sĩ",
  });
};

// [POST] /admin/singers/create
export const createPost = async (req: Request, res: Response) => {
  try {
    const { fullName, description, status } = req.body;

    if (!fullName) {
      req.flash("error", "Tên ca sĩ là bắt buộc.");
      return res.redirect(`/${systemConfig.prefixAdmin}/singers/create`);
    }

    let baseSlug = convertToSlug(fullName);
    let slug = baseSlug;
    let count = 1;
    while (await Singer.exists({ slug: slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    const payload: any = {
      fullName,
      description: description ? sanitizeHtml(description, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src', 'alt', 'width', 'height', 'style', 'class']
        }
      }) : "",
      status: status || "inactive",
      slug: slug,
    };

    if (req.body.avatar) {
      payload.avatar = req.body.avatar;
    }

    const createdBy = {
      accountId: res.locals.user ? res.locals.user._id : "mockId",
      createdAt: new Date(),
    };

    const singer = new Singer({ ...payload, createdBy });
    await singer.save();

    req.flash("success", "Thêm ca sĩ thành công.");
    res.redirect(`/${systemConfig.prefixAdmin}/singers`);
  } catch (error) {
    console.error("Error creating singer:", error);
    req.flash("error", "Không thể thêm mới ca sĩ.");
    res.redirect(`/${systemConfig.prefixAdmin}/singers`);
  }
};

// [GET] /admin/singers/edit/:id
export const edit = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const singer = await Singer.findOne({ _id: id, deleted: false });

    if (!singer) {
      req.flash("error", "Ca sĩ không tồn tại.");
      return res.redirect(`/${systemConfig.prefixAdmin}/singers`);
    }

    res.render("admin/pages/singers/edit", {
      pageTitle: "Chỉnh sửa ca sĩ",
      singer,
    });
  } catch (error) {
    req.flash("error", "Không thể mở trang chỉnh sửa.");
    res.redirect(`/${systemConfig.prefixAdmin}/singers`);
  }
};

// [PATCH] /admin/singers/edit/:id
export const editPatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { fullName, description, status } = req.body;

    const updatedBy = {
      accountId: res.locals.user ? res.locals.user._id : "mockId",
      updatedAt: new Date(),
    };

    if (!fullName) {
      req.flash("error", "Tên ca sĩ là bắt buộc.");
      return res.redirect(`/${systemConfig.prefixAdmin}/singers/edit/${id}`);
    }

    const payload: any = {
      fullName,
      description: description ? sanitizeHtml(description, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src', 'alt', 'width', 'height', 'style', 'class']
        }
      }) : "",
      status: status || "inactive",
    };

    if (req.body.avatar) {
      payload.avatar = req.body.avatar;
    }

    await Singer.updateOne({ _id: id }, { ...payload, updatedBy });
    req.flash("success", "Cập nhật ca sĩ thành công.");
    res.redirect(`/${systemConfig.prefixAdmin}/singers`);
  } catch (error) {
    console.error(error);
    req.flash("error", "Không thể cập nhật ca sĩ.");
    res.redirect(`/${systemConfig.prefixAdmin}/singers`);
  }
};

// [GET] /admin/singers/detail/:id
export const detail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const singer: any = await Singer.findOne({ _id: id, deleted: false });

    if (!singer) {
      req.flash("error", "Ca sĩ không tồn tại.");
      return res.redirect(`/${systemConfig.prefixAdmin}/singers`);
    }

    res.render("admin/pages/singers/detail", {
      pageTitle: "Chi tiết ca sĩ",
      singer,
    });
  } catch (error) {
    req.flash("error", "Không thể tải chi tiết ca sĩ.");
    res.redirect(`/${systemConfig.prefixAdmin}/singers`);
  }
};

// [PATCH] /admin/singers/change-status/:status/:id
export const changeStatus = async (req: Request, res: Response) => {
  try {
    const { status, id } = req.params;
    const updatedBy = {
      accountId: res.locals.user ? res.locals.user._id : "mockId",
      updatedAt: new Date(),
    };

    await Singer.updateOne({ _id: id }, { status: status, updatedBy });
    req.flash("success", "Đã thay đổi trạng thái.");
    res.redirect("back");
  } catch (error) {
    req.flash("error", "Không thể thay đổi trạng thái.");
    res.redirect("back");
  }
};

// [DELETE] /admin/singers/delete/:id
export const deleteItem = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const deletedBy = {
      accountId: res.locals.user ? res.locals.user._id : "mockId",
      deletedAt: new Date(),
    };

    await Singer.updateOne({ _id: id }, { deleted: true, deletedAt: new Date(), deletedBy });
    req.flash("success", "Ca sĩ đã được chuyển vào thùng rác.");
    res.redirect("back");
  } catch (error) {
    req.flash("error", "Không thể xóa ca sĩ.");
    res.redirect("back");
  }
};

// [GET] /admin/singers/trash
export const trash = async (req: Request, res: Response) => {
  try {
    const singers = await Singer.find({ deleted: true });

    res.render("admin/pages/singers/trash", {
      pageTitle: "Thùng rác ca sĩ",
      singers,
    });
  } catch (error) {
    req.flash("error", "Không thể tải thùng rác ca sĩ.");
    res.redirect(`/${systemConfig.prefixAdmin}/singers`);
  }
};

// [PATCH] /admin/singers/restore/:id
export const restore = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await Singer.updateOne({ _id: id }, { deleted: false });
    req.flash("success", "Đã khôi phục ca sĩ.");
    res.redirect("back");
  } catch (error) {
    req.flash("error", "Không thể khôi phục ca sĩ.");
    res.redirect("back");
  }
};

// [DELETE] /admin/singers/delete-permanent/:id
export const deletePermanent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await Singer.deleteOne({ _id: id });
    req.flash("success", "Đã xóa vĩnh viễn ca sĩ.");
    res.redirect("back");
  } catch (error) {
    req.flash("error", "Không thể xóa vĩnh viễn ca sĩ.");
    res.redirect("back");
  }
};