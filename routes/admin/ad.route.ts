import { Router } from "express";
import * as controller from "../../controllers/admin/ad.controller";
import { requirePermission } from "../../middlewares/clients/auth.middleware";

const router: Router = Router();

router.get("/", requirePermission("ads_view"), controller.index);

router.get("/create", requirePermission("ads_create"), controller.create);
router.post("/create", requirePermission("ads_create"), controller.createPost);

router.get("/edit/:id", requirePermission("ads_edit"), controller.edit);
router.patch("/edit/:id", requirePermission("ads_edit"), controller.editPatch);

router.get("/detail/:id", requirePermission("ads_view"), controller.detail);

router.patch(
  "/change-status/:status/:id",
  requirePermission("ads_edit"),
  controller.changeStatus,
);

router.delete(
  "/delete/:id",
  requirePermission("ads_delete"),
  controller.deleteItem,
);

router.get("/trash", requirePermission("ads_delete"), controller.trash);
router.patch(
  "/restore/:id",
  requirePermission("ads_delete"),
  controller.restore,
);
router.delete(
  "/delete-permanent/:id",
  requirePermission("ads_delete"),
  controller.deletePermanent,
);

export const adRoutes: Router = router;
