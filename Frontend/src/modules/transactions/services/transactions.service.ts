import { axiosInstance } from '@/shared/api';
import type { 
  Transaction, 
  CreateTransactionDto, 
  UpdateTransactionDto, 
  TransactionFilters,
  PaginatedTransactions
} from '../types';

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export const transactionsService = {
  getTransactions: async (filters?: TransactionFilters): Promise<PaginatedTransactions> => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.id_cuenta) params.append('id_cuenta', String(filters.id_cuenta));
      if (filters.id_categoria) params.append('id_categoria', String(filters.id_categoria));
      if (filters.tipo) params.append('tipo', filters.tipo);
      if (filters.search) params.append('search', filters.search);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.page) params.append('page', String(filters.page));
      if (filters.pageSize) params.append('pageSize', String(filters.pageSize));
    }
    
    const response = await axiosInstance.get<ApiResponse<PaginatedTransactions>>(`/transactions?${params.toString()}`);
    return response.data.data;
  },

  getTransactionById: async (id: number): Promise<Transaction> => {
    const response = await axiosInstance.get<ApiResponse<Transaction>>(`/transactions/${id}`);
    return response.data.data;
  },

  createTransaction: async (data: CreateTransactionDto): Promise<Transaction> => {
    const response = await axiosInstance.post<ApiResponse<Transaction>>('/transactions', data);
    return response.data.data;
  },

  updateTransaction: async (id: number, data: UpdateTransactionDto): Promise<Transaction> => {
    const response = await axiosInstance.put<ApiResponse<Transaction>>(`/transactions/${id}`, data);
    return response.data.data;
  },

  deleteTransaction: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/transactions/${id}`);
  }
};
