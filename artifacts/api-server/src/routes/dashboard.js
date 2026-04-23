import { Router } from "express";
import * as ctrl from "../controllers/dashboardController.js";
import { requireAuth } from "../middleware/session.js";

const router = Router();
router.use(requireAuth);
router.get("/summary", ctrl.summary);
router.get("/recent-payments", ctrl.recentPayments);
router.get("/reminders", ctrl.reminders);

export default router;
