import { api } from './client';
import type { Campaign, MyCampaign } from '../types';

export const campaignsApi = {
  list: () => api.get<Campaign[]>('/campaigns'),

  mine: () => api.get<MyCampaign[]>('/campaigns/mine'),

  create: (data: {
    title: string;
    description: string;
    target_amount: number;
    category: string;
    is_anonymous?: boolean;
    attachments?: string[];
  }) => api.post<{ campaign_id: string; message: string }>('/campaigns', data),

  update: (id: string, data: {
    title: string;
    description: string;
    target_amount: number;
    category: string;
    is_anonymous?: boolean;
    attachments?: string[];
  }) => api.put<{ message: string }>(`/campaigns/${id}`, data),

  delete: (id: string) => api.delete<{ message: string }>(`/campaigns/${id}`),
};
