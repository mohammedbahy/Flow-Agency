export type TaskStatus = 'completed' | 'delayed' | 'in-progress';

export interface MockTaskRow {
  id: string;
  title: string;
  project: string;
  assignee: string;
  due: string;
  status: TaskStatus;
  completion: number;
}

/** Backend task type catalogue (`constants/task-types.js`). */
export const BACKEND_TASK_TYPES = ['design', 'content', 'development', 'video', 'seo', 'other'] as const;

/** Live task row for tables (names resolved from directory data). */
export interface TaskRow {
  id: string;
  title: string;
  taskType: string;
  client: string;
  assignee: string;
  dueDate: string;
  completedDate?: string;
  daysOverdue?: number;
  status: 'delayed' | 'completed';
}
