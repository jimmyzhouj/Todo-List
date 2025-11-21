export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface Task {
  id: string;
  title: string;
  deadline: string; // ISO string from datetime-local
  priority: Priority;
  isCompleted: boolean;
  completedAt?: string; // ISO string
  aiTips?: string;
  isLoadingTips?: boolean;
}

export type TaskStatus = 'todo' | 'done';