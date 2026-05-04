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
  wants_followup: boolean;
  followup_email: string | null;
  pool_helper_name: string | null;
  weekly_reports_count: number;
}

export interface FollowupCase {
  id: string;
  subject_name: string;
  subject_contact: string | null;
  university: string | null;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewed' | 'actioned' | 'closed';
  created_at: string;
  updated_at: string;
  helper_type: 'reporter_followup' | 'sponsor_pool';
  wants_followup: boolean;
}

export interface WelfareReport {
  id: string;
  report_id: string;
  subject_name: string;
  helper_name: string;
  helper_email: string;
  helper_type: 'reporter_followup' | 'sponsor_pool';
  week_of: string;
  wellbeing_score: number;
  observations: string;
  created_at: string;
}

export const reportsApi = {
  submit: (data: {
    reporter_name?: string;
    subject_name: string;
    subject_contact?: string;
    university?: string;
    description: string;
    urgency: string;
    wants_followup?: boolean;
    followup_email?: string;
  }) => api.post<{ message: string; id: string; wants_followup: boolean }>('/reports', data),

  myFollowups: () =>
    api.get<FollowupCase[]>('/reports/my-followups'),

  listPool: () =>
    api.get<FollowupCase[]>('/reports/pool'),

  claimPool: (id: string) =>
    api.post<{ message: string }>(`/reports/${id}/claim`, {}),

  listWelfareReports: (id: string) =>
    api.get<WelfareReport[]>(`/reports/${id}/welfare-reports`),

  submitWelfareReport: (id: string, data: { week_of?: string; wellbeing_score: number; observations: string }) =>
    api.post<{ message: string; id: string }>(`/reports/${id}/welfare-reports`, data),

  adminList: (status?: string) =>
    api.get<Report[]>(`/admin/reports${status ? `?status=${status}` : ''}`),

  adminListWelfare: () =>
    api.get<WelfareReport[]>('/admin/reports/welfare'),

  adminUpdate: (id: string, data: { status?: string; admin_notes?: string }) =>
    api.put<{ message: string }>(`/admin/reports/${id}`, data),

  adminDelete: (id: string) =>
    api.delete<{ message: string }>(`/admin/reports/${id}`),
};
