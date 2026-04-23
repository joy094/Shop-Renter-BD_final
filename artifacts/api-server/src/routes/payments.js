import { Router } from "express";
import * as ctrl from "../controllers/paymentController.js";
import { requireAuth } from "../middleware/session.js";

const router = Router();
router.use(requireAuth);
router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);
router.post("/generate-monthly", ctrl.generateMonthly);

export default router;
