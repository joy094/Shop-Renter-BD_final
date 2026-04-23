import { Router } from "express";
import * as ctrl from "../controllers/tenantController.js";
import { requireAuth } from "../middleware/session.js";

const router = Router();
router.use(requireAuth);
router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.get("/:id", ctrl.getOne);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

export default router;
