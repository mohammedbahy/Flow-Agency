import type { MockTeam } from '../types/teams.types';

/**
 * MOCK teams — UI preview only.
 * Real team membership arrives with backend users module (future sprint).
 */
export const MOCK_TEAMS: MockTeam[] = [
  {
    id: 't1',
    name: 'Creative & Design',
    focus: 'Brand systems & campaign visuals',
    members: 14,
    activeProjects: 9,
    lead: 'Sarah Miller',
    initials: ['SM', 'JK', 'AR', '+11'],
  },
  {
    id: 't2',
    name: 'Content Studio',
    focus: 'Copy, scripts & editorial calendar',
    members: 11,
    activeProjects: 12,
    lead: 'Elena Rostova',
    initials: ['ER', 'MM', 'TP', '+8'],
  },
  {
    id: 't3',
    name: 'Media Buying',
    focus: 'Paid social & performance budgets',
    members: 8,
    activeProjects: 15,
    lead: 'Omar Farouk',
    initials: ['OF', 'DL', 'NS', '+5'],
  },
  {
    id: 't4',
    name: 'Executive Team',
    focus: 'Retainers, margins & escalations',
    members: 5,
    activeProjects: 28,
    lead: 'Elena Rostova',
    initials: ['ER', 'AK', 'SM', '+2'],
  },
];
