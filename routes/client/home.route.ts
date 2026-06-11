import { Router } from "express";
import * as controller from "../../controllers/client/home.controller";

const router = Router();

router.get("/home", controller.index);

export const homeRoutes = router;