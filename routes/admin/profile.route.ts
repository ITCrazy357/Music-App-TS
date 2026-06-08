import { Router } from "express";
import * as controller from "../../controllers/admin/profile.controller";

const router = Router();

router.get("/", controller.index);

export const profileRoutes = router;
