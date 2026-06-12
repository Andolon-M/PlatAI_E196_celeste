import { axiosInstance } from '@/shared/api';
import type { Account, CreateAccountDto, UpdateAccountDto, CreateTransferDto } from '../types';

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export const accountsService = {
  getAccounts: async (): Promise<Account[]> => {
    const response = await axiosInstance.get<ApiResponse<Account[]>>('/accounts');
    return response.data.data;
  },

  getAccountById: async (id: number): Promise<Account> => {
    const response = await axiosInstance.get<ApiResponse<Account>>(`/accounts/${id}`);
    return response.data.data;
  },

  createAccount: async (data: CreateAccountDto): Promise<Account> => {
    const response = await axiosInstance.post<ApiResponse<Account>>('/accounts', data);
    return response.data.data;
  },

  updateAccount: async (id: number, data: UpdateAccountDto): Promise<Account> => {
    const response = await axiosInstance.put<ApiResponse<Account>>(`/accounts/${id}`, data);
    return response.data.data;
  },

  deleteAccount: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/accounts/${id}`);
  },

  createTransfer: async (data: CreateTransferDto): Promise<void> => {
    await axiosInstance.post(`/accounts/transfer`, data);
  }
};
