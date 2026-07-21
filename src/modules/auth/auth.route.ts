import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import { authController } from "./auth.controller";
import { validateLogin, validateRegister } from "./auth.validation";
import auth from "../../middleware/auth";

const router = Router();

router.post("/register",validateRequest(validateRegister), authController.createUser)
router.post("/login",validateRequest(validateLogin), authController.loginUser)
router.post("/refresh-token", authController.refreshToken)
router.get("/profile",auth(), authController.getProfile)
router.post("/logout", auth(), authController.logout)

export const authRoutes = router;