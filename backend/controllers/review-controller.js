import * as reviewService from "../services/review-service.js";
import {
  validateCreateReviewPayload,
  validateListReviewsQuery,
  validateRejectReviewPayload,
  validateReviewId,
} from "../validators/review-validator.js";

export const createReview = async (req, res) => {
  const payload = validateCreateReviewPayload(req.body);
  const review = await reviewService.createReview(payload, req.user);

  res.status(201).json({
    success: true,
    message: "Review item created successfully",
    data: review,
  });
};

export const listReviews = async (req, res) => {
  const query = validateListReviewsQuery(req.query);
  const { items, pagination } = await reviewService.listReviews(query);

  res.status(200).json({
    success: true,
    data: items,
    pagination,
  });
};

export const approveReview = async (req, res) => {
  validateReviewId(req.params.reviewId);
  const review = await reviewService.approveReview(req.params.reviewId, req.user);

  res.status(200).json({
    success: true,
    message: "Deliverable approved successfully",
    data: review,
  });
};

export const rejectReview = async (req, res) => {
  validateReviewId(req.params.reviewId);
  const { feedback } = validateRejectReviewPayload(req.body);
  const review = await reviewService.rejectReview(req.params.reviewId, req.user, feedback);

  res.status(200).json({
    success: true,
    message: "Deliverable sent back for revision successfully",
    data: review,
  });
};
