import { Router } from "express";

import * as controller from "../../controllers/client/comment.controller";

const router = Router();

// GET /comments?songId=...&sort=...
router.get("/", controller.getCommentsBySongId);

export const commentFilterRoutes: Router = router;
