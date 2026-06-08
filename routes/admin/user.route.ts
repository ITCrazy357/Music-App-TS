import { Router } from "express";
import multer from "multer";
const upload = multer();

import * as controller from "../../controllers/admin/user.controller";
import * as uploadCloud from "../../middlewares/admin/uploadCloud.middleware";
import { requirePermission } from "../../middlewares/clients/auth.middleware";

const router = Router();

router.get("/", requirePermission("users_view"), controller.index);

router.get("/create", requirePermission("users_create"), controller.create);

router.post(
  "/create",
  requirePermission("users_create"),
  upload.single("avatar"),
  uploadCloud.uploadSingle,
  controller.createPost,
);

router.get("/edit/:id", requirePermission("users_edit"), controller.edit);

router.patch(
  "/edit/:id",
  requirePermission("users_edit"),
  upload.single("avatar"),
  uploadCloud.uploadSingle,
  controller.editPatch,
);

router.get("/detail/:id", requirePermission("users_view"), controller.detail);

router.patch(
  "/change-status/:status/:id",
  requirePermission("users_edit"),
  controller.changeStatus,
);

router.delete(
  "/delete/:id",
  requirePermission("users_delete"),
  controller.deleteItem,
);

router.get("/trash", requirePermission("users_delete"), controller.trash);

router.patch(
  "/restore/:id",
  requirePermission("users_delete"),
  controller.restore,
);

router.delete(
  "/delete-permanent/:id",
  requirePermission("users_delete"),
  controller.deletePermanent,
);

export const userRoutes = router;
