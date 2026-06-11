import { Request, Response } from "express";
import sanitizeHtml from "sanitize-html";

import Ad from "../../models/ad.model";
import { pagination } from "../../helpers/pagination";

// Helpers
const buildSlugUnique = async (baseSlug: string, id?: string) => {
  let slug = baseSlug;
  let count = 1;

  while (true) {
    const query: any = { slug };
    if (id) query._id = { $ne: id };

    const exists = await Ad.exists(query);
    if (!exists) break;

    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
};

// [GET] /admin/ads
export const index = async (req: Request, res: Response) => {
  try {
    const find: any = { deleted: false };

    // Search
    let keyword = "";
    if (req.query.keyword) {
      keyword = req.query.keyword as string;
      const regex = new RegExp(keyword, "i");
      find.$or = [{ title: regex }, { slug: regex }, { description: regex }];
    }

    // Filter status
    const filterStatus = [
      { name: "Tất cả", status: "", class: "" },
      { name: "Đang hoạt động", status: "active", class: "" },
      { name: "Dừng", status: "inactive", class: "" },
      { name: "Draft", status: "draft", class: "" },
    ];

    if (req.query.status) {
      const q = req.query.status as string;
      if (q === "draft") {
        find.isDraft = true;
      } else if (q) {
        find.status = q;
      }

      const idx = filterStatus.findIndex((i) => i.status === q);
      if (idx !== -1) filterStatus[idx].class = "active";
    } else {
      filterStatus[0].class = "active";
    }

    // Pagination
    const countRecords = await Ad.countDocuments(find);
    const objectPagination = pagination(
      { currentPage: 1, limitItems: 10 },
      req.query,
      countRecords,
    );

    // Sorting: priority DESC, then createdAt DESC
    const ads = await Ad.find(find)
      .sort({ priority: -1, createdAt: -1 })
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip);

    res.render("admin/pages/ads/index", {
      pageTitle: "Quản lý quảng cáo",
      ads,
      keyword,
      filterStatus,
      pagination: objectPagination,
    });
  } catch (error) {
    req.flash("error", "Không tải được danh sách quảng cáo.");
    res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
  }
};

// [GET] /admin/ads/create
export const create = async (req: Request, res: Response) => {
  res.render("admin/pages/ads/create", {
    pageTitle: "Thêm quảng cáo",
  });
};

// [POST] /admin/ads/create
export const createPost = async (req: Request, res: Response) => {
  try {
    const {
      title,
      slug,
      description,
      targetUrl,
      image,
      positions,
      type,
      status,
      priority,
      sponsorLevel,
      startDate,
      endDate,
      isDraft,
    } = req.body;

    if (!title || !targetUrl || !positions || !type) {
      req.flash(
        "error",
        "Thiếu dữ liệu bắt buộc (title/targetUrl/positions/type). ",
      );
      return res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
    }

    // Ensure positions is an array
    const positionsArray = Array.isArray(positions) ? positions : [positions];

    const baseSlug = typeof slug === "string" ? slug.trim() : String(title);
    const finalSlug = await buildSlugUnique(finalSlugSafe(baseSlug));

    const payload: any = {
      title: String(title).trim(),
      slug: finalSlug,
      description: description
        ? sanitizeHtml(description, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
            allowedAttributes: {
              ...sanitizeHtml.defaults.allowedAttributes,
              img: ["src", "alt", "width", "height", "style", "class"],
            },
          })
        : "",
      targetUrl: String(targetUrl).trim(),
      image: image || "",
      positions: positionsArray,
      type,
      status: status || "inactive",
      priority: priority ? Number(priority) : 1,
      sponsorLevel: sponsorLevel || "",
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(),
      isDraft: isDraft === "true" || isDraft === true,
      createdBy: {
        accountId: res.locals.user ? res.locals.user._id : "mockId",
        createdAt: new Date(),
      },
    };

    const ad = new Ad(payload);
    await ad.save();

    req.flash("success", "Thêm quảng cáo thành công.");
    res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
  } catch (error) {
    req.flash("error", "Không thể thêm quảng cáo.");
    res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
  }
};

function finalSlugSafe(input: string) {
  // Keep simple: slug should be provided by admin or user input.
  // The project already has convertToSlug helper for future improvement.
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-");
}

// [GET] /admin/ads/edit/:id
export const edit = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const ad = await Ad.findOne({ _id: id, deleted: false });
    if (!ad) {
      req.flash("error", "Quảng cáo không tồn tại.");
      return res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
    }

    res.render("admin/pages/ads/edit", {
      pageTitle: "Chỉnh sửa quảng cáo",
      ad,
    });
  } catch (error) {
    req.flash("error", "Không thể mở trang chỉnh sửa.");
    res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
  }
};

