import type { MockProfile, ProfileActivityItem } from '../types/profile.types';

/**
 * MOCK profile data — UI preview only.
 * Mirrors the demo workspace persona (Elena Rostova, Agency Director).
 * Real profile data arrives with backend auth (Sprint 1+).
 */
export const MOCK_PROFILE: MockProfile = {
  name: 'Elena Rostova',
  email: 'elena.rostova@nexusagency.co',
  role: 'Agency Director',
  team: 'Client Operations',
  phone: '+1 (415) 555-0132',
  location: 'New York, USA',
  initials: 'ER',
  status: 'active',
  twoFactor: true,
};

export const MOCK_PROFILE_ACTIVITY: ProfileActivityItem[] = [
  {
    id: 'pa1',
    title: 'Approved Brand voice one-pager',
    detail: 'Reviews workspace • Apex Finish',
    time: '2 hrs ago',
  },
  {
    id: 'pa2',
    title: 'Invited Mia Member to workspace',
    detail: 'Users & Access • Team Members',
    time: 'Yesterday',
  },
  {
    id: 'pa3',
    title: 'Exported weekly report',
    detail: 'Dashboard • Executive workspace',
    time: '2 days ago',
  },
];
