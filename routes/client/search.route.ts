import { Router } from "express";
import * as controller from "../../controllers/client/search.controller";

const router = Router();

router.get("/:type", controller.results);

export const searchRoutes: Router = router;
