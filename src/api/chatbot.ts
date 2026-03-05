import { api } from './client';

export const chatbotApi = {
  send: (message: string) =>
    api.post<{ crisis_flagged: boolean; reply: string }>('/chatbot', { message }),
};
