import { Router } from "express";
import multer from "multer";
import * as controller from "../../controllers/admin/song.controller";
import * as uploadCloud from "../../middlewares/admin/uploadCloud.middleware";
import { requirePermission } from "../../middlewares/clients/auth.middleware";

const router: Router = Router();
const upload = multer();

router.get("/", requirePermission("songs_view"), controller.index);

router.get("/create", requirePermission("songs_create"), controller.create);
router.post(
  "/create",
  requirePermission("songs_create"),
  upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'audio', maxCount: 1 }]),
  uploadCloud.uploadFields,
  controller.createPost
);

router.get("/edit/:id", requirePermission("songs_edit"), controller.edit);
router.patch(
  "/edit/:id",
  requirePermission("songs_edit"),
  upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'audio', maxCount: 1 }]),
  uploadCloud.uploadFields,
  controller.editPatch
);

router.get("/detail/:id", requirePermission("songs_view"), controller.detail);

router.patch("/change-status/:status/:id", requirePermission("songs_edit"), controller.changeStatus);

router.delete("/delete/:id", requirePermission("songs_delete"), controller.deleteItem);

router.get("/trash", requirePermission("songs_delete"), controller.trash);
router.patch("/restore/:id", requirePermission("songs_delete"), controller.restore);
router.delete("/delete-permanent/:id", requirePermission("songs_delete"), controller.deletePermanent);

export const songRoutes: Router = router;
