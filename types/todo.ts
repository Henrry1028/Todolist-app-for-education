export type Priority = 'P1' | 'P2' | 'P3' | 'P4';

export type Category = 'work' | 'personal' | 'study';
export type CategoryFilter = 'all' | 'work' | 'personal' | 'study';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'weekdays' | 'monthly';

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface TimeBlock {
  startTime: string; // HH:mm format, e.g. "09:00"
  endTime: string;   // HH:mm format, e.g. "10:30"
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: Priority;
  category: Category; // 'work' | 'personal' | 'study'
  dueDate?: string; // ISO string e.g. "2026-09-16"
  timeBlock?: TimeBlock;
  recurrence: RecurrenceType;
  subtasks: SubTask[];
  tags: string[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null; // e.g. "2026-09-16"
  totalCompleted: number;
  completionHistory?: Record<string, number>; // YYYY-MM-DD -> completed count
}

export type SmartFilterType = 'inbox' | 'today' | 'upcoming' | 'p1' | 'completed';
export type ViewModeType = 'list' | 'timeline' | 'weekly' | 'monthly';
export type NavigationFilter = SmartFilterType;
