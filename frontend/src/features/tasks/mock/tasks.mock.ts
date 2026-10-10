import type { MockTask, MockTaskRow } from '../types/tasks.types';

/** MOCK task rows shared by the task report pages — UI preview only. */
export const MOCK_TASK_ROWS: MockTaskRow[] = [
  { id: 't1', title: 'Homepage hero copy', project: 'Apex Finish', assignee: 'Mia Member', due: 'Oct 18', status: 'completed', completion: 100 },
  { id: 't2', title: 'TikTok creative set', project: 'Apex Finish', assignee: 'Omar Farouk', due: 'Oct 19', status: 'delayed', completion: 64 },
  { id: 't3', title: 'Brand voice one-pager', project: 'Nexus Retail', assignee: 'Sarah Miller', due: 'Oct 17', status: 'completed', completion: 100 },
  { id: 't4', title: 'Q4 media plan', project: 'Orbit SaaS', assignee: 'Omar Farouk', due: 'Oct 21', status: 'in-progress', completion: 42 },
  { id: 't5', title: 'Landing page QA', project: 'Lumen Health', assignee: 'Mia Member', due: 'Oct 16', status: 'delayed', completion: 78 },
  { id: 't6', title: 'Email drip sequence', project: 'Nexus Retail', assignee: 'Elena Rostova', due: 'Oct 15', status: 'completed', completion: 100 },
];

/**
 * MOCK workspace tasks — UI preview only.
 * Shared by the Delayed and Completed task screens.
 * The Backend team replaces these imports with API calls in a later sprint.
 */
export const MOCK_TASKS: MockTask[] = [
  {
    id: 't1', title: 'TikTok cutdowns — batch 2', client: 'Apex Finish', project: 'Q4 Performance Creative',
    assignee: 'Liam Designer', dueDate: 'Oct 6, 2026', daysOverdue: 4, priority: 'high', status: 'delayed',
  },
  {
    id: 't2', title: 'Landing page copy — hero section', client: 'Apex Finish', project: 'Website relaunch',
    assignee: 'Mia Member', dueDate: 'Oct 7, 2026', daysOverdue: 3, priority: 'high', status: 'delayed',
  },
  {
    id: 't3', title: 'Media plan v2 — paid social', client: 'Globex', project: 'Autumn campaign',
    assignee: 'Omar Strategist', dueDate: 'Oct 8, 2026', daysOverdue: 2, priority: 'medium', status: 'delayed',
  },
  {
    id: 't4', title: 'Lookbook print proofs', client: 'Vama Retail', project: 'Autumn Lookbook',
    assignee: 'Amara Kalu', dueDate: 'Oct 9, 2026', daysOverdue: 1, priority: 'medium', status: 'delayed',
  },
  {
    id: 't5', title: 'UGC scripts — week 42', client: 'Umbrella', project: 'Social content Q4',
    assignee: 'Nora Writer', dueDate: 'Oct 9, 2026', daysOverdue: 1, priority: 'low', status: 'delayed',
  },
  {
    id: 't6', title: 'Brand voice one-pager', client: 'Lumina Health', project: 'Brand guidelines',
    assignee: 'Omar Strategist', dueDate: 'Oct 6, 2026', completedDate: 'Oct 6, 2026', priority: 'high', status: 'completed',
  },
  {
    id: 't7', title: 'Homepage hero copy', client: 'Apex Finish', project: 'Website relaunch',
    assignee: 'Mia Member', dueDate: 'Oct 5, 2026', completedDate: 'Oct 4, 2026', priority: 'high', status: 'completed',
  },
  {
    id: 't8', title: 'Product photography selects', client: 'Hooli', project: 'Product launch kit',
    assignee: 'Liam Designer', dueDate: 'Oct 3, 2026', completedDate: 'Oct 3, 2026', priority: 'medium', status: 'completed',
  },
  {
    id: 't9', title: 'Email template QA — mobile', client: 'Vama Retail', project: 'Holiday campaigns',
    assignee: 'Priya Producer', dueDate: 'Oct 2, 2026', completedDate: 'Oct 2, 2026', priority: 'medium', status: 'completed',
  },
  {
    id: 't10', title: 'Q3 performance report', client: 'Globex', project: 'Autumn campaign',
    assignee: 'David Park', dueDate: 'Oct 1, 2026', completedDate: 'Sep 30, 2026', priority: 'low', status: 'completed',
  },
];
