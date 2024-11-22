import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import * as messageController from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, messageController.getUserForSidebar);
router.get("/:id", protectRoute, messageController.getMessages);

router.post("/send/:id", protectRoute, messageController.sendMessage);

export default router;