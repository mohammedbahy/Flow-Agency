// Tasks feature barrel — live backend (`/api/v1/tasks`, `/api/v1/reports`).
export { TasksPage } from './pages/TasksPage';
export type { TasksTab } from './pages/TasksPage';
export { CompletionRatePage } from './pages/CompletionRatePage';
export { DelayedTasksPage, CompletedTasksPage } from './pages/TaskPages';
export { TaskTable } from './components/TaskTable';
export { tasksService } from './services/tasks.service';
export { BACKEND_TASK_TYPES } from './types/tasks.types';
export type { MockTaskRow, TaskRow, TaskStatus } from './types/tasks.types';
export type {
  ApiTask,
  BackendTaskStatus,
  DelayedTaskItem,
  CompletionRate,
} from './services/tasks.service';
