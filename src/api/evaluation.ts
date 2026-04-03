import { api } from './client';
import type { EvaluationQuestion, EvaluationResult, EvaluationHistoryItem } from '../types';

export const evaluationApi = {
  getQuestions: () =>
    api.get<{ questions: EvaluationQuestion[] }>(`/evaluations/questions?seed=${Date.now()}`),

  submit: (answers: Record<string, number>) =>
    api.post<EvaluationResult>('/evaluations', { answers }),

  getHistory: () =>
    api.get<{ history: EvaluationHistoryItem[] }>('/evaluations/history'),
};
