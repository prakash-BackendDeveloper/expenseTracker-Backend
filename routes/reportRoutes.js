import { Router } from "express";
import { getReportSummary } from "../controllers/reportController.js";

const router = Router();
router.get("/summary", getReportSummary);
export default router;
