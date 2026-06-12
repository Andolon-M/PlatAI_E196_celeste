import { axiosInstance } from '@/shared/api';
import type { SavingsGoal, CreateSavingsGoalDto, UpdateSavingsGoalDto, GoalContribution, CreateContributionDto } from '../types';

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export const savingsGoalsService = {
  getGoals: async (): Promise<SavingsGoal[]> => {
    const response = await axiosInstance.get<ApiResponse<SavingsGoal[]>>('/savings-goals');
    return response.data.data;
  },

  getGoalById: async (id: number): Promise<SavingsGoal> => {
    const response = await axiosInstance.get<ApiResponse<SavingsGoal>>(`/savings-goals/${id}`);
    return response.data.data;
  },

  createGoal: async (data: CreateSavingsGoalDto): Promise<SavingsGoal> => {
    const response = await axiosInstance.post<ApiResponse<SavingsGoal>>('/savings-goals', data);
    return response.data.data;
  },

  updateGoal: async (id: number, data: UpdateSavingsGoalDto): Promise<SavingsGoal> => {
    const response = await axiosInstance.put<ApiResponse<SavingsGoal>>(`/savings-goals/${id}`, data);
    return response.data.data;
  },

  deleteGoal: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/savings-goals/${id}`);
  },

  getContributions: async (goalId: number): Promise<GoalContribution[]> => {
    const response = await axiosInstance.get<ApiResponse<GoalContribution[]>>(`/savings-goals/${goalId}/contributions`);
    return response.data.data;
  },

  createContribution: async (goalId: number, data: CreateContributionDto): Promise<GoalContribution> => {
    const response = await axiosInstance.post<ApiResponse<GoalContribution>>(`/savings-goals/${goalId}/contributions`, data);
    return response.data.data;
  },

  deleteContribution: async (contributionId: number): Promise<void> => {
    await axiosInstance.delete(`/savings-goals/contributions/${contributionId}`);
  }
};
