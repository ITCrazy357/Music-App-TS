import { Router } from "express";
import * as controller from "../../controllers/admin/setting.controller";
import multer from "multer";
import { uploadFields } from "../../middlewares/admin/uploadCloud.middleware";

const router = Router();
const upload = multer();

router.get("/general", controller.general);

router.patch(
  "/general",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
  ]),
  uploadFields,
  controller.generalPatch
);

export const settingRoutes = router;
