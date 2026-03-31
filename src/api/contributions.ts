import { api } from './client';
import type { ContributionCreateResponse, PaymentMethod } from '../types';

export const contributionsApi = {
  create: (data: {
    campaign_id: string;
    donor_name: string;
    donor_email: string;
    donor_phone: string;
    message?: string;
    is_anonymous: boolean;
    payment_method: PaymentMethod;
    amount: number;
  }) => api.post<ContributionCreateResponse>('/contributions', data),

};
