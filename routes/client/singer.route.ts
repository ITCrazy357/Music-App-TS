import { Router } from "express";
import * as controller from "../../controllers/client/singer.controller";

const router = Router();

router.get("/", controller.index);
router.get("/detail/:slugSinger", controller.detail);

export const singerRoutes = router;