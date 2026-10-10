import { Router } from "express";
import { getMyPermissions } from "../controllers/permission-controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/me", requireAuth, getMyPermissions);

export default router;
