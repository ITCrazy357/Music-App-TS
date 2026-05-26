import { Request, Response, Router } from "express";
import * as controller from "../../controllers/client/song.controller";

const router: Router = Router();

router.get("/:slugTopic", controller.list);

router.get("/detail/:slugSong", controller.detail);

router.patch("/like/:typeLike/:idSong", controller.like);

export const songRoutes: Router = router;
