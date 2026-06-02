import { Request, Response, Router } from "express";
import * as controller from "../../controllers/client/song.controller";
import { requireAuth } from "../../middlewares/clients/auth.middleware";

const router: Router = Router();

router.get("/:slugTopic", controller.list);

router.get("/detail/:slugSong", requireAuth, controller.detail);

router.patch("/like/:typeLike/:idSong", requireAuth, controller.like);

router.patch(
  "/favorite/:typeFavorite/:idSong",
  requireAuth,
  controller.favorite,
);

router.patch("/listen/:idSong", controller.listen);

export const songRoutes: Router = router;
