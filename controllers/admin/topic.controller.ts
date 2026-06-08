import { Response, Request } from "express";
import Topic from "../../models/topic.model";
import { convertToSlug } from "../../helpers/convertToSlug";
import { systemConfig } from "../../config/system";
import sanitizeHtml from "sanitize-html";
import { pagination } from "../../helpers/pagination";

//[GET] /admin/topics
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
      const index = filterStatus.findIndex((item) => item.status === find.status);
      if (index !== -1) {
        filterStatus[index].class = "active";
      }
    } else {
      filterStatus[0].class = "active";
    }

    // Pagination
    const countRecords = await Topic.countDocuments(find);
    const objectPagination = pagination(
      {
        currentPage: 1,
        limitItems: 4,
      },
      req.query,
      countRecords,
    );

    const topics = await Topic.find(find)
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip);

    res.render("admin/pages/topics/index", {
      pageTitle: "Quản lý chủ đề",
      topics,
      keyword,
      filterStatus,
      pagination: objectPagination,
    });
  } catch (error) {
    req.flash("error", "Không tải được danh sách chủ đề.");
    res.redirect(`/${systemConfig.prefixAdmin}/topics`);
  }
};

// [GET] /admin/topics/create
export const create = async (req: Request, res: Response) => {
  res.render("admin/pages/topics/create", {
    pageTitle: "Thêm mới chủ đề",
  });
};

// [POST] /admin/topics/create
export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, description, status } = req.body;
    if (!title) {
      req.flash("error", "Tiêu đề là bắt buộc.");
      return res.redirect(`/${systemConfig.prefixAdmin}/topics`);
    }

    let baseSlug = req.body.slug
      ? convertToSlug(req.body.slug.trim())
      : convertToSlug(title);
    let slug = baseSlug;
    let count = 1;
    while (await Topic.exists({ slug: slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    const payload: any = {
      title,
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

    const topic = new Topic({ ...payload, createdBy });
    await topic.save();
    req.flash("success", "Thêm chủ đề thành công.");
    res.redirect(`/${systemConfig.prefixAdmin}/topics`);
  } catch (error) {
    console.error("Error creating topic:", error);
    req.flash("error", "Không thể thêm mới chủ đề.");
    res.redirect(`/${systemConfig.prefixAdmin}/topics`);
  }
};

// [GET] /admin/topics/edit/:id
export const edit = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const topic = await Topic.findOne({ _id: id, deleted: false });

    if (!topic) {
      req.flash("error", "Chủ đề không tồn tại.");
      return res.redirect(`/${systemConfig.prefixAdmin}/topics`);
    }

    res.render("admin/pages/topics/edit", {
      pageTitle: "Chỉnh sửa chủ đề",
      topic,
    });
  } catch (error) {
    req.flash("error", "Không thể mở trang chỉnh sửa.");
    res.redirect(`/${systemConfig.prefixAdmin}/topics`);
  }
};

// [PATCH] /admin/topics/edit/:id
export const editPatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { title, description, status } = req.body;

    const updatedBy = {
      account_id: res.locals.user ? res.locals.user._id : "mockId",
      updatedAt: new Date(),
    };

    if (!title) {
      req.flash("error", "Tiêu đề là bắt buộc.");
      return res.redirect(`/${systemConfig.prefixAdmin}/topics`);
    }

    let baseSlug = req.body.slug
      ? convertToSlug(req.body.slug.trim())
      : convertToSlug(title);
    let slug = baseSlug;
    let count = 1;
    while (await Topic.exists({ slug: slug, _id: { $ne: id } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    const payload: any = {
      title,
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

    await Topic.updateOne({ _id: id }, { ...payload, updatedBy: updatedBy });
    req.flash("success", "Cập nhật chủ đề thành công.");
    res.redirect(`/${systemConfig.prefixAdmin}/topics`);
  } catch (error) {
    console.error(error);
    req.flash("error", "Không thể cập nhật chủ đề.");
    res.redirect(`/${systemConfig.prefixAdmin}/topics`);
  }
};

// [GET] /admin/topics/detail/:id
export const detail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const topic: any = await Topic.findOne({
      _id: id,
      deleted: false,
    });

    if (!topic) {
      req.flash("error", "Chủ đề không tồn tại.");
      return res.redirect(`/${systemConfig.prefixAdmin}/topics`);
    }

    res.render("admin/pages/topics/detail", {
      pageTitle: "Chi tiết chủ đề",
      topic,
    });
  } catch (error) {
    req.flash("error", "Không thể tải chi tiết chủ đề.");
    res.redirect(`/${systemConfig.prefixAdmin}/topics`);
  }
};

