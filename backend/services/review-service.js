import Review from "../models/review.js";
import HttpError from "../utils/http-error.js";
import { assertValidObjectId } from "../utils/object-id.js";

const formatReview = (review) => ({
  id: String(review._id),
  title: review.title,
  contentType: review.contentType,
  client: review.client ?? null,
  project: review.project ?? null,
  submittedBy: review.submittedBy ?? null,
  status: review.status,
  preview: review.preview ?? null,
  feedback: review.feedback ?? null,
  decidedBy: review.decidedBy ? String(review.decidedBy) : null,
  createdAt: review.createdAt,
  updatedAt: review.updatedAt,
});

export const createReview = async (payload, actor) => {
  const review = await Review.create({ ...payload, createdBy: actor?._id ?? null });
  return formatReview(review);
};

export const listReviews = async ({ page, limit, status }) => {
  const filter = {};
  if (status) {
    filter.status = status;
  }
  const [total, reviews] = await Promise.all([
    Review.countDocuments(filter),
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);
  return {
    items: reviews.map(formatReview),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const decideReview = async (reviewId, actor, decision, feedback = null) => {
  assertValidObjectId(reviewId, "review id");
  const review = await Review.findById(reviewId);
  if (!review) {
    throw HttpError.notFound("Review not found");
  }
  if (review.status !== "pending") {
    throw HttpError.badRequest("Validation failed", [
      { field: "status", message: "Only pending items can be decided" },
    ]);
  }
  review.status = decision;
  review.feedback = feedback;
  review.decidedBy = actor?._id ?? null;
  await review.save();
  return formatReview(review);
};

export const approveReview = (reviewId, actor) => decideReview(reviewId, actor, "approved");

export const rejectReview = (reviewId, actor, feedback) =>
  decideReview(reviewId, actor, "rejected", feedback);
