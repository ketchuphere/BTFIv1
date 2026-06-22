import { Router, type IRouter } from "express";
import healthRouter from "./health";
import trafficRouter from "./traffic";
import mapplsRouter from "./mappls";

const router: IRouter = Router();

router.use(healthRouter);
router.use(trafficRouter);
router.use(mapplsRouter);

export default router;
