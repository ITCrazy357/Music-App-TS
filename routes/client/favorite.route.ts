import { Router } from "express";
import * as controller from "../../controllers/client/favorite-song.controller";
import { requireAuth } from "../../middlewares/clients/auth.middleware";

const router: Router = Router();

router.get("/", requireAuth, controller.index);

export const favoriteSongRoutes: Router = router;
