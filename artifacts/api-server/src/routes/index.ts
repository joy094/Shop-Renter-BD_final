import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import tenantsRouter from "./tenants";
import shopsRouter from "./shops";
import paymentsRouter from "./payments";
import dashboardRouter from "./dashboard";
import reportsRouter from "./reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(tenantsRouter);
router.use(shopsRouter);
router.use(paymentsRouter);
router.use(dashboardRouter);
router.use(reportsRouter);

export default router;
