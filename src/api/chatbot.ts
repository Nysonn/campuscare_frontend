import { api } from './client';
import type { ChatHistoryItem } from '../types';

export const chatbotApi = {
  send: (message: string) =>
    api.post<{ crisis_flagged: boolean; reply: string }>('/chatbot', { message }),

  history: () => api.get<ChatHistoryItem[]>('/chatbot/history'),
};