// [PATCH] /admin/ads/edit/:id
export const editPatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const adCurrent = await Ad.findOne({ _id: id, deleted: false });
    if (!adCurrent) {
      req.flash("error", "Quảng cáo không tồn tại.");
      return res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
    }

    const {
      title,
      slug,
      description,
      targetUrl,
      image,
      positions,
      type,
      status,
      priority,
      sponsorLevel,
      startDate,
      endDate,
      isDraft,
    } = req.body;

    if (!title || !targetUrl || !positions || !type) {
      req.flash(
        "error",
        "Thiếu dữ liệu bắt buộc (title/targetUrl/positions/type). ",
      );
      return res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
    }

    const positionsArray = Array.isArray(positions) ? positions : [positions];

    const baseSlug = slug ? String(slug).trim() : String(title);
    const finalSlug = await buildSlugUnique(finalSlugSafe(baseSlug), id as string);

    const updatedBy = {
      accountId: res.locals.user ? res.locals.user._id : "mockId",
      updatedAt: new Date(),
    };

    const payload: any = {
      title: String(title).trim(),
      slug: finalSlug,
      description: description
        ? sanitizeHtml(description, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
            allowedAttributes: {
              ...sanitizeHtml.defaults.allowedAttributes,
              img: ["src", "alt", "width", "height", "style", "class"],
            },
          })
        : "",
      targetUrl: String(targetUrl).trim(),
      image: image || "",
      positions: positionsArray,
      type,
      status: status || "inactive",
      priority: priority ? Number(priority) : 1,
      sponsorLevel: sponsorLevel || "",
      startDate: startDate ? new Date(startDate) : adCurrent.startDate,
      endDate: endDate ? new Date(endDate) : adCurrent.endDate,
      isDraft: isDraft === "true" || isDraft === true,
      updatedBy,
    };

    await Ad.updateOne({ _id: id }, payload);

    req.flash("success", "Cập nhật quảng cáo thành công.");
    res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
  } catch (error) {
    req.flash("error", "Không thể cập nhật quảng cáo.");
    res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
  }
};

// [GET] /admin/ads/detail/:id
export const detail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const ad = await Ad.findOne({ _id: id, deleted: false });
    if (!ad) {
      req.flash("error", "Quảng cáo không tồn tại.");
      return res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
    }

    res.render("admin/pages/ads/detail", {
      pageTitle: "Chi tiết quảng cáo",
      ad,
    });
  } catch (error) {
    req.flash("error", "Không thể tải chi tiết quảng cáo.");
    res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
  }
};

// [PATCH] /admin/ads/change-status/:status/:id
export const changeStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const updatedBy = {
      accountId: res.locals.user ? res.locals.user._id : "mockId",
      updatedAt: new Date(),
    };

    await Ad.updateOne({ _id: id }, { status, updatedBy });
    req.flash("success", "Cập nhật trạng thái thành công.");
    res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
  } catch (error) {
    req.flash("error", "Không thể cập nhật trạng thái.");
    res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
  }
};

// [DELETE] /admin/ads/delete/:id
export const deleteItem = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const deletedAt = new Date();
    const deletedBy = {
      accountId: res.locals.user ? res.locals.user._id : "mockId",
      deletedAt,
    };

    await Ad.updateOne({ _id: id }, { deleted: true, deletedAt, deletedBy });
    req.flash("success", "Quảng cáo đã được chuyển vào thùng rác.");
    res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
  } catch (error) {
    req.flash("error", "Không thể xóa quảng cáo.");
    res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
  }
};

// [GET] /admin/ads/trash
export const trash = async (req: Request, res: Response) => {
  try {
    const find: any = { deleted: true };
    const countRecords = await Ad.countDocuments(find);

    const objectPagination = pagination(
      { currentPage: 1, limitItems: 4 },
      req.query,
      countRecords,
    );

    const ads = await Ad.find(find)
      .sort({ createdAt: -1 })
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip);

    res.render("admin/pages/ads/trash", {
      pageTitle: "Thùng rác quảng cáo",
      ads,
      pagination: objectPagination,
    });
  } catch (error) {
    req.flash("error", "Không thể tải thùng rác quảng cáo.");
    res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
  }
};

// [PATCH] /admin/ads/restore/:id
export const restore = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await Ad.updateOne({ _id: id }, { deleted: false });
    req.flash("success", "Đã khôi phục quảng cáo.");
    res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
  } catch (error) {
    req.flash("error", "Không thể khôi phục quảng cáo.");
    res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
  }
};

// [DELETE] /admin/ads/delete-permanent/:id
export const deletePermanent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await Ad.deleteOne({ _id: id });
    req.flash("success", "Đã xóa vĩnh viễn quảng cáo.");
    res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
  } catch (error) {
    req.flash("error", "Không thể xóa vĩnh viễn quảng cáo.");
    res.redirect(`/${req.app.locals.prefixAdmin}/ads`);
  }
};
