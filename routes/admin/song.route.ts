import { Router } from "express";
import multer from "multer";
import * as controller from "../../controllers/admin/song.controller";
import * as uploadCloud from "../../middlewares/admin/uploadCloud.middleware";

const router: Router = Router();
const upload = multer();

router.get("/", controller.index);

router.get("/create", controller.create);
router.post(
  "/create",
  upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'audio', maxCount: 1 }]),
  uploadCloud.uploadFields,
  controller.createPost
);

router.get("/edit/:id", controller.edit);
router.patch(
  "/edit/:id",
  upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'audio', maxCount: 1 }]),
  uploadCloud.uploadFields,
  controller.editPatch
);

router.get("/detail/:id", controller.detail);

router.patch("/change-status/:status/:id", controller.changeStatus);

router.delete("/delete/:id", controller.deleteItem);

router.get("/trash", controller.trash);
router.patch("/restore/:id", controller.restore);
router.delete("/delete-permanent/:id", controller.deletePermanent);

export const songRoutes: Router = router;
