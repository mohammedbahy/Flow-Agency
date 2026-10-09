import type {
  ActivityItem,
  AllocationRow,
  KpiCard,
  PendingReviewRow,
  WorkloadWeek,
} from '../types/dashboard.types';

/**
 * MOCK executive dashboard data — UI preview only.
 * Figures are static placeholders, not live backend data.
 * The Backend team replaces these imports with API calls in Sprint 2.
 */
export const MOCK_KPIS: KpiCard[] = [
  {
    id: 'velocity',
    eyebrow: 'Task velocity',
    value: '142',
    caption: 'Total Active Tasks Across Teams',
    stats: [
      { label: '42 in progress', value: '42' },
      { label: '9 overdue', value: '9', tone: 'warning' },
      { label: '85 done', value: '85', tone: 'success' },
    ],
  },
  {
    id: 'pipeline',
    eyebrow: 'Approval pipeline',
    value: '14',
    caption: 'Awaiting client · Median wait 1.2 business days',
    stats: [
      { label: '14 Client OK', value: '14' },
      { label: '6 Approved', value: '6', tone: 'success' },
    ],
  },
  {
    id: 'retainers',
    eyebrow: 'Retainer billings',
    value: '$420,000',
    caption: 'Active monthly retainers',
    stats: [
      { label: '24 Contracted Clients', value: '24' },
      { label: '0 At-Risk', value: '0', tone: 'success' },
    ],
  },
  {
    id: 'sla',
    eyebrow: 'Review SLA',
    value: '3.4 hrs avg',
    caption: 'Within contractual delivery window',
    stats: [{ label: 'On track', value: '98.1%', tone: 'success' }],
  },
];

export const MOCK_PENDING_REVIEWS: PendingReviewRow[] = [
  {
    id: 'pr1',
    client: 'Apex Finish',
    initials: 'AF',
    deliverable: 'Q4 Performance Creative Set (32 Assets)',
    lead: 'Marissa Kline',
    deadline: 'Due today',
    sla: 'Overdue SLA',
    slaTone: 'error',
  },
  {
    id: 'pr2',
    client: 'Lumina Health',
    initials: 'LH',
    deliverable: 'TikTok Brand Awareness Campaign V2',
    lead: 'Maya Lin',
    deadline: 'Due in 3 days',
    sla: 'On track',
    slaTone: 'success',
  },
  {
    id: 'pr3',
    client: 'Vama Retail',
    initials: 'VR',
    deliverable: 'Autumn Lookbook & Typography Specs PDF',
    lead: 'David Park',
    deadline: 'Due in 5 days',
    sla: 'At risk',
    slaTone: 'warning',
  },
];

export const MOCK_ALLOCATION: AllocationRow[] = [
  { id: 'al1', team: 'Design & Motion', detail: '6 Designers · 19 Tasks', percent: 88, note: '88% Booked' },
  { id: 'al2', team: 'Copywriting & Content', detail: '4 Copywriters · 12 Tasks', percent: 45, note: '45% Booked' },
  {
    id: 'al3',
    team: 'Media Buying & Ads',
    detail: '5 Specialists · 31 Campaigns',
    percent: 92,
    note: '92% Over Capacity',
    overCapacity: true,
  },
];

export const MOCK_ACTIVITY: ActivityItem[] = [
  { id: 'a1', actor: 'Marcus Chen', text: 'submitted Instagram carousel drafts for review (4 slides attached).', time: '12m ago' },
  { id: 'a2', actor: 'Sarah Miller', text: 'approved Brand Voice one-pager for Lumina Health.', time: '34m ago' },
  { id: 'a3', actor: 'System', text: 'Overdue Alert: Landing Page Copy for Apex missed its SLA. System auto-escalation.', time: '1h ago' },
  { id: 'a4', actor: 'Elena Rostova', text: 'reassigned Senior Designer to Lumina Health. Resource adjustment.', time: '2h ago' },
];

export const MOCK_WORKLOAD: WorkloadWeek[] = [
  { id: 'w1', label: 'W1', delivered: 62, planned: 70 },
  { id: 'w2', label: 'W2', delivered: 74, planned: 72 },
  { id: 'w3', label: 'W3', delivered: 58, planned: 75 },
  { id: 'w4', label: 'W4', delivered: 80, planned: 78 },
  { id: 'w5', label: 'W5', delivered: 69, planned: 74 },
  { id: 'w6', label: 'W6', delivered: 84, planned: 80 },
];
