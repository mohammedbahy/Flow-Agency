export type BrandHealth = 'healthy' | 'watch' | 'at-risk';

export interface BrandMetric {
  id: string;
  brand: string;
  client: string;
  health: BrandHealth;
  approvalRate: number;
  inReview: number;
  delayed: number;
  completed: number;
}

export const BRAND_HEALTH_LABEL: Record<BrandHealth, string> = {
  healthy: 'Healthy',
  watch: 'Watch',
  'at-risk': 'At risk',
};
