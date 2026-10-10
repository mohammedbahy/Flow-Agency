import type { MockTaskRow } from '../types/tasks.types';

/** MOCK task rows shared by the task report pages — UI preview only. */
export const MOCK_TASK_ROWS: MockTaskRow[] = [
  { id: 't1', title: 'Homepage hero copy', project: 'Apex Finish', assignee: 'Mia Member', due: 'Oct 18', status: 'completed', completion: 100 },
  { id: 't2', title: 'TikTok creative set', project: 'Apex Finish', assignee: 'Omar Farouk', due: 'Oct 19', status: 'delayed', completion: 64 },
  { id: 't3', title: 'Brand voice one-pager', project: 'Nexus Retail', assignee: 'Sarah Miller', due: 'Oct 17', status: 'completed', completion: 100 },
  { id: 't4', title: 'Q4 media plan', project: 'Orbit SaaS', assignee: 'Omar Farouk', due: 'Oct 21', status: 'in-progress', completion: 42 },
  { id: 't5', title: 'Landing page QA', project: 'Lumen Health', assignee: 'Mia Member', due: 'Oct 16', status: 'delayed', completion: 78 },
  { id: 't6', title: 'Email drip sequence', project: 'Nexus Retail', assignee: 'Elena Rostova', due: 'Oct 15', status: 'completed', completion: 100 },
];
