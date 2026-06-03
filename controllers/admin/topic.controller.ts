import { Response, Request } from "express";
import Topic from "../../models/topic.model";
import { convertToSlug } from "../../helpers/convertToSlug";
import { systemConfig } from "../../config/system";

//[GET] /admin/topics
export const index = async (req: Request, res: Response) => {
  try {
    const topics = await Topic.find({ deleted: false });

    res.render("admin/pages/topics/index", {
      pageTitle: "Quản lý chủ đề",
      topics,
    });
  } catch (error) {
    req.flash("error", "Không tải được danh sách chủ đề.");
    res.redirect("back");
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
      return res.redirect("back");
    }

    const payload: any = {
      title,
      description,
      status: status || "inactive",
      slug: convertToSlug(title),
    };

    if (req.body.avatar) {
      payload.avatar = req.body.avatar;
    }

    const topic = new Topic(payload);
    await topic.save();
    req.flash("success", "Thêm chủ đề thành công.");
    res.redirect(`/${systemConfig.prefixAdmin}/topics`);
  } catch (error) {
    console.error(error);
    req.flash("error", "Không thể thêm mới chủ đề.");
    res.redirect("back");
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

    if (!title) {
      req.flash("error", "Tiêu đề là bắt buộc.");
      return res.redirect("back");
    }

    const payload: any = {
      title,
      description,
      status: status || "inactive",
      slug: convertToSlug(title),
    };

    if (req.body.avatar) {
      payload.avatar = req.body.avatar;
    }

    await Topic.updateOne({ _id: id }, payload);
    req.flash("success", "Cập nhật chủ đề thành công.");
    res.redirect(`/${systemConfig.prefixAdmin}/topics`);
  } catch (error) {
    console.error(error);
    req.flash("error", "Không thể cập nhật chủ đề.");
    res.redirect("back");
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

    console.log(typeof topic.description);
    console.log(topic.description);

    if (!topic) {
      req.flash("error", "Chủ đề không tồn tại.");
      return res.redirect(`/${systemConfig.prefixAdmin}/`);
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
    await Topic.updateOne({ _id: id }, { status });
    req.flash("success", "Cập nhật trạng thái thành công.");
    res.redirect("back");
  } catch (error) {
    req.flash("error", "Không thể cập nhật trạng thái.");
    res.redirect(`/${systemConfig.prefixAdmin}/topics`);
  }
};

// [DELETE] /admin/topics/delete/:id
export const deleteItem = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await Topic.updateOne({ _id: id }, { deleted: true, deleteAt: new Date() });
    req.flash("success", "Chủ đề đã được chuyển vào thùng rác.");
    res.redirect("back");
  } catch (error) {
    req.flash("error", "Không thể xóa chủ đề.");
    res.redirect("back");
  }
};

// [GET] /admin/topics/trash
export const trash = async (req: Request, res: Response) => {
  try {
    const topics = await Topic.find({ deleted: true });

    res.render("admin/pages/topics/trash", {
      pageTitle: "Thùng rác chủ đề",
      topics,
    });
  } catch (error) {
    req.flash("error", "Không thể tải thùng rác chủ đề.");
    res.redirect("back");
  }
};

// [PATCH] /admin/topics/restore/:id
export const restore = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await Topic.updateOne({ _id: id }, { deleted: false });
    req.flash("success", "Đã khôi phục chủ đề.");
    res.redirect("back");
  } catch (error) {
    req.flash("error", "Không thể khôi phục chủ đề.");
    res.redirect("back");
  }
};

// [DELETE] /admin/topics/delete-permanent/:id
export const deletePermanent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await Topic.deleteOne({ _id: id });
    req.flash("success", "Đã xóa vĩnh viễn chủ đề.");
    res.redirect("back");
  } catch (error) {
    req.flash("error", "Không thể xóa vĩnh viễn chủ đề.");
    res.redirect("back");
  }
};
