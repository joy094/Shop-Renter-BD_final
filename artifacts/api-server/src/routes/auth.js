import { Router } from "express";
import * as ctrl from "../controllers/authController.js";
import { requireAuth } from "../middleware/session.js";

const router = Router();
router.post("/login", ctrl.login);
router.post("/logout", ctrl.logout);
router.get("/me", ctrl.me);
router.put("/password", requireAuth, ctrl.changePassword);

export default router;
