import { api } from './client';
import type { Testimonial } from '../types';

export const testimonialsApi = {
  /** Public — approved testimonials for the landing page */
  list: () => api.get<Testimonial[]>('/testimonials'),

  /** Student — get their own testimonial (any status). Returns null if none exists. */
  mine: async (): Promise<Testimonial | null> => {
    try {
      const t = await api.get<Testimonial>('/testimonials/mine');
      // server returns 204 (→ {}) when no testimonial exists yet
      return t && (t as { id?: string }).id ? t : null;
    } catch {
      return null;
    }
  },

  /** Student — submit / update their testimonial */
  submit: (content: string) =>
    api.post<Testimonial>('/testimonials', { content }),

  /** Admin — all testimonials */
  adminList: (status?: string) =>
    api.get<Testimonial[]>(`/admin/testimonials${status ? `?status=${status}` : ''}`),

  /** Admin — approve or reject */
  updateStatus: (id: string, status: 'approved' | 'rejected') =>
    api.put<{ message: string }>(`/admin/testimonials/${id}/status`, { status }),

  /** Admin — delete */
  delete: (id: string) =>
    api.delete<{ message: string }>(`/admin/testimonials/${id}`),
};
