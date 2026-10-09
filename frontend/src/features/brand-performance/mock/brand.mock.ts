import type { MockBrand, TeamPerformanceRow } from '../types/brand.types';

/** MOCK brand + team performance — UI preview only. */
export const MOCK_BRANDS: MockBrand[] = [
  { id: 'b1', name: 'Apex Finish', retainer: '$48k/mo', health: 92, onTime: '94.1%', tasksDone: '128/136' },
  { id: 'b2', name: 'Nexus Retail', retainer: '$36k/mo', health: 84, onTime: '88.7%', tasksDone: '96/108' },
  { id: 'b3', name: 'Orbit SaaS', retainer: '$29k/mo', health: 76, onTime: '81.3%', tasksDone: '74/91' },
  { id: 'b4', name: 'Lumen Health', retainer: '$22k/mo', health: 89, onTime: '91.0%', tasksDone: '61/67' },
];

export const MOCK_TEAM_PERFORMANCE: TeamPerformanceRow[] = [
  { id: 'tp1', team: 'Creative & Design', lead: 'Sarah Miller', completion: 91, delayed: 3, throughput: '+18% velocity' },
  { id: 'tp2', team: 'Content Studio', lead: 'Elena Rostova', completion: 86, delayed: 5, throughput: '+9% velocity' },
  { id: 'tp3', team: 'Media Buying', lead: 'Omar Farouk', completion: 79, delayed: 8, throughput: '-4% pacing' },
  { id: 'tp4', team: 'Executive Team', lead: 'Elena Rostova', completion: 95, delayed: 1, throughput: '+22% margin' },
];
