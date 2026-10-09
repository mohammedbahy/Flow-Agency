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
