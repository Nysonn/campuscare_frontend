import { api } from './client';
import type { UserProfile } from '../types';

export const authApi = {
  register: (data: {
    email: string;
    password: string;
    role: 'student' | 'counselor';
    full_name: string;
    consent: boolean;
    location?: string;
    age?: number;
    years_of_experience?: string;
    licence_url?: string;
  }) => api.post<{ message: string; user_id: string }>('/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ message: string; user_id: string; token: string }>('/login', data),

  logout: () => api.post<{ message: string }>('/logout'),

  getProfile: () => api.get<UserProfile>('/profile'),

  updateProfile: (data: Record<string, unknown>) =>
    api.patch<{ message: string }>('/profile', data),

  forgotPassword: (data: { email: string }) =>
    api.post<{ message: string }>('/forgot-password', data),

  resetPassword: (data: { token: string; password: string }) =>
    api.post<{ message: string }>('/reset-password', data),
};
