import { api } from './client';
import type {
  SponsorProfile,
  SponsorRequest,
  Sponsorship,
  MySponsorStatus,
  StreamTokenResponse,
  AdminSponsor,
} from '../types';

export const sponsorsApi = {
  // ── My sponsor status ──────────────────────────────────────────────────────
  myStatus: () =>
    api.get<MySponsorStatus>('/sponsors/me/status'),

  becomeSponsor: (whatIOffer: string) =>
    api.post<{ message: string }>('/sponsors/me', { what_i_offer: whatIOffer }),

  optOut: () =>
    api.delete<{ message: string }>('/sponsors/me'),

  // ── Browse & request ───────────────────────────────────────────────────────
  listSponsors: () =>
    api.get<SponsorProfile[]>('/sponsors'),

  sendRequest: (sponsorId: string) =>
    api.post<{ message: string; request_id?: string }>(`/sponsors/${sponsorId}/request`, {}),

  // ── Request management ─────────────────────────────────────────────────────
  incomingRequests: () =>
    api.get<SponsorRequest[]>('/sponsors/incoming-requests'),

  outgoingRequests: () =>
    api.get<SponsorRequest[]>('/sponsors/my-requests'),

  respondToRequest: (requestId: string, action: 'accepted' | 'declined') =>
    api.put<{ message: string }>(`/sponsor-requests/${requestId}`, { action }),

  cancelRequest: (requestId: string) =>
    api.delete<{ message: string }>(`/sponsor-requests/${requestId}`),

  // ── Active sponsorship + Stream ────────────────────────────────────────────
  mySponsorship: () =>
    api.get<{ sponsorship: Sponsorship | null }>('/sponsorships/mine'),

  terminateSponsorship: () =>
    api.delete<{ message: string }>('/sponsorships/mine'),

  getStreamToken: () =>
    api.get<StreamTokenResponse>('/stream/token'),

  // ── Admin ──────────────────────────────────────────────────────────────────
  adminListSponsors: () =>
    api.get<AdminSponsor[]>('/admin/sponsors'),
};
