import { api } from './client';
import type { Campaign, MyCampaign, CampaignAttachment } from '../types';

interface CampaignPayload {
  title: string;
  description: string;
  target_amount: number;
  category: string;
  is_anonymous?: boolean;
  attachments?: CampaignAttachment[];
  urgency_level?: string;
  beneficiary_type?: string;
  beneficiary_name?: string;
  verification_contact_name?: string;
  verification_contact_info?: string;
  beneficiary_org_name?: string;
  bank_name?: string;
  account_number?: string;
  account_holder_name?: string;
}

export const campaignsApi = {
  list: () => api.get<Campaign[]>('/campaigns'),

  mine: () => api.get<MyCampaign[]>('/campaigns/mine'),

  create: (data: CampaignPayload) =>
    api.post<{ campaign_id: string; message: string }>('/campaigns', data),

  update: (id: string, data: CampaignPayload) =>
    api.put<{ message: string }>(`/campaigns/${id}`, data),

  delete: (id: string) => api.delete<{ message: string }>(`/campaigns/${id}`),
};
