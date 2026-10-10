import type { BrandMetric } from '../types/analytics.types';

/**
 * MOCK brand performance data — UI preview only.
 * Static placeholders, not live analytics.
 * The Backend team replaces these imports with API calls in a later sprint.
 */
export const MOCK_BRAND_METRICS: BrandMetric[] = [
  { id: 'b1', brand: 'Apex Finish', client: 'Apex Finish', health: 'healthy', approvalRate: 92, inReview: 3, delayed: 1, completed: 24 },
  { id: 'b2', brand: 'Apex Performance', client: 'Apex Finish', health: 'watch', approvalRate: 76, inReview: 2, delayed: 2, completed: 15 },
  { id: 'b3', brand: 'Lumina Health', client: 'Lumina Health', health: 'healthy', approvalRate: 95, inReview: 1, delayed: 0, completed: 19 },
  { id: 'b4', brand: 'Globex', client: 'Globex', health: 'at-risk', approvalRate: 58, inReview: 2, delayed: 3, completed: 11 },
  { id: 'b5', brand: 'Vama Retail', client: 'Vama Retail', health: 'watch', approvalRate: 81, inReview: 4, delayed: 1, completed: 17 },
  { id: 'b6', brand: 'Hooli', client: 'Hooli', health: 'healthy', approvalRate: 89, inReview: 1, delayed: 0, completed: 12 },
];
