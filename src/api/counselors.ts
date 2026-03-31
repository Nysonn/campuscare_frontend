import { api } from './client';
import type { Counselor } from '../types';

export const counselorsApi = {
  list: () => api.get<Counselor[]>('/counselors'),
  getById: (id: string) => api.get<Counselor>(`/counselors/${id}`),
};