// [PATCH] /admin/topics/change-status/:status/:id
export const changeStatus = async (req: Request, res: Response) => {
  try {
    const { status, id } = req.params;
    const updateBy = {
      account_id: res.locals.user ? res.locals.user._id : "mockId",
      updatedAt: new Date(),
    };

    await Topic.updateOne({ _id: id }, { status: status, updatedBy: updateBy });
    req.flash("success", "Đã thay đổi trạng thái.");
    res.redirect(req.get("referer") || `/${systemConfig.prefixAdmin}/topics`);
  } catch (error) {
    req.flash("error", "Không thể thay đổi trạng thái.");
    res.redirect(req.get("referer") || `/${systemConfig.prefixAdmin}/topics`);
  }
};

// [PATCH] /admin/topics/change-multi
export const changeMulti = async (req: Request, res: Response) => {
  try {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");
    
    const updatedBy = {
      account_id: res.locals.user ? res.locals.user._id : "mockId",
      updatedAt: new Date(),
    };

    switch (type) {
      case "active":
      case "inactive":
        await Topic.updateMany({ _id: { $in: ids } }, { status: type, updatedBy });
        req.flash("success", `Cập nhật trạng thái thành công cho ${ids.length} chủ đề!`);
        break;
      case "delete-all":
        await Topic.updateMany({ _id: { $in: ids } }, { deleted: true, deleteAt: new Date(), deletedBy: updatedBy });
        req.flash("success", `Đã xóa thành công ${ids.length} chủ đề!`);
        break;
      default:
        break;
    }

    res.redirect(req.get("referer") || `/${systemConfig.prefixAdmin}/topics`);
  } catch (error) {
    req.flash("error", "Thao tác thất bại!");
    res.redirect(req.get("referer") || `/${systemConfig.prefixAdmin}/topics`);
  }
};

// [DELETE] /admin/topics/delete/:id
export const deleteItem = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const deletedBy = {
      account_id: res.locals.user ? res.locals.user._id : "mockId",
      deletedAt: new Date(),
    };
    await Topic.updateOne(
      { _id: id },
      { deleted: true, deleteAt: new Date(), deletedBy: deletedBy },
    );
    req.flash("success", "Chủ đề đã được chuyển vào thùng rác.");
    res.redirect(`/${systemConfig.prefixAdmin}/topics`);
  } catch (error) {
    req.flash("error", "Không thể xóa chủ đề.");
    res.redirect(`/${systemConfig.prefixAdmin}/topics`);
  }
};

// [GET] /admin/topics/trash
export const trash = async (req: Request, res: Response) => {
  try {
    const find: any = { deleted: true };
    const countRecords = await Topic.countDocuments(find);
    const objectPagination = pagination(
      {
        currentPage: 1,
        limitItems: 4,
      },
      req.query,
      countRecords,
    );

    const topics = await Topic.find(find)
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip);

    res.render("admin/pages/topics/trash", {
      pageTitle: "Thùng rác chủ đề",
      topics,
      pagination: objectPagination,
    });
  } catch (error) {
    req.flash("error", "Không thể tải thùng rác chủ đề.");
    res.redirect(`/${systemConfig.prefixAdmin}/topics`);
  }
};

// [PATCH] /admin/topics/restore/:id
export const restore = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await Topic.updateOne({ _id: id }, { deleted: false });
    req.flash("success", "Đã khôi phục chủ đề.");
    res.redirect(`/${systemConfig.prefixAdmin}/topics`);
  } catch (error) {
    req.flash("error", "Không thể khôi phục chủ đề.");
    res.redirect(`/${systemConfig.prefixAdmin}/topics`);
  }
};

// [DELETE] /admin/topics/delete-permanent/:id
export const deletePermanent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    await Topic.deleteOne({ _id: id });
    req.flash("success", "Đã xóa vĩnh viễn chủ đề.");
    res.redirect(`/${systemConfig.prefixAdmin}/topics`);
  } catch (error) {
    req.flash("error", "Không thể xóa vĩnh viễn chủ đề.");
    res.redirect(`/${systemConfig.prefixAdmin}/topics`);
  }
};
