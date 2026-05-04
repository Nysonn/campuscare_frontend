import { api } from './client';
import type { Testimonial, MyTestimonialsData } from '../types';

export const testimonialsApi = {
  /** Public — approved testimonials for the landing page */
  list: () => api.get<Testimonial[]>('/testimonials'),

  /** Student — get all their testimonials plus cooldown info */
  mine: () => api.get<MyTestimonialsData>('/testimonials/mine'),

  /** Student — submit a new testimonial */
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
