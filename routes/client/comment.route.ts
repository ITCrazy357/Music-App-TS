import { Request, Response, Router } from "express";
import * as controller from "../../controllers/client/comment.controller";
import { requireAuth } from "../../middlewares/clients/auth.middleware";

const router: Router = Router();

router.post("/post/:idSong", requireAuth, controller.postComment);

router.patch("/like/:idComment", requireAuth, controller.likeComment);

router.patch("/dislike/:idComment", requireAuth, controller.dislikeComment);

router.patch("/edit/:idComment", requireAuth, controller.editComment);

router.delete("/delete/:idComment", requireAuth, controller.deleteComment);

export const commentRoutes: Router = router;
