import type { MockDeadlineRule } from '../types/deadlines.types';

/**
 * MOCK deadline rules — UI preview only.
 * Real rules arrive with backend workflow automation (future sprint).
 */
export const MOCK_DEADLINE_RULES: MockDeadlineRule[] = [
  {
    id: 'dr1',
    name: 'SLA breach warning',
    scope: 'All client projects',
    threshold: '24h before due date',
    action: 'Notify assignee + Account Manager',
    enabled: true,
    updated: 'Oct 18, 2026',
  },
  {
    id: 'dr2',
    name: 'Overdue escalation',
    scope: 'Retainer campaigns',
    threshold: '4h overdue',
    action: 'Escalate to Agency Director',
    enabled: true,
    updated: 'Oct 16, 2026',
  },
  {
    id: 'dr3',
    name: 'Review reminder',
    scope: 'Content deliverables',
    threshold: '48h without decision',
    action: 'Remind client reviewer',
    enabled: false,
    updated: 'Oct 12, 2026',
  },
  {
    id: 'dr4',
    name: 'Capacity guard',
    scope: 'Creative & Design team',
    threshold: 'Above 90% allocation',
    action: 'Block new assignments',
    enabled: true,
    updated: 'Oct 10, 2026',
  },
];
