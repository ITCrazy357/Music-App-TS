import { Request, Response } from "express";
import Role from "../../models/role.model";
import { systemConfig } from "../../config/system";

import { pagination } from "../../helpers/pagination";

// [GET] /admin/roles
export const index = async (req: Request, res: Response) => {
  try {
    const find: any = { deleted: false };

    // Search
    let keyword = "";
    if (req.query.keyword) {
      keyword = req.query.keyword as string;
      const regex = new RegExp(keyword, "i");
      find.$or = [{ title: regex }, { description: regex }];
    }

    // Filter Status
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
    const countRecords = await Role.countDocuments(find);
    const objectPagination = pagination(
      {
        currentPage: 1,
        limitItems: 4,
      },
      req.query,
      countRecords,
    );

    const roles = await Role.find(find)
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip);

    res.render("admin/pages/roles/index", {
      pageTitle: "Nhóm quyền",
      roles,
      keyword,
      filterStatus,
      pagination: objectPagination,
    });
  } catch (error) {
    req.flash("error", "Không tải được danh sách nhóm quyền.");
    res.redirect(`/${systemConfig.prefixAdmin}/dashboard`);
  }
};

// [PATCH] /admin/roles/change-multi
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
        await Role.updateMany({ _id: { $in: ids } }, { status: type, updatedBy });
        req.flash("success", `Cập nhật trạng thái thành công cho ${ids.length} nhóm quyền!`);
        break;
      case "delete-all":
        await Role.updateMany({ _id: { $in: ids } }, { deleted: true, deletedAt: new Date(), deletedBy: updatedBy });
        req.flash("success", `Đã xóa thành công ${ids.length} nhóm quyền!`);
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

// [GET] /admin/roles/create
export const create = async (req: Request, res: Response) => {
  res.render("admin/pages/roles/create", {
    pageTitle: "Thêm mới nhóm quyền",
  });
};

// [POST] /admin/roles/create
export const createPost = async (req: Request, res: Response) => {
  try {
    const createdBy = {
      accountId: res.locals.user ? res.locals.user._id : "mockId",
      createdAt: new Date(),
    };

    const role = new Role({
      ...req.body,
      createdBy,
    });

    await role.save();

    req.flash("success", "Thêm mới nhóm quyền thành công.");
    res.redirect(`/${systemConfig.prefixAdmin}/roles`);
  } catch (error) {
    req.flash("error", "Lỗi tạo nhóm quyền.");
    res.redirect(`/${systemConfig.prefixAdmin}/roles`);
  }
};

// [GET] /admin/roles/edit/:id
export const edit = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const role = await Role.findOne({ _id: id, deleted: false });

    if (!role) {
      req.flash("error", "Nhóm quyền không tồn tại.");
      return res.redirect(`/${systemConfig.prefixAdmin}/roles`);
    }

    res.render("admin/pages/roles/edit", {
      pageTitle: "Chỉnh sửa nhóm quyền",
      role,
    });
  } catch (error) {
    req.flash("error", "Lỗi tải trang chỉnh sửa.");
    res.redirect(`/${systemConfig.prefixAdmin}/roles`);
  }
};

// [PATCH] /admin/roles/edit/:id
export const editPatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const updatedBy = {
      accountId: res.locals.user ? res.locals.user._id : "mockId",
      updatedAt: new Date(),
    };

    await Role.updateOne({ _id: id }, { ...req.body, updatedBy });

    req.flash("success", "Cập nhật nhóm quyền thành công.");
    res.redirect(`/${systemConfig.prefixAdmin}/roles`);
  } catch (error) {
    req.flash("error", "Lỗi cập nhật.");
    res.redirect(`/${systemConfig.prefixAdmin}/roles`);
  }
};

// [GET] /admin/roles/detail/:id
export const detail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const role = await Role.findOne({ _id: id, deleted: false });

    if (!role) {
      req.flash("error", "Nhóm quyền không tồn tại.");
      return res.redirect(`/${systemConfig.prefixAdmin}/roles`);
    }

    res.render("admin/pages/roles/detail", {
      pageTitle: "Chi tiết nhóm quyền",
      role,
    });
  } catch (error) {
    req.flash("error", "Lỗi tải chi tiết.");
    res.redirect(`/${systemConfig.prefixAdmin}/roles`);
  }
};

