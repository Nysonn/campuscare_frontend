import { api } from './client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export const notificationsApi = {
  list: () => api.get<Notification[]>('/notifications'),
  unreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),
  markRead: (id: string) => api.patch<{ message: string }>(`/notifications/${id}/read`, {}),
  markAllRead: () => api.patch<{ message: string }>('/notifications/read-all', {}),
};
