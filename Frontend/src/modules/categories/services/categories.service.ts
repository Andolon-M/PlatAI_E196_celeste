import { axiosInstance } from '@/shared/api';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../types';

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export const categoriesService = {
  getCategories: async (tipo?: string): Promise<Category[]> => {
    const url = tipo ? `/categories?tipo=${tipo}` : '/categories';
    const response = await axiosInstance.get<ApiResponse<Category[]>>(url);
    return response.data.data;
  },

  getCategoryById: async (id: number): Promise<Category> => {
    const response = await axiosInstance.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data.data;
  },

  createCategory: async (data: CreateCategoryDto): Promise<Category> => {
    const response = await axiosInstance.post<ApiResponse<Category>>('/categories', data);
    return response.data.data;
  },

  updateCategory: async (id: number, data: UpdateCategoryDto): Promise<Category> => {
    const response = await axiosInstance.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return response.data.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/categories/${id}`);
  }
};
