import { Router } from "express";
import * as controller from "../../controllers/client/ad.controller";

const router: Router = Router();

router.get("/click/:id", controller.click);
router.post("/view/:id", controller.view);

export const adRoutes: Router = router;
