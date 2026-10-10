// Reviews feature barrel — live backend (`/api/v1/reviews`).
export { ReviewsPage } from './pages/ReviewsPage';
export { ReviewBanner } from './components/ReviewBanner';
export { ReviewItemCard } from './components/ReviewItemCard';
export { RecentlyApprovedPanel, WorkflowSnapshotPanel } from './components/ReviewRails';
export { reviewsService } from './services/reviews.service';
export type {
  ApiReview,
  ReviewStatus,
  ReviewContentType,
  CreateReviewBody,
} from './services/reviews.service';
