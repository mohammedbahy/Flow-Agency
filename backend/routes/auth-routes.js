import { Router } from "express";
import { login, changePassword } from "../controllers/auth-controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/login", login);
router.patch("/change-password", requireAuth, changePassword);

export default router;
