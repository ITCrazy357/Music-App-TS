import { Request, Response } from "express";
import User from "../../models/user.model";
import Role from "../../models/role.model";
import { systemConfig } from "../../config/system";
import bcrypt from "bcrypt";

// [GET] /admin/users
export const index = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ deleted: false }).populate(
      "role_id",
      "title",
    );

    res.render("admin/pages/users/index", {
      pageTitle: "Quản lý tài khoản",
      users,
    });
  } catch (error) {
    req.flash("error", "Không tải được danh sách tài khoản.");
    res.redirect(`/${systemConfig.prefixAdmin}/dashboard`);
  }
};

// [GET] /admin/users/create
export const create = async (req: Request, res: Response) => {
  try {
    const roles = await Role.find({ deleted: false });

    res.render("admin/pages/users/create", {
      pageTitle: "Thêm mới tài khoản",
      roles,
    });
  } catch (error) {
    req.flash("error", "Lỗi tải trang thêm mới.");
    res.redirect(`/${systemConfig.prefixAdmin}/users`);
  }
};

// [POST] /admin/users/create
export const createPost = async (req: Request, res: Response) => {
  try {
    const emailExist = await User.findOne({
      email: req.body.email,
      deleted: false,
    });
    if (emailExist) {
      req.flash("error", "Email đã tồn tại.");
      return res.redirect(`/${systemConfig.prefixAdmin}/users`);
    }

    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const createdBy = {
      accountId: res.locals.user ? res.locals.user._id : "mockId",
      createdAt: new Date(),
    };

    const user = new User({
      ...req.body,
      createdBy,
    });

    await user.save();

    req.flash("success", "Thêm mới tài khoản thành công.");
    res.redirect(`/${systemConfig.prefixAdmin}/users`);
  } catch (error) {
    req.flash("error", "Lỗi tạo tài khoản.");
    res.redirect(`/${systemConfig.prefixAdmin}/users`);
  }
};

// [GET] /admin/users/edit/:id
export const edit = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({ _id: id, deleted: false });

    if (!user) {
      req.flash("error", "Tài khoản không tồn tại.");
      return res.redirect(`/${systemConfig.prefixAdmin}/users`);
    }

    const roles = await Role.find({ deleted: false });

    res.render("admin/pages/users/edit", {
      pageTitle: "Chỉnh sửa tài khoản",
      user,
      roles,
    });
  } catch (error) {
    req.flash("error", "Lỗi trang chỉnh sửa.");
    res.redirect(`/${systemConfig.prefixAdmin}/users`);
  }
};

// [PATCH] /admin/users/edit/:id
export const editPatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const emailExist = await User.findOne({
      _id: { $ne: id },
      email: req.body.email,
      deleted: false,
    });

    if (emailExist) {
      req.flash("error", "Email đã tồn tại.");
      return res.redirect(`/${systemConfig.prefixAdmin}/users`);
    }

    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    } else {
      delete req.body.password;
    }

    const updatedBy = {
      accountId: res.locals.user ? res.locals.user._id : "mockId",
      updatedAt: new Date(),
    };

    await User.updateOne({ _id: id }, { ...req.body, updatedBy });

    req.flash("success", "Cập nhật tài khoản thành công.");
    res.redirect(`/${systemConfig.prefixAdmin}/users`);
  } catch (error) {
    req.flash("error", "Lỗi cập nhật.");
    res.redirect(`/${systemConfig.prefixAdmin}/users`);
  }
};

// [GET] /admin/users/detail/:id
export const detail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({ _id: id, deleted: false }).populate(
      "role_id",
      "title",
    );

    if (!user) {
      req.flash("error", "Tài khoản không tồn tại.");
      return res.redirect(`/${systemConfig.prefixAdmin}/users`);
    }

    res.render("admin/pages/users/detail", {
      pageTitle: "Chi tiết tài khoản",
      user,
    });
  } catch (error) {
    req.flash("error", "Lỗi tải chi tiết.");
    res.redirect(`/${systemConfig.prefixAdmin}/users`);
  }
};

// [PATCH] /admin/users/change-status/:status/:id
export const changeStatus = async (req: Request, res: Response) => {
  try {
    const { status, id } = req.params;
    const updatedBy = {
      accountId: res.locals.user ? res.locals.user._id : "mockId",
      updatedAt: new Date(),
    };
    await User.updateOne({ _id: id }, { status: status, updatedBy });
    req.flash("success", "Đã thay đổi trạng thái.");
    res.redirect(`/${systemConfig.prefixAdmin}/users`);
  } catch (error) {
    req.flash("error", "Lỗi thay đổi trạng thái.");
    res.redirect(`/${systemConfig.prefixAdmin}/users`);
  }
};

// [DELETE] /admin/users/delete/:id
export const deleteItem = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const deletedBy = {
      accountId: res.locals.user ? res.locals.user._id : "mockId",
      deletedAt: new Date(),
    };
    await User.updateOne(
      { _id: id },
      { deleted: true, deletedAt: new Date(), deletedBy },
    );
    req.flash("success", "Tài khoản đã được chuyển vào thùng rác.");
    res.redirect(`/${systemConfig.prefixAdmin}/users`);
  } catch (error) {
    req.flash("error", "Lỗi xóa tài khoản.");
    res.redirect(`${systemConfig.prefixAdmin}/users`);
  }
};

// [GET] /admin/users/trash
export const trash = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ deleted: true }).populate(
      "role_id",
      "title",
    );

    res.render("admin/pages/users/trash", {
      pageTitle: "Thùng rác tài khoản",
      users,
    });
  } catch (error) {
    req.flash("error", "Lỗi tải thùng rác.");
    res.redirect(`/${systemConfig.prefixAdmin}/users`);
  }
};

// [PATCH] /admin/users/restore/:id
export const restore = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await User.updateOne({ _id: id }, { deleted: false });
    req.flash("success", "Đã khôi phục tài khoản.");
    res.redirect(`/${systemConfig.prefixAdmin}/users`);
  } catch (error) {
    req.flash("error", "Lỗi khôi phục.");
    res.redirect(`/${systemConfig.prefixAdmin}/users`);
  }
};

// [DELETE] /admin/users/delete-permanent/:id
export const deletePermanent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await User.deleteOne({ _id: id });
    req.flash("success", "Đã xóa vĩnh viễn tài khoản.");
    res.redirect(`/${systemConfig.prefixAdmin}/users`);
  } catch (error) {
    req.flash("error", "Lỗi xóa vĩnh viễn.");
    res.redirect(`/${systemConfig.prefixAdmin}/users`);
  }
};
