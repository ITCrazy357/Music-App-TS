import { Router } from "express";
import multer from "multer";
const upload = multer();

import * as controller from "../../controllers/admin/singer.controller";
import * as uploadCloud from "../../middlewares/admin/uploadCloud.middleware";
import { requirePermission } from "../../middlewares/clients/auth.middleware";

const router = Router();

router.get("/", requirePermission("singers_view"), controller.index);
router.get("/create", requirePermission("singers_create"), controller.create);
router.post(
  "/create",
  requirePermission("singers_create"),
  upload.single("avatar"),
  uploadCloud.uploadSingle,
  controller.createPost
);
router.get("/edit/:id", requirePermission("singers_edit"), controller.edit);
router.patch(
  "/edit/:id",
  requirePermission("singers_edit"),
  upload.single("avatar"),
  uploadCloud.uploadSingle,
  controller.editPatch
);
router.get("/detail/:id", requirePermission("singers_view"), controller.detail);

router.patch("/change-multi", requirePermission("singers_edit"), controller.changeMulti);

router.patch("/change-status/:status/:id", requirePermission("singers_edit"), controller.changeStatus);
router.delete("/delete/:id", requirePermission("singers_delete"), controller.deleteItem);

router.get("/trash", requirePermission("singers_delete"), controller.trash);
router.patch("/restore/:id", requirePermission("singers_delete"), controller.restore);
router.delete("/delete-permanent/:id", requirePermission("singers_delete"), controller.deletePermanent);

export const singerRoutes = router;
