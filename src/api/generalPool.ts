import { api } from './client';

export interface GeneralPoolDonation {
  id: string;
  donor_name: string;
  donor_email: string;
  amount: number;
  payment_method: string;
  is_anonymous: boolean;
  status: string;
  created_at: string;
}

export const generalPoolApi = {
  donate: (data: {
    donor_name: string;
    donor_email: string;
    donor_phone: string;
    amount: number;
    message: string;
    payment_method: string;
    is_anonymous: boolean;
  }) => api.post<{ donation_id: string; status: string }>('/donate/general', data),

  list: () => api.get<GeneralPoolDonation[]>('/admin/general-pool'),
};
