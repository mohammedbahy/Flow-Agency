import type { AgencySettings, DeadlineRule } from '../types/settings.types';

/** MOCK agency workspace settings — UI preview only, never persisted. */
export const MOCK_AGENCY_SETTINGS: AgencySettings = {
  name: 'Nexus Agency',
  tagline: 'The operational engine for elite digital agencies.',
  email: 'ops@nexusagency.co',
  phone: '+1 (415) 555-0132',
  address: '540 Market St, San Francisco, CA',
  timezone: 'America/Los_Angeles',
};

export const TIMEZONES = [
  'America/Los_Angeles',
  'America/Chicago',
  'America/New_York',
  'Europe/London',
  'Europe/Berlin',
  'Africa/Cairo',
  'Asia/Dubai',
] as const;

/** MOCK deadline rules — UI preview only, never persisted. */
export const MOCK_DEADLINE_RULES: DeadlineRule[] = [
  {
    id: 'dr1', name: 'Client review SLA', appliesTo: 'reviews',
    limit: 48, unit: 'hours', action: 'Escalate to account lead', enabled: true,
  },
  {
    id: 'dr2', name: 'Overdue task nudge', appliesTo: 'tasks',
    limit: 24, unit: 'hours', action: 'Notify assignee and manager', enabled: true,
  },
  {
    id: 'dr3', name: 'Deliverable approval window', appliesTo: 'deliverables',
    limit: 5, unit: 'days', action: 'Auto-remind client daily', enabled: false,
  },
];
