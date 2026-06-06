export type TaskType = 'checkbox' | 'progress';

export type TaskStatus = 'todo' | 'completed';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskProgress {
  current: number;
  target: number;
  unit?: string;
}

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  dueDate?: string;
  progress?: TaskProgress;
}

export type CreatedTask = Omit<Task, 'id' | 'createdAt' | 'status'>;
