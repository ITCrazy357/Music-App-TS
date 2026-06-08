import { Router } from "express";
import * as controller from "../../controllers/admin/role.controller";
import { requirePermission } from "../../middlewares/clients/auth.middleware";

const router = Router();

router.get("/", requirePermission("roles_view"), controller.index);

router.get("/create", requirePermission("roles_create"), controller.create);
router.post("/create", requirePermission("roles_create"), controller.createPost);

router.get("/edit/:id", requirePermission("roles_edit"), controller.edit);
router.patch("/edit/:id", requirePermission("roles_edit"), controller.editPatch);

router.get("/detail/:id", requirePermission("roles_view"), controller.detail);

router.patch("/change-multi", requirePermission("roles_edit"), controller.changeMulti);
router.patch("/change-status/:status/:id", requirePermission("roles_edit"), controller.changeStatus);
router.delete("/delete/:id", requirePermission("roles_delete"), controller.deleteItem);

router.get("/trash", requirePermission("roles_delete"), controller.trash);
router.patch("/restore/:id", requirePermission("roles_delete"), controller.restore);
router.delete("/delete-permanent/:id", requirePermission("roles_delete"), controller.deletePermanent);

router.get("/permissions", requirePermission("roles_permissions"), controller.permissions);
router.patch("/permissions", requirePermission("roles_permissions"), controller.permissionsPatch);

export const roleRoutes = router;
