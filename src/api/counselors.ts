import { api } from './client';
import type { Counselor } from '../types';

export const counselorsApi = {
  list: () => api.get<Counselor[]>('/counselors'),
};
