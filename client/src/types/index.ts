export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export type Priority = 'low' | 'medium' | 'high';
export type Category = 'work' | 'personal' | 'project' | 'study' | 'general';

export interface Task {
  id: number;
  user_id: number;
  user_email: string;
  title: string;
  description: string;
  target_date: string; // YYYY-MM-DD
  target_time?: string | null;
  priority: Priority;
  category: Category;
  is_completed: number; // 0 or 1
  reminder_t_minus_2_sent: number;
  reminder_t_minus_1_sent: number;
  reminder_target_day_sent: number;
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: number;
  user_id: number;
  recipient_email: string;
  task_id?: number | null;
  task_title?: string | null;
  reminder_type: 't_minus_2' | 't_minus_1' | 'target_day' | 'test';
  subject: string;
  status: 'sent' | 'simulated' | 'failed';
  error_message?: string | null;
  sent_at: string;
}

export interface SystemStatus {
  status: string;
  serverTime: string;
  gmailConfigured: boolean;
  gmailAccount: string;
  schedulerActive: boolean;
  cronSchedule: string;
}

export interface SweepResults {
  timestamp: string;
  todayDate: string;
  t_minus_2_processed: number;
  t_minus_1_processed: number;
  target_day_processed: number;
  details: Array<{
    taskId: number;
    title: string;
    recipient: string;
    type: string;
    targetDate: string;
    simulated: boolean;
  }>;
  errors: Array<{
    taskId: number;
    type: string;
    error: string;
  }>;
}
