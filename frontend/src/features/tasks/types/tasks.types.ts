export type TaskStatus = 'completed' | 'delayed' | 'in-progress';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface MockTaskRow {
  id: string;
  title: string;
  project: string;
  assignee: string;
  due: string;
  status: TaskStatus;
  completion: number;
}

export interface MockTask {
  id: string;
  title: string;
  client: string;
  project: string;
  assignee: string;
  dueDate: string;
  completedDate?: string;
  daysOverdue?: number;
  priority: TaskPriority;
  status: 'delayed' | 'completed';
}

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};
