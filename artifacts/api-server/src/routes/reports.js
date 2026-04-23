import { Router } from "express";
import * as ctrl from "../controllers/reportController.js";
import { requireAuth } from "../middleware/session.js";

const router = Router();
router.use(requireAuth);
router.get("/monthly-collection", ctrl.monthlyCollection);
router.get("/occupancy", ctrl.occupancy);
router.get("/top-tenants", ctrl.topTenants);

export default router;
