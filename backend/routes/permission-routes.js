import { Router } from "express";
import { getMyPermissions, getPermissionsMatrix } from "../controllers/permission-controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/me", requireAuth, getMyPermissions);
router.get("/matrix", requireAuth, getPermissionsMatrix);

export default router;
