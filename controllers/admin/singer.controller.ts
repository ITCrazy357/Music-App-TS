import { Request, Response } from "express";
import Singer from "../../models/singer.model";
import { systemConfig } from "../../config/system";
import sanitizeHtml from "sanitize-html";
import { convertToSlug } from "../../helpers/convertToSlug";

import { pagination } from "../../helpers/pagination";

// [GET] /admin/singers
export const index = async (req: Request, res: Response) => {
  try {
    const find: any = { deleted: false };

    // Search
    let keyword = "";
    if (req.query.keyword) {
      keyword = req.query.keyword as string;
      const regex = new RegExp(keyword, "i");
      find.$or = [{ fullName: regex }, { slug: regex }];
    }

    // Filter
    const filterStatus = [
      { name: "Tất cả", status: "", class: "" },
      { name: "Hoạt động", status: "active", class: "" },
      { name: "Dừng hoạt động", status: "inactive", class: "" },
    ];
    if (req.query.status) {
      find.status = req.query.status;
      const index = filterStatus.findIndex((item) => item.status === find.status);
      if (index !== -1) {
        filterStatus[index].class = "active";
      }
    } else {
      filterStatus[0].class = "active";
    }

    // Pagination
    const countRecords = await Singer.countDocuments(find);
    const objectPagination = pagination(
      {
        currentPage: 1,
        limitItems: 4,
      },
      req.query,
      countRecords,
    );

    const singers = await Singer.find(find)
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip);

    res.render("admin/pages/singers/index", {
      pageTitle: "Quản lý ca sĩ",
      singers,
      keyword,
      filterStatus,
      pagination: objectPagination,
    });
  } catch (error) {
    req.flash("error", "Không tải được danh sách ca sĩ.");
    res.redirect(`/${systemConfig.prefixAdmin}/singers`);
  }
};

// [PATCH] /admin/singers/change-multi
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
        await Singer.updateMany({ _id: { $in: ids } }, { status: type, updatedBy });
        req.flash("success", `Cập nhật trạng thái thành công cho ${ids.length} ca sĩ!`);
        break;
      case "delete-all":
        await Singer.updateMany({ _id: { $in: ids } }, { deleted: true, deletedAt: new Date(), deletedBy: updatedBy });
        req.flash("success", `Đã xóa thành công ${ids.length} ca sĩ!`);
        break;
      default:
        break;
    }

    res.redirect("back");
  } catch (error) {
    req.flash("error", "Thao tác thất bại!");
    res.redirect("back");
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
    const find: any = { deleted: true };
    const countRecords = await Singer.countDocuments(find);
    const objectPagination = pagination(
      {
        currentPage: 1,
        limitItems: 4,
      },
      req.query,
      countRecords,
    );

    const singers = await Singer.find(find)
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip);

    res.render("admin/pages/singers/trash", {
      pageTitle: "Thùng rác ca sĩ",
      singers,
      pagination: objectPagination,
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