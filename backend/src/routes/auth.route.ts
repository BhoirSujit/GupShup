import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { protectRoute } from "../middlewares/auth.middleware";

const router = Router();

router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/signup", authController.signup);

router.put("/update-profile", protectRoute, authController.updateProfile);

router.get("/verify", protectRoute, authController.checkAuth);


export default router;