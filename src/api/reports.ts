import { api } from './client';

export interface Report {
  id: string;
  reporter_name: string | null;
  subject_name: string;
  subject_contact: string | null;
  university: string | null;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewed' | 'actioned' | 'closed';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export const reportsApi = {
  submit: (data: {
    reporter_name?: string;
    subject_name: string;
    subject_contact?: string;
    university?: string;
    description: string;
    urgency: string;
  }) => api.post<{ message: string; id: string }>('/reports', data),

  adminList: (status?: string) =>
    api.get<Report[]>(`/admin/reports${status ? `?status=${status}` : ''}`),

  adminUpdate: (id: string, data: { status?: string; admin_notes?: string }) =>
    api.put<{ message: string }>(`/admin/reports/${id}`, data),

  adminDelete: (id: string) =>
    api.delete<{ message: string }>(`/admin/reports/${id}`),
};