// [PATCH] /admin/roles/change-status/:status/:id
export const changeStatus = async (req: Request, res: Response) => {
  try {
    const { status, id } = req.params;
    const updatedBy = {
      accountId: res.locals.user ? res.locals.user._id : "mockId",
      updatedAt: new Date(),
    };
    await Role.updateOne({ _id: id }, { status: status, updatedBy });
    req.flash("success", "Đã thay đổi trạng thái.");
    res.redirect(`/${systemConfig.prefixAdmin}/roles`);
  } catch (error) {
    req.flash("error", "Lỗi thay đổi trạng thái.");
    res.redirect(`/${systemConfig.prefixAdmin}/roles`);
  }
};

// [DELETE] /admin/roles/delete/:id
export const deleteItem = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const deletedBy = {
      accountId: res.locals.user ? res.locals.user._id : "mockId",
      deletedAt: new Date(),
    };
    await Role.updateOne(
      { _id: id },
      { deleted: true, deletedAt: new Date(), deletedBy },
    );
    req.flash("success", "Nhóm quyền đã được chuyển vào thùng rác.");
    res.redirect(`/${systemConfig.prefixAdmin}/roles`);
  } catch (error) {
    req.flash("error", "Lỗi xóa nhóm quyền.");
    res.redirect(`/${systemConfig.prefixAdmin}/roles`);
  }
};

// [GET] /admin/roles/trash
export const trash = async (req: Request, res: Response) => {
  try {
    const find: any = { deleted: true };
    const countRecords = await Role.countDocuments(find);
    const objectPagination = pagination(
      {
        currentPage: 1,
        limitItems: 4,
      },
      req.query,
      countRecords,
    );

    const roles = await Role.find(find)
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip);

    res.render("admin/pages/roles/trash", {
      pageTitle: "Thùng rác nhóm quyền",
      roles,
      pagination: objectPagination,
    });
  } catch (error) {
    req.flash("error", "Lỗi tải thùng rác.");
    res.redirect(`/${systemConfig.prefixAdmin}/roles`);
  }
};

// [PATCH] /admin/roles/restore/:id
export const restore = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await Role.updateOne({ _id: id }, { deleted: false });
    req.flash("success", "Đã khôi phục nhóm quyền.");
    res.redirect(`/${systemConfig.prefixAdmin}/roles`);
  } catch (error) {
    req.flash("error", "Lỗi khôi phục.");
    res.redirect(`/${systemConfig.prefixAdmin}/roles`);
  }
};

// [DELETE] /admin/roles/delete-permanent/:id
export const deletePermanent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await Role.deleteOne({ _id: id });
    req.flash("success", "Đã xóa vĩnh viễn nhóm quyền.");
    res.redirect(`/${systemConfig.prefixAdmin}/roles`);
  } catch (error) {
    req.flash("error", "Lỗi xóa vĩnh viễn.");
    res.redirect(`/${systemConfig.prefixAdmin}/roles`);
  }
};

// [GET] /admin/roles/permissions
export const permissions = async (req: Request, res: Response) => {
  try {
    const roles = await Role.find({ deleted: false });

    res.render("admin/pages/roles/permissions", {
      pageTitle: "Phân quyền",
      roles,
    });
  } catch (error) {
    req.flash("error", "Lỗi tải trang phân quyền.");
    res.redirect(`/${systemConfig.prefixAdmin}/roles`);
  }
};

// [PATCH] /admin/roles/permissions
export const permissionsPatch = async (req: Request, res: Response) => {
  try {
    const permissions = JSON.parse(req.body.permissions);

    const updatedBy = {
      accountId: res.locals.user ? res.locals.user._id : "mockId",
      updatedAt: new Date(),
    };

    for (const item of permissions) {
      await Role.updateOne(
        { _id: item.id },
        { permissions: item.permissions, updatedBy },
      );
    }

    req.flash("success", "Cập nhật phân quyền thành công.");
    res.redirect(`/${systemConfig.prefixAdmin}/roles/permissions`);
  } catch (error) {
    req.flash("error", "Lỗi cập nhật phân quyền.");
    res.redirect(`/${systemConfig.prefixAdmin}/roles/permissions`);
  }
};
