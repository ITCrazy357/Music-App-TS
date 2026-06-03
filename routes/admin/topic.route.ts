import { Router } from "express";
import multer from "multer";
import * as controller from "../../controllers/admin/topic.controller";
import * as uploadCloud from "../../middlewares/admin/uploadCloud.middleware";

const router: Router = Router();
const upload = multer();

router.get("/", controller.index);

router.get("/create", controller.create);
router.post(
  "/create",
  upload.single("avatar"),
  uploadCloud.uploadSingle,
  controller.createPost,
);

router.get("/edit/:id", controller.edit);
router.patch(
  "/edit/:id",
  upload.single("avatar"),
  uploadCloud.uploadSingle,
  controller.editPatch,
);

router.get("/detail/:id", controller.detail);

router.get("/trash", controller.trash);
router.patch("/restore/:id", controller.restore);
router.delete("/delete-permanent/:id", controller.deletePermanent);

router.patch("/change-status/:status/:id", controller.changeStatus);

router.delete("/delete/:id", controller.deleteItem);

export const topicRoutes: Router = router;
