import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import { authController } from "./auth.controller";
import { validateLogin, validateRegister } from "./auth.validation";

const router = Router();

router.post("/register",validateRequest(validateRegister), authController.createUser)
router.post("/login",validateRequest(validateLogin), authController.loginUser)

export const authRoutes = router;