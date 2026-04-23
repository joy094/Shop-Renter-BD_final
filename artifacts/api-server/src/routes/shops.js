import { Router } from "express";
import * as ctrl from "../controllers/shopController.js";
import { requireAuth } from "../middleware/session.js";

const router = Router();
router.use(requireAuth);
router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.get("/:id", ctrl.getOne);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);
router.post("/:id/assign-tenant", ctrl.assignTenant);

export default router;
