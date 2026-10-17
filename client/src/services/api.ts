import { User, Task, EmailLog, SystemStatus, SweepResults } from '../types';

function getApiBase(): string {
  const custom = localStorage.getItem('custom_api_url');
  if (custom) return custom.replace(/\/+$/, '') + '/api';
  return '/api';
}

function getHeaders(customHeaders: Record<string, string> = {}): HeadersInit {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const base = getApiBase();
  const url = `${base}${endpoint}`;
  const headers = getHeaders(options.headers as Record<string, string>);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    signup: (data: { name: string; email: string; password: string }) =>
      request<{ message: string; token: string; user: User }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (data: { email: string; password: string }) =>
      request<{ message: string; token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    me: () => request<{ user: User }>('/auth/me'),
  },

  // Tasks
  tasks: {
    getAll: (params?: { date?: string; status?: 'completed' | 'pending' }) => {
      let query = '';
      if (params) {
        const q = new URLSearchParams();
        if (params.date) q.append('date', params.date);
        if (params.status) q.append('status', params.status);
        const qs = q.toString();
        if (qs) query = `?${qs}`;
      }
      return request<{ tasks: Task[] }>(`/tasks${query}`);
    },

    create: (data: {
      title: string;
      description?: string;
      target_date: string;
      target_time?: string;
      priority?: string;
      category?: string;
    }) =>
      request<{ message: string; task: Task }>('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: number, data: Partial<Task>) =>
      request<{ message: string; task: Task }>(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: number) =>
      request<{ message: string; taskId: number }>(`/tasks/${id}`, {
        method: 'DELETE',
      }),
  },

  // Email and Reminders
  email: {
    sendTest: () =>
      request<{ success: boolean; message: string; details: any }>('/email/test', {
        method: 'POST',
      }),

    triggerSweep: () =>
      request<{ success: boolean; message: string; results: SweepResults }>('/reminders/trigger-check', {
        method: 'POST',
      }),

    getLogs: () => request<{ logs: EmailLog[] }>('/reminders/logs'),
  },

  // System
  system: {
    getStatus: () => request<SystemStatus>('/system/status'),
  },
};
