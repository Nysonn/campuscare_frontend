import { api } from './client';
import type { BehaviourGoalWithLogs, BehaviourGoal, BehaviourStats } from '../types';

export const behaviourApi = {
  createGoal: (data: {
    title: string;
    direction: 'build' | 'quit';
    start_date: string;
    end_date: string;
  }) => api.post<{ message: string; id: string }>('/behaviour/goals', data),

  getCurrentGoal: () =>
    api.get<{ goal: BehaviourGoalWithLogs | null }>('/behaviour/goals/current'),

  getAllGoals: () =>
    api.get<{ goals: BehaviourGoal[] }>('/behaviour/goals'),

  logDay: (goalId: string, data: { log_date: string; did_it: boolean }) =>
    api.post<{ message: string }>(`/behaviour/goals/${goalId}/logs`, data),

  completeGoal: (goalId: string) =>
    api.post<{ message: string }>(`/behaviour/goals/${goalId}/complete`),

  getStats: (goalId: string) =>
    api.get<BehaviourStats>(`/behaviour/goals/${goalId}/stats`),
};
