import { api } from './client';
import type { Booking, CounselorBooking } from '../types';

export const bookingsApi = {
  create: (data: {
    counselor_id: string;
    start_time: string;
    end_time: string;
    notes?: string;
    type: 'online' | 'physical';
  }) => api.post<{ booking_id: string }>('/bookings', data),

  updateStatus: (bookingId: string, status: 'accepted' | 'declined') =>
    api.put<{ message: string }>(`/bookings/${bookingId}/status`, { status }),

  myBookings: () => api.get<Booking[]>('/bookings/mine'),

  counselorAppointments: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return api.get<CounselorBooking[]>(`/bookings/counselor${query}`);
  },
};
