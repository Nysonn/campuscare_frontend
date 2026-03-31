import { api } from './client';
import type { AdminUser, AdminCampaign, AdminBooking, AdminContribution, AdminDashboard } from '../types';

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

  unapprovedCampaigns: () => api.get<AdminCampaign[]>('/admin/campaigns'),

  updateCampaignStatus: (campaignId: string, status: 'approved' | 'rejected') =>
    api.put<{ message: string }>(`/admin/campaigns/${campaignId}`, { status }),

  deleteCampaign: (campaignId: string) =>
    api.delete<{ message: string }>(`/admin/campaigns/${campaignId}`),

  pendingAccountCampaigns: () => api.get<AdminCampaign[]>('/admin/campaigns/accounts'),

  verifyAccount: (campaignId: string, accountStatus: 'verified' | 'rejected') =>
    api.put<{ message: string }>(`/admin/campaigns/${campaignId}/account`, { account_status: accountStatus }),

  bookings: () => api.get<AdminBooking[]>('/admin/bookings'),

  contributions: () => api.get<AdminContribution[]>('/admin/contributions'),

  exportContributions: () => api.get<Blob>('/admin/contributions/export'),
};
