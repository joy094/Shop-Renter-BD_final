import { Router } from "express";
import { Tenant } from "../models/Tenant.js";
import { Shop } from "../models/Shop.js";
import { requireAuth } from "../lib/session.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res) => {
  const tenants = await Tenant.find().sort({ createdAt: -1 }).lean();
  res.json(tenants);
});

router.post("/", async (req, res) => {
  const t = await Tenant.create(req.body);
  res.status(201).json(t);
});

router.get("/:id", async (req, res) => {
  const t = await Tenant.findById(req.params.id).lean();
  if (!t) return res.status(404).json({ error: "Not found" });
  res.json(t);
});

router.put("/:id", async (req, res) => {
  const t = await Tenant.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!t) return res.status(404).json({ error: "Not found" });
  res.json(t);
});

router.delete("/:id", async (req, res) => {
  const inUse = await Shop.countDocuments({ tenantId: req.params.id });
  if (inUse > 0) {
    return res.status(409).json({ error: "Tenant is assigned to one or more shops" });
  }
  await Tenant.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
