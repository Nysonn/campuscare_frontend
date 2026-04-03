import { api } from './client';
import type { AdminUser, AdminCampaign, AdminBooking, AdminContribution, AdminDashboard, AdminCounselor } from '../types';

export const adminApi = {
  dashboard: () => api.get<AdminDashboard>('/admin/dashboard'),

  users: (role?: string, page?: number) => {
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (page) params.set('page', String(page));
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<AdminUser[]>(`/admin/users${query}`);
  },

  updateUserStatus: (userId: string, status: 'active' | 'suspended') =>
    api.put<{ message: string }>(`/admin/users/${userId}/status`, { status }),

  campaigns: (status: string) => api.get<AdminCampaign[]>(`/admin/campaigns?status=${status}`),

  updateCampaignStatus: (campaignId: string, status: 'approved' | 'rejected') =>
    api.put<{ message: string }>(`/admin/campaigns/${campaignId}`, { status }),

  verifyAccount: (campaignId: string, account_status: 'verified' | 'rejected') =>
    api.put<{ message: string }>(`/admin/campaigns/${campaignId}/account`, { account_status }),

  deleteCampaign: (campaignId: string) =>
    api.delete<{ message: string }>(`/admin/campaigns/${campaignId}`),

  counselors: (status: 'pending' | 'approved' | 'rejected' | 'all' = 'pending') =>
    api.get<AdminCounselor[]>(`/admin/counselors?status=${status}`),

  verifyCounselor: (id: string, status: 'approved' | 'rejected') =>
    api.put<{ message: string }>(`/admin/counselors/${id}/verify`, { status }),

  bookings: () => api.get<AdminBooking[]>('/admin/bookings'),

  contributions: () => api.get<AdminContribution[]>('/admin/contributions'),

  exportContributions: () => api.get<Blob>('/admin/contributions/export'),
};
