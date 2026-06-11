import { Router } from "express";
import * as controller from "../../controllers/client/ranking.controller";

const router = Router();

router.get("/", controller.index);

export const rankingRoutes = router;