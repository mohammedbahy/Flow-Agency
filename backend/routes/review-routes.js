import { Router } from "express";
import { PERMISSIONS } from "../constants/permissions.js";
import {
  approveReview,
  createReview,
  listReviews,
  rejectReview,
} from "../controllers/review-controller.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", requirePermission(PERMISSIONS.REVIEWS_READ), listReviews);
router.post("/", requirePermission(PERMISSIONS.REVIEWS_READ), createReview);
router.patch(
  "/:reviewId/approve",
  requirePermission(PERMISSIONS.REVIEWS_MANAGE),
  approveReview,
);
router.patch(
  "/:reviewId/reject",
  requirePermission(PERMISSIONS.REVIEWS_MANAGE),
  rejectReview,
);

export default router;
