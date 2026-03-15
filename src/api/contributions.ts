import { api } from './client';

export const contributionsApi = {
  create: (data: {
    campaign_id: string;
    donor_name: string;
    donor_email: string;
    donor_phone: string;
    message?: string;
    is_anonymous: boolean;
    payment_method: string;
    amount: number;
  }) => api.post<{ contribution_id: string; status: string }>('/contributions', data),

};
