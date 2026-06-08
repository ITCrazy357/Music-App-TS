import { Router } from "express";
import multer from "multer";
import * as controller from "../../controllers/admin/topic.controller";
import * as uploadCloud from "../../middlewares/admin/uploadCloud.middleware";
import { requirePermission } from "../../middlewares/clients/auth.middleware";

const router: Router = Router();
const upload = multer();

router.get("/", requirePermission("topics_view"), controller.index);

router.get("/create", requirePermission("topics_create"), controller.create);
router.post(
  "/create",
  requirePermission("topics_create"),
  upload.single("avatar"),
  uploadCloud.uploadSingle,
  controller.createPost,
);

router.get("/edit/:id", requirePermission("topics_edit"), controller.edit);
router.patch(
  "/edit/:id",
  requirePermission("topics_edit"),
  upload.single("avatar"),
  uploadCloud.uploadSingle,
  controller.editPatch,
);

router.get("/detail/:id", requirePermission("topics_view"), controller.detail);

router.get("/trash", requirePermission("topics_delete"), controller.trash);
router.patch("/restore/:id", requirePermission("topics_delete"), controller.restore);
router.delete("/delete-permanent/:id", requirePermission("topics_delete"), controller.deletePermanent);

router.patch("/change-status/:status/:id", requirePermission("topics_edit"), controller.changeStatus);
router.patch("/change-multi", requirePermission("topics_edit"), controller.changeMulti);

router.delete("/delete/:id", requirePermission("topics_delete"), controller.deleteItem);

export const topicRoutes: Router = router;
