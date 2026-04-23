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

  // ── Wallet / General Pool ──────────────────────────────────────────────────
  walletBalance: () => api.get<{
    total_donated: number; total_disbursed: number;
    total_withdrawn: number; balance: number;
  }>('/admin/wallet/balance'),

  walletCampaigns: () => api.get<{
    campaigns: { id: string; title: string; current_amount: number; target_amount: number }[];
  }>('/admin/wallet/campaigns'),

  disburse: (campaign_id: string, amount: number, note: string) =>
    api.post<{ message: string; disbursement_id: string }>('/admin/wallet/disburse', { campaign_id, amount, note }),

  withdraw: (amount: number, destination_type: string, destination_name: string, account_number: string, note: string) =>
    api.post<{ message: string; withdrawal_id: string }>('/admin/wallet/withdraw', {
      amount, destination_type, destination_name, account_number, note,
    }),

  disbursements: () => api.get<{
    disbursements: {
      id: string; campaign_id: string; campaign_title: string;
      amount: number; note: string; created_at: string;
    }[];
  }>('/admin/wallet/disbursements'),

  withdrawals: () => api.get<{
    withdrawals: {
      id: string; amount: number; destination_type: string;
      destination_name: string; account_number: string; note: string; created_at: string;
    }[];
  }>('/admin/wallet/withdrawals'),
};
