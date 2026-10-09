// Dashboard feature barrel (Sprint 1 UI preview).
export { DashboardPage } from './pages/DashboardPage';
export { KpiCardView } from './components/KpiCardView';
export { PendingReviewsTable } from './components/PendingReviewsTable';
export { TeamAllocation } from './components/TeamAllocation';
export { ActivityFeed } from './components/ActivityFeed';
export { WorkloadChart } from './components/WorkloadChart';
export {
  MOCK_KPIS,
  MOCK_PENDING_REVIEWS,
  MOCK_ALLOCATION,
  MOCK_ACTIVITY,
  MOCK_WORKLOAD,
} from './mock/dashboard.mock';
export type {
  KpiCard,
  KpiStat,
  PendingReviewRow,
  AllocationRow,
  ActivityItem,
  WorkloadWeek,
} from './types/dashboard.types';
