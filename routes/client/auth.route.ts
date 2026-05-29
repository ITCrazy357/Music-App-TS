import { Router } from "express";
import * as controller from "../../controllers/client/auth.controller";
import {
  registerValidation,
  loginValidation,
} from "../../validations/clients/auth.validation";

const router: Router = Router();

router.get("/login", controller.login);

router.post("/login", loginValidation, controller.postLogin);

router.get("/register", controller.register);

router.post("/register", registerValidation, controller.postRegister);

router.get("/logout", controller.logout);

export const authRoutes: Router = router;
