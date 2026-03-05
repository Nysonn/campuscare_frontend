import { api } from './client';
import type { UserProfile } from '../types';

export const authApi = {
  register: (data: {
    email: string;
    password: string;
    role: 'student' | 'counselor';
    full_name: string;
    consent: boolean;
  }) => api.post<{ message: string; user_id: string }>('/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ message: string; user_id: string }>('/login', data),

  logout: () => api.post<{ message: string }>('/logout'),

  getProfile: () => api.get<UserProfile>('/profile'),

  updateProfile: (data: Record<string, unknown>) =>
    api.patch<{ message: string }>('/profile', data),
};
